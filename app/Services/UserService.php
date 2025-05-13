<?php

namespace Services;
use Core\jwt_helper;
use Exception;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Repositories\Interface\IBaseRepository;
use Repositories\Interface\IWhitelistForm;
use Repositories\UserRepository;
use Repositories\Interface\IBaseRepositoryTransaction;
use Repositories\RoleRepository;
use Middlewares\JwtMiddleware;

use Repositories\WhitelistForm;
use Services\Interface\IAuthService;
use Services\Interface\IBaseService;
use Utils\PasswordUtils;

class UserService implements IAuthService
{
    private IBaseRepository $userRepository;
    private IBaseRepositoryTransaction $roleRepo;
    private IBaseService $roleService;
    private IWhitelistForm $whitelistForm;


    public function __construct()
    {
        $this->userRepository = new UserRepository();
        $this->roleService = new RoleService();
        $this->roleRepo = new RoleRepository();
        $this->whitelistForm = new WhitelistForm();
    }

    public function create($data): bool
    {
        $data['roleID'] = !empty($data['roleID']) ? $data['roleID'] : '1';
        //kiểm tra dữ liệu rỗng
        $options = ['cost' => 8];

        if (!is_array(reset($data))) {
            $data = [$data];
        }

        foreach ($data as &$row) {
            // $row['password'] = (string) $row['password'];
            $row['password'] = password_hash($row['password'], PASSWORD_DEFAULT, $options);
            $row['created_at'] = $row['created_at'] ?? date('Y-m-d H:i:s'); // Gán ngày tạo nếu chưa có
            $row['updated_at'] = $row['updated_at'] ?? date('Y-m-d H:i:s'); // Gán ngày cập nhật nếu chưa có
            $row['status'] = $row['status'] ?? 1; // Gán trạng thái mặc định là 1 nếu chưa có
            // var_dump($row);
        }

        unset($row);

        return $this->userRepository->create($data);
    }


    public function update($id, $data): bool
    {
        try {
            return $this->userRepository->update($id, $data);
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    //id là mảng
    public function delete($id): bool
    {
        if (empty($id)) {
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
                //                error_log("Secret access: " . $secret['access_secret']);
//                error_log("Secret refresh: " . $secret['refresh_secret']);

                // Debug log - remove in production


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

                // var_dump($user);
                // Generate JWT token
                try {
                    $user['token'] = $jwtHelper->createJWT($user, $secret['access_secret'], 600);
                    $user['refreshToken'] = $jwtHelper->createRefreshToken($user, $secret['refresh_secret'], 604800);

                } catch (Exception $e) {
                    error_log("JWT creation failed: " . $e->getMessage());
                    throw new Exception("Lỗi tạo token: " . $e->getMessage(), 500);
                }

                // Clean up sensitive data
                error_log(json_encode($user['refreshToken']));
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
                throw new Exception("Lỗi đăng nhập: " . $e->getMessage(), (int) ($e->getCode() ?: 500));
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
        $filteredUsers = array_filter($allUsers, function ($user) use ($whitelistUIDs) {
            return !in_array($user['email'], $whitelistUIDs);
        });
        return $filteredUsers; // Re-index array
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
        $newEmails = array_values(array_filter($emails, function ($email) use ($existingEmails) {
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
                'fullName' => explode('@', $email)[0],
                'password' => password_hash($password, PASSWORD_DEFAULT, ['cost' => 8]),
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at'=> date('Y-m-d H:i:s'),
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

    public function resetPassword($data)
    { 
        
        $newPassword = '';
        if(!isset($data['newPassword'])){
            // Generate a new password
            $newPassword = PasswordUtils::generateDefaultPassword($data['email']);
            $options = ['cost' => 8];
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT, $options);
            error_log("Mật khẩu mới: " . $hashedPassword);
            // Update the user's password in the database
        }
        else{
            // var_dump($data);
            $tokenString = $_COOKIE['access_token'];
            $tokenData = JwtMiddleware::getDecodedToken($tokenString);
            $user = $tokenData->user;
            // var_dump($user);
            $user = json_decode(json_encode($user), true);
            $currentUser = $this->userRepository->getById($user['email']);
            $currentPassword = $currentUser['password'];
            error_log("Mật khẩu hiện tại: " . $currentPassword);
            if(!password_verify($data['currentPassword'], $currentPassword)){
                throw new \Exception('Mật khẩu hiện tại không đúng', 400);
            }
        
            $newPassword = $data['newPassword'];
            $options = ['cost' => 8];
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT, $options);
            // error_log(json_encode($data));
        }
        try {

            $this->userRepository->resetPassword($data['email'], $hashedPassword);
            // Lấy thông tin user mới từ database sau khi cập nhật
            $updatedUser = $this->userRepository->getById($data['email']);
            unset($updatedUser['password']);
            // Lấy thông tin vai trò và quyền mới
            $roleData = $this->roleService->getById($updatedUser['roleID']);

            if (!$roleData) {
                // Không tìm thấy thông tin vai trò
                throw new \Exception('Không lấy được thông tin vai trò',0);
            }

            // Cập nhật đối tượng user với thông tin mới
        
            $userData = [
                'user' => $updatedUser,
                'role' => $roleData['role'],
                'permissions' => $roleData['permissions']
            ];

            // Tạo token mới với thông tin đã cập nhật
            $jwtHelper = new jwt_helper();
            $secret = require __DIR__ . '/../../config/JwtConfig.php';

            
            // var_dump($userData);
            $accessToken = $jwtHelper->createJWT($userData, $secret['access_secret'], 600);
            $refreshToken = $jwtHelper->createRefreshToken($userData, $secret['refresh_secret'], 604800);

            setcookie('access_token', '', time() - 3600, '/', '', false, true);
            setcookie('refresh_token', '', time() - 3600, '/', '', false, true);
            // Thiết lập cookie mới
            setcookie('access_token', $accessToken, time() + 600, '/', '', false, true);
            setcookie('refresh_token', $refreshToken, time() + 604800, '/', '', false, true);
            
            error_log("Token updated successfully");
            
        } catch (\Throwable $th) {
            throw $th;
        } 
    }

    public function getOnPagination($data)
    {
        if ($data['isFilter']) {
            if ($data['fromDateCreate'] == "" && $data['toDateCreate'] == "") {
                $data['isCreate'] = 0;
            } else if ($data['fromDateCreate'] == "" || $data['toDateCreate'] == "") {
                throw new \Exception('Thiếu dữ liệu', 400);
            } else {
                $data['isCreate'] = 1;
                $data['fromDateCreate'] = $data['fromDateCreate'] . ' 00:00:00';
                $data['toDateCreate'] = $data['toDateCreate'] . ' 23:59:59';
            }

            if ($data['fromDateUpdate'] == "" && $data['toDateUpdate'] == "") {
                $data['isUpdate'] = 0;
            } else if ($data['fromDateUpdate'] == "" || $data['toDateUpdate'] == "") {
                throw new \Exception('Thiếu dữ liệu', 400);
            } else {
                $data['isUpdate'] = 1;
                $data['fromDateUpdate'] = $data['fromDateUpdate'] . ' 00:00:00';
                $data['toDateUpdate'] = $data['toDateUpdate'] . ' 23:59:59';
            }

            if ($data['sortOrder'] == 'created_desc') {
                $data['sortOrderString'] = 'ORDER BY created_at DESC';
            } else if ($data['sortOrder'] == 'created_asc') {
                $data['sortOrderString'] = 'ORDER BY created_at ASC';
            } else if ($data['sortOrder'] == 'updated_desc') {
                $data['sortOrderString'] = 'ORDER BY updated_at DESC';
            } else if ($data['sortOrder'] == 'updated_asc') {
                $data['sortOrderString'] = 'ORDER BY updated_at ASC';
            } else {
                throw new \Exception('Thiếu dữ liệu', 400);
            }
        } else {
            $data['sortOrderString'] = 'ORDER BY updated_at DESC';
        }

        if (!isset($data['limit']) || !isset($data['offset'])) {
            // var_dump($data);
            $data['limitString'] = '';
        } else {
            $data['limitString'] = 'LIMIT ' . (int) $data['offset'] . ', ' . (int) $data['limit'];
        }

        if (!isset($data['isSearch'])) {
            $data['isSearch'] = 0;
        } else if ($data['isSearch']) {
            $data['search'] = '%' . trim($data['search']) . '%';
        }

        if (!isset($data['status'])) {
            $data['isStatus'] = 0;
        } else if ($data['status'] == 'all') {
            $data['isStatus'] = 0;
        }

        if (!isset($data['roleID'])) {
            $data['isRole'] = 0;
        } else if ($data['roleID'] == 'all') {
            $data['isRole'] = 0;
        }

        try {
            $accounts = $this->userRepository->getOnPagination($data);
            $roles = $this->roleRepo->getAll();
            foreach ($accounts as &$account) {
                $account['status'] = (int) $account['status'];
                foreach ($roles as $role) {
                    if ($account['roleID'] == $role['roleID']) {
                        $account['roleName'] = $role['roleName'];
                        break;
                    }
                }
            }
            return [
                'accounts' => $accounts,
                'total' => $this->userRepository->getTotalRecord($data)
            ];
        } catch (\Throwable $th) {
            throw $th;
        }

    }

    public function getByEmail($data)
    {
        try {
            $data['email'] = trim($data['email']);
            return $this->userRepository->getByEmail($data);
        } catch (\Throwable $th) {
            throw $th;
        }
    }


    public function updateInformation($data)
    {
        try {
            $check = $this->userRepository->updateInformation($data);
            $tokenString = $_COOKIE['access_token'];
            $tokenData = JwtMiddleware::getDecodedToken($tokenString);

            if (!$tokenData || !isset($tokenData->user)) {
                // Token không hợp lệ hoặc không có thông tin user
                throw new \Exception('Token không hợp lệ hoặc không có thông tin user', 401);
            }

            $user = $tokenData->user;
            $user = json_decode(json_encode($user), true);

            // Lấy thông tin user mới từ database sau khi cập nhật
            $updatedUser = $this->userRepository->getById($data['email']);

            if (!$updatedUser) {
                // Không thể lấy thông tin user đã cập nhật
                throw new \Exception('Không thể lấy thông tin user đã cập nhật', 404);
            }

            // Lấy thông tin vai trò và quyền mới
            $roleData = $this->roleService->getById($updatedUser['roleID']);

            if (!$roleData) {
                // Không tìm thấy thông tin vai trò
                throw new \Exception('Không lấy được thông tin vai trò',0);
            }

            // Cập nhật đối tượng user với thông tin mới
        
            $userData = [
                'user' => $updatedUser,
                'role' => $roleData['role'],
                'permissions' => $roleData['permissions']
            ];

            // Tạo token mới với thông tin đã cập nhật
            $jwtHelper = new jwt_helper();
            $secret = require __DIR__ . '/../../config/JwtConfig.php';

            
            // var_dump($userData);
            $accessToken = $jwtHelper->createJWT($userData, $secret['access_secret'], 600);
            $refreshToken = $jwtHelper->createRefreshToken($userData, $secret['refresh_secret'], 604800);

            setcookie('access_token', '', time() - 3600, '/', '', false, true);
            setcookie('refresh_token', '', time() - 3600, '/', '', false, true);
            // Thiết lập cookie mới
            setcookie('access_token', $accessToken, time() + 600, '/', '', false, true);
            setcookie('refresh_token', $refreshToken, time() + 604800, '/', '', false, true);
            
            error_log("Token updated successfully");
            return $check;
            
        } catch (\Throwable $th) {
            // Lỗi khi cập nhật token nhưng dữ liệu đã được cập nhật
            error_log("Error updating token after user update: " . $th->getMessage());
            throw new \Exception('Lỗi khi cập nhật thông tin người dùng', 500);
        } 
    }

    /**
     * Kiểm tra email đã tồn tại chưa
     * @param string $email Email cần kiểm tra
     * @return bool True nếu email đã tồn tại
     */
    public function isEmailExists($email): bool
    {
        return $this->userRepository->checkEmailExists($email);
    }
}