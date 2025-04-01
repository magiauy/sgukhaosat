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
        //kiểm tra dữ liệu rỗng
        foreach($data as $user){
            if(empty($user['email']) || empty($user['password'])){
                echo json_encode(["error" => true, "message" => "dữ liệu rỗng"]);
                return false;
            }
        }
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
                $user['token'] = $jwtHelper->createJWT($user['user'], $secret, 900);
                $roleData = $this->roleService->getById($user['user']['roleId']);
                return array_merge($user, $roleData);
            }
        } catch (Exception $e) {
            if ($e->getCode() == 401) {
                throw new Exception($e->getMessage(), 401);
            } else {
                throw new Exception("Lỗi đăng nhập: " . $e->getMessage(), 500);
            }
        }
        return null;
    }

    public function register($data): \Error
    {
        return $this->userRepository->register($data);
    }

    public function logout(): \Error
    {
        return $this->userRepository->logout();
    }

    public function me(): \Error
    {
        return $this->userRepository->me();
    }

    // public function getListUsers(): array{
    //     return $this->userRepository->getListUsers();
    // }

}