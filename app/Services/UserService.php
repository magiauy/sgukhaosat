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

    public function register($data)
    {
        return $this->userRepository->register($data);
    }

    public function logout()
    {
        return $this->userRepository->logout();
    }

    public function me()
    {
        return $this->userRepository->me();
    }





}