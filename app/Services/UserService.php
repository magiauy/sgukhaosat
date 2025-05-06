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
        // var_dump($data);

        $data['roleID'] = !empty($data['roleID']) ? $data['roleID'] : '1';
        //kiểm tra dữ liệu rỗng
        $options = ['cost' => 8];

        if (!is_array(reset($data))) {
            $data = [$data];
        }
        // error_log(json_encode($data));
        // $data = createUsersInBulk($data);
        // error_log($data);

        foreach ($data as &$row) {
            // $row['password'] = (string) $row['password'];
            $row['password'] = password_hash($row['password'], PASSWORD_DEFAULT, $options);
            $row['dateCreate'] = $row['dateCreate'] ?? date('Y-m-d H:i:s'); // Gán ngày tạo nếu chưa có
            $row['status'] = $row['status'] ?? 1; // Gán trạng thái mặc định là 1 nếu chưa có
            // var_dump($row);
        }

        unset($row);

        return $this->userRepository->create($data);
    }

    public function update($id,$data): bool
    {
        
        return $this->userRepository->update($id,$data);
    }

    //id là mảng
    public function delete($id): bool
    {
        if(empty($id)){
            throw new \Exception("thiếu id", 400);
        }
        try {
            $this->userRepository->delete($id);
            return true;
        } catch (\Throwable $th) {
            throw $th;
        }
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
            // Validate required fields
            if (!isset($data['email']) || !isset($data['password'])) {
                throw new Exception("Email và mật khẩu không được để trống", 400);
            }

            // Debug log - remove in production
            error_log("Login attempt for email: " . $data['email']);

            // Try to login with repository
            $user['user'] = $this->userRepository->login($data);
            
            if ($user['user']) {
                // Debug log - remove in production
                error_log("User found, fetching role data");
                
                $jwtHelper = new jwt_helper();
                $secret = require __DIR__ . '/../../config/JwtConfig.php';
                
                // Debug log - remove in production
                error_log(\json_encode($user));
                error_log("Secret loaded, fetching role ID: " . $user['user']['roleID']);
                
                $roleData = $this->roleService->getById($user['user']['roleID']);
                
                // Debug log - remove in production
                error_log("Role data fetched: " . ($roleData ? "success" : "failed"));
                
                if ($roleData) {
                    $user['role'] = $roleData['role'];
                    $user['permissions'] = $roleData['permissions'];
                } else {
                    throw new Exception("Không tìm thấy quyền truy cập", 401);
                }

                // Generate JWT token
                try {
                    $user['token'] = $jwtHelper->createJWT($user, $secret, 3600);
                } catch (Exception $e) {
                    error_log("JWT creation failed: " . $e->getMessage());
                    throw new Exception("Lỗi tạo token: " . $e->getMessage(), 500);
                }
                
                // Clean up sensitive data
                unset($user['user']['password']);
                
                return $user;
            }
            
            // This should never be reached as the repository would throw an exception if login fails
            throw new Exception("Đăng nhập thất bại", 401);
            
        } catch (Exception $e) {
            // Log the error - helpful for debugging
            error_log("Login error: " . $e->getMessage() . " (code: " . $e->getCode() . ")");
            
            if ($e->getCode() == 401) {
                throw new Exception($e->getMessage(), 401);
            } else {
                throw new Exception("Lỗi đăng nhập: " . $e->getMessage(), $e->getCode() ?: 500);
            }
        } catch (\Throwable $e) {
            error_log("Unexpected login error: " . $e->getMessage());
            throw new Exception("Lỗi không xác định: " . $e->getMessage(), 500);
        }
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
        // error_log("Creating users in bulk: " . json_encode($emails));
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
                'roleID' => 'USER',
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

    public function resetPassword($email)
    {
        // Generate a new password
        $newPassword = PasswordUtils::generateDefaultPassword($email);
        
        $options = ['cost' => 8];
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT, $options);
        error_log("Mật khẩu mới: " . $hashedPassword);
        // Update the user's password in the database
        try {
            $this->userRepository->resetPassword($email, $hashedPassword);
        } catch (\Throwable $th) {
            throw $th;
        }
    }
}