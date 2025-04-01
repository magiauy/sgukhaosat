<?php

namespace Services;

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

    function create($data)
    {
        // TODO: Implement create() method.
    }

    function update($id, $data)
    {
        // TODO: Implement update() method.
    }

    function delete($id)
    {
        // TODO: Implement delete() method.
    }

    function getById($id)
    {
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

    function getAll()
    {
        // TODO: Implement getAll() method.
    }
}