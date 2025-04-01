<?php

namespace Services;

use Repositories\Database;
use Repositories\Interface\IBaseRepositoryTransaction;
use Repositories\Role_PermRepository;
use Repositories\RoleRepository;
use Services\Interface\IBaseService;

class RoleService implements IBaseService
{
    private IBaseRepositoryTransaction $roleRepository;
    private IBaseRepositoryTransaction $rolePermRepository;

    public function __construct()
    {
        $this->roleRepository = new RoleRepository();
        $this->rolePermRepository = new Role_PermRepository();
    }

    function create($data): bool
    {
        $pdo = Database::getInstance()->getConnection();
        return $this->roleRepository->create($data, $pdo);        
    }

    function update($id, $data): bool
    {
        $pdo = Database::getInstance()->getConnection();
        return $this->roleRepository->update($id, $data, $pdo);   
    }

    function delete($id): bool
    {
        $pdo = Database::getInstance()->getConnection();
        return $this->roleRepository->delete($id, $pdo);   
    }

    function getById($id)
    {
        // $pdo = Database::getInstance()->getConnection();
        try {
            $role = $this->roleRepository->getById($id);
            if ($role) {
                $permissions = $this->rolePermRepository->getById($id);
                return [
                    'role' => $role,
                    'permissions' => $permissions
                ];
            } else {
                throw new \Exception('Role not found');
            }
        }catch (\Exception $exception){
            return [
                'error' => $exception->getMessage()
            ];
        }
    }

    function getAll(): array
    {
        return $this->roleRepository->getAll();
    }
}