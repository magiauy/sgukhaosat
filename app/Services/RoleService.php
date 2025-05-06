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

   
    function create($data){
        try {
            $pdo = Database::getInstance()->getConnection();
            $pdo->beginTransaction();

            if(empty($data['roleName']) || empty($data['permissions'])){
                throw new \Exception('Thiếu dữ liệu', 400);
            }
            $data['acceptDelete'] = 1;
            
            $this->roleRepository->create($data, $pdo);
            $this->rolePermRepository->create($data, $pdo);
            
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
        if(empty($id) || empty($data['permissions'])){
            throw new \Exception("Thiếu dữ liệu", 400);
        }

        try {
            $data['updated_at'] = date('Y-m-d H:i:s');
            $this->roleRepository->update($id, $data, $pdo);
            $this->rolePermRepository->delete([$id], $pdo);
            $this->rolePermRepository->create($data, $pdo); 
            $pdo->commit();
        } catch (\Throwable $th) {
            $pdo->rollBack();
            throw $th;
        }
        
    }

    function delete($id)
    {
        $pdo = Database::getInstance()->getConnection();
        if(empty($id)){
            throw new \Exception('Thiếu dữ liệu', 400);            
        }
        try {
            $rolePerm = $this->rolePermRepository->delete($id, $pdo);
            $this->user->updateRoleIDForDelete($id); //$id đang là mảng
            $this->roleRepository->delete($id, $pdo);
        } catch (\Throwable $th) {
            throw $th;
        }      
    }

    function getById($id)
    {
        // $pdo = Database::getInstance()->getConnection();  
        try {
            $role = $this->roleRepository->getById($id);
            $permissions = $this->rolePermRepository->getById($id);
        } catch (\Throwable $th) {
            throw $th;
        }

        return [
            'role' => $role,
            'permissions' => $permissions
        ];
    }

    function getAll(): array
    {      
        $roleArr = $this->roleRepository->getAll();
        foreach($roleArr as &$role){
            // var_dump($role['roleID']);
            $permissions = $this->rolePermRepository->getById($role['roleID']);
            
            $role['permissions'] = $permissions;
        }
        unset($role);
        return $roleArr;
    }
}