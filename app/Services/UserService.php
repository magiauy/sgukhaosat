<?php

namespace Services;
use Repositories\IBaseRepository;
use Repositories\UserRepository;
class UserService implements IAuthService
{
    private IBaseRepository $userRepository;

    public function __construct()
    {
        $this->userRepository = new UserRepository();
    }

    public function create($data): bool
    {
        $options = ['cost' => 10];

        foreach ($data as &$row) {
            $row['password'] = password_hash($row['password'], PASSWORD_DEFAULT, $options);
            $row['dateCreate'] = date('Y-m-d H:i:s'); // ✅ Set luôn ngày tạo
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

    public function login($data)
    {
        return $this->userRepository->login($data);
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

    public function getListUsers(): array{
        return $this->userRepository->getListUsers();
    }




}