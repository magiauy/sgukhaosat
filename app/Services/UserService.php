<?php

namespace Services;
use Repositories\IBaseRepository;
use Repositories\UserRepository;
class UserService implements IBaseService
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





}