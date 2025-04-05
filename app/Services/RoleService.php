<?php

namespace Services;

use Repositories\Database;
use Repositories\Interface\IBaseRepositoryTransaction;
use Repositories\Interface\IAuthRepository;
use Repositories\Role_PermRepository;
use Repositories\UserRepository;
use Repositories\RoleRepository;
use Services\Interface\IBaseService;

class RoleService implements IBaseService
{
    private IBaseRepositoryTransaction $roleRepository;
    private IBaseRepositoryTransaction $rolePermRepository;
    private IAuthRepository $user; 

    public function __construct()
    {
        $this->roleRepository = new RoleRepository();
        $this->rolePermRepository = new Role_PermRepository();
        $this->user = new UserRepository();
    }

    function create($data)
    {
        try {
            $pdo = Database::getInstance()->getConnection();
            $pdo->beginTransaction();
    
            if(empty($data['roleID']) || empty($data['roleName'])){
                throw new \Exception('Missing data', 400);
            }
            try {
                $this->roleRepository->create($data, $pdo);
            } catch (\Throwable $th) {
                throw new \Exception("Error when create role", 400);
            }
           
            if(!empty($data['permission'])){
                try {
                    $this->rolePermRepository->create($data, $pdo);
                } catch (\Throwable $th) {
                    throw new \Exception("Error when create permission for role", 400);
                }
            }

            // Nếu cả hai đều thành công, commit transaction
            $pdo->commit();
        } catch (\Throwable $th) {
            $pdo->rollBack();
            throw $th;
        }
           
    }

    function update($id, $data)
    {
        $pdo = Database::getInstance()->getConnection();
        $pdo->beginTransaction();
        if(empty($id) || empty($data['permission'])){
            throw new \Exception("Missing data", 400);
        }

        try {
            try {
                $this->rolePermRepository->delete($id, $pdo);
            } catch (\Throwable $th) {
                throw new \Exception("Error when delete role_perm", 500);
            }
            try {
                $this->rolePermRepository->create($data, $pdo);  
            } catch (\Throwable $th) {
                throw new \Exception("Error when create role_perm", 500);
            }
            $pdo->commit();
        } catch (\Throwable $th) {
            $pdo->rollBack();
            throw $th;
        }
        
    }

    function delete($id)
    {
        $pdo = Database::getInstance()->getConnection();
        if(!$id){
            throw new \Exception('Missing data', 400);            
        }
        $rolePerm = $this->rolePermRepository->delete($id, $pdo);
        $user = $this->user->deleteByRoleID($id);
        $role = $this->roleRepository->delete($id, $pdo);
    }

//    function getById($id)
//    {
//        try {
//            if(!$id){
//                throw new \Exception('Missing data', 400);
//            }
//            try {
//                $role['role'] = $this->roleRepository->getById($id);
//            } catch (\Throwable $th) {
//                throw new \Exception("Error when getById role", 500);
//                //throw $th;
//            }
//            try {
//                $permission = $this->rolePermRepository->getById($id);
//            } catch (\Throwable $th) {
//                throw new \Exception("Error when getById role_perm", 500);
//                //throw $th;
//            }
//
//            $role['permissions'] = array_column($permission, 'permID');
//            return $role;
//        } catch (\Throwable $th) {
//            throw $th;
//        }
//    }
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
        $roleArr = $this->roleRepository->getAll();
        foreach($roleArr as &$role){
            $permission = $this->rolePermRepository->getById($role['roleID']);
            $role['permission'] = array_column($permission, 'permID');
        }
        unset($role);
        return $roleArr;
    }
}