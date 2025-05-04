<?php

namespace Services;
use Core\jwt_helper;
use Exception;
use Repositories\Interface\IBaseRepository;
use Repositories\UserRepository;
use Services\Interface\IAuthService;
use Services\Interface\IBaseService;

class UserService implements IAuthService
{
    private IBaseRepository $userRepository;
    private IBaseService $roleService;

    public function __construct()
    {
        $this->userRepository = new UserRepository();
        $this->roleService = new RoleService();
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
                error_log("Secret loaded, fetching role ID: " . $user['user']['roleId']);
                
                $roleData = $this->roleService->getById($user['user']['roleId']);
                
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

}