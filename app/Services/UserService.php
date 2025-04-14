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

}