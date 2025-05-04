<?php

namespace Services;
use Core\jwt_helper;
use Exception;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Repositories\Interface\IBaseRepository;
use Repositories\Interface\IWhitelistForm;
use Repositories\UserRepository;
use Repositories\WhitelistForm;
use Services\Interface\IAuthService;
use Services\Interface\IBaseService;
use Utils\PasswordUtils;

class UserService implements IAuthService
{
    private IBaseRepository $userRepository;
    private IBaseService $roleService;
    private IWhitelistForm $whitelistForm;

    public function __construct()
    {
        $this->userRepository = new UserRepository();
        $this->roleService = new RoleService();
        $this->whitelistForm = new WhitelistForm();
    }

    public function create($data): bool
    {
        $data['roleId'] = !empty($data['roleId']) ? $data['roleId'] : 'USER';
        //kiểm tra dữ liệu rỗng
        $options = ['cost' => 8];

        if (!is_array(reset($data))) {
            $data = [$data];
        }
        
        foreach ($data as &$row) {
            $row['password'] = password_hash($row['password'], PASSWORD_DEFAULT, $options);
            $row['dateCreate'] = $row['dateCreate'] ?? date('Y-m-d H:i:s'); // Gán ngày tạo nếu chưa có
            $row['status'] = $row['status'] ?? 1; // Gán trạng thái mặc định là 1 nếu chưa có
        }

        unset($row);

        return $this->userRepository->create($data);
    }

    public function update($id,$data): bool
    {
        return $this->userRepository->update($id,$data);
    }

    public function delete($id): bool
    {
        return $this->userRepository->delete($id);
    }

    public function getById($id)
    {
        return $this->userRepository->getById($id);
    }

    public function getAll(): array
    {
        return $this->userRepository->getAll();
    }

    /**
     * @throws Exception
     */
    public function login($data)
    {
        try {
            $user['user'] = $this->userRepository->login($data);
            if ($user['user']) {
                $jwtHelper = new jwt_helper();
                $secret = require __DIR__ . '/../../config/JwtConfig.php';
                $roleData = $this->roleService->getById($user['user']['roleId']);
//                print_r($roleData);
                if ($roleData) {
                    $user['role'] = $roleData['role'];
                    $user['permissions'] = $roleData['permissions'];
//                    $user['roleData'] = $roleData;
                } else {
                    throw new Exception("Không tìm thấy quyền truy cập", 401);
                }

                $user['token'] = $jwtHelper->createJWT($user, $secret, 3600);
                unset($user['user']);
                unset($user['role']);
                unset($user['permissions']);
                return $user;
            }
        } catch (Exception $e) {
            if ($e->getCode() == 401) {
                throw new Exception($e->getMessage(), 401);
            } else {
                throw new Exception("Lỗi đăng nhập: " . $e->getMessage(), 500);
            }
        } catch (\Throwable $e) {
            throw new Exception("Lỗi không xác định: " . $e->getMessage(), 500);
        }
        return null;
    }

    public function register($data): \Error
    {
        return $this->userRepository->register($data);
    }

    public function logout()
    {
        //TODO: Xóa token và session
    }

    public function me()
    {
        //TODO: Lấy thông tin người dùng từ token
    }

    // public function getListUsers(): array{
    //     return $this->userRepository->getListUsers();
    // }

    function getAllWithoutWhitelist($id)
    {
        $allUsers = $this->getAll();
        $whitelistUsers = $this->whitelistForm->getByFormID($id);
        // Extract UIDs from whitelist users
        $whitelistUIDs = array_column($whitelistUsers, 'UID');

        // Filter out users who are already in the whitelist
        $filteredUsers = array_filter($allUsers, function($user) use ($whitelistUIDs) {
            return !in_array($user['email'], $whitelistUIDs);
        });
        return array_values($filteredUsers); // Re-index array
    }

    /**
     * Parse Excel file and extract emails, separating existing and new ones
     *
     * @param array $file Uploaded file data
     * @return array Array with existingUsers and newEmails
     * @throws Exception If file processing fails
     */
    public function parseEmailsFromExcel(array $file): array
    {
        // Import PhpSpreadsheet
        require_once __DIR__ . '/../../vendor/autoload.php';

        $reader = IOFactory::createReaderForFile($file['tmp_name']);
        $spreadsheet = $reader->load($file['tmp_name']);
        $worksheet = $spreadsheet->getActiveSheet();
        $emails = [];

        // Process each row and extract emails
        foreach ($worksheet->getRowIterator() as $row) {
            $cellIterator = $row->getCellIterator();
            $cellIterator->setIterateOnlyExistingCells(false);

            foreach ($cellIterator as $cell) {
                $value = $cell->getValue();
                if (filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $emails[] = $value;
                }
            }
        }

        // Remove duplicates
        $emails = array_unique($emails);

        // Check which emails exist in the system by delegating to repository
        $existingUsers = $this->userRepository->getUsersByEmails($emails);

        // Get list of existing emails
        $existingEmails = array_column($existingUsers, 'email');

        // Filter new emails
        $newEmails = array_values(array_filter($emails, function($email) use ($existingEmails) {
            return !in_array($email, $existingEmails);
        }));

        return [
            'existingUsers' => $existingUsers,
            'newEmails' => $newEmails
        ];
    }

    /**
     * Create multiple user accounts at once
     *
     * @param array $emails List of email addresses
     * @param string $role Role to assign to new users
     * @return array List of created users
     * @throws Exception If user creation fails
     */
    public function createUsersInBulk(array $emails, string $role = 'USER'): array
    {
        $batchData = [];
        $emailsForLookup = [];

        // Prepare batch data for all users at once
        foreach ($emails as $email) {
            $password = PasswordUtils::generateDefaultPassword($email);

            $batchData[] = [
                'email' => $email,
                'password' => password_hash($password, PASSWORD_DEFAULT, ['cost' => 8]),
                'dateCreate' => date('Y-m-d H:i:s'),
                'status' => 1,
                'roleId' => 'USER',
                'position' => $role,
            ];

            $emailsForLookup[] = $email;
        }

        // Use the repository's create method to insert all records at once
        if (!empty($batchData)) {
            $this->userRepository->create($batchData);

            // Retrieve all created users in a single query
            $createdUsers = $this->userRepository->getUsersByEmails($emailsForLookup);

            // Format the response data
            foreach ($createdUsers as &$user) {
                $user['role'] = $role;
                $user['position'] = $role;
                $user['name'] = $user['name'] ?? explode('@', $user['email'])[0];
            }

            return $createdUsers;
        }

        return [];
    }
}