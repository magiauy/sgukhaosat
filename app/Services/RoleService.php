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

    function checkValidPermission($permissionDb, $permissionNew){
        $permissions = [
            ['id' => 'ACCESS_ADMIN', 'parent_id' => 'ACCESS_ROOT'],
            ['id' => 'ACCESS_ROLE_EDITOR', 'parent_id' => 'ACCESS_ROOT'],
            ['id' => 'ACCESS_ROOT', 'parent_id' => null],
            ['id' => 'ACCESS_SETTINGS', 'parent_id' => 'ACCESS_ADMIN'],
            ['id' => 'ADD_FORM', 'parent_id' => 'MANAGE_FORMS'],
            ['id' => 'ADD_FORM_TYPE', 'parent_id' => 'MANAGE_FORM_TYPE'],
            ['id' => 'ADD_MAJOR', 'parent_id' => 'MANAGE_MAJOR'],
            ['id' => 'ADD_PERIOD', 'parent_id' => 'MANAGE_PERIOD'],
            ['id' => 'ADD_USER', 'parent_id' => 'MANAGE_USERS'],
            ['id' => 'ASSIGN_ROLE_USER', 'parent_id' => 'ACCESS_ROLE_EDITOR'],
            ['id' => 'DELETE_FORM', 'parent_id' => 'MANAGE_FORMS'],
            ['id' => 'DELETE_FORM_TYPE', 'parent_id' => 'MANAGE_FORM_TYPE'],
            ['id' => 'DELETE_MAJOR', 'parent_id' => 'MANAGE_MAJOR'],
            ['id' => 'DELETE_PERIOD', 'parent_id' => 'MANAGE_PERIOD'],
            ['id' => 'DELETE_RESULT', 'parent_id' => 'MANAGE_RESULTS'],
            ['id' => 'DELETE_USER', 'parent_id' => 'MANAGE_USERS'],
            ['id' => 'EDIT_ANOTHER_ROLE', 'parent_id' => 'ACCESS_ROLE_EDITOR'],
            ['id' => 'EDIT_FORM', 'parent_id' => 'MANAGE_FORMS'],
            ['id' => 'EDIT_FORM_TYPE', 'parent_id' => 'MANAGE_FORM_TYPE'],
            ['id' => 'EDIT_MAJOR', 'parent_id' => 'MANAGE_MAJOR'],
            ['id' => 'EDIT_PERIOD', 'parent_id' => 'MANAGE_PERIOD'],
            ['id' => 'EDIT_ROLE_ADMIN', 'parent_id' => 'ACCESS_ROOT'],
            ['id' => 'EDIT_USER', 'parent_id' => 'MANAGE_USERS'],
            ['id' => 'MANAGE_FORMS', 'parent_id' => 'ACCESS_ADMIN'],
            ['id' => 'MANAGE_FORM_TYPE', 'parent_id' => 'ACCESS_ADMIN'],
            ['id' => 'MANAGE_MAJOR', 'parent_id' => 'ACCESS_ADMIN'],
            ['id' => 'MANAGE_PERIOD', 'parent_id' => 'ACCESS_ADMIN'],
            ['id' => 'MANAGE_RESULTS', 'parent_id' => 'ACCESS_ADMIN'],
            ['id' => 'MANAGE_ROLES', 'parent_id' => 'ACCESS_ADMIN'],
            ['id' => 'MANAGE_USERS', 'parent_id' => 'ACCESS_ADMIN'],
            ['id' => 'VIEW_FORM', 'parent_id' => 'MANAGE_FORMS'],
            ['id' => 'VIEW_FORM_TYPE', 'parent_id' => 'MANAGE_FORM_TYPE'],
            ['id' => 'VIEW_MAJOR', 'parent_id' => 'MANAGE_MAJOR'],
            ['id' => 'VIEW_PERIOD', 'parent_id' => 'MANAGE_PERIOD'],
            ['id' => 'VIEW_RESULT', 'parent_id' => 'MANAGE_RESULTS'],
            ['id' => 'VIEW_USER', 'parent_id' => 'MANAGE_USERS'],
        ];
        
        $parentMap = [];
        foreach ($permissions as $perm) {
            $parentMap[$perm['id']] = $perm['parent_id'];
        }

        $checkPermission = false;
        while(isset($parentMap[$permissionNew])){
            $parentPermission = $parentMap[$permissionNew];
            if($permissionDb === $parentPermission){
                $checkPermission = true;
                break;
            }
            $permissionNew = $parentPermission;
        }

        if($checkPermission) return true;
        else return false;
    }

    function validPermission($data){
        $permissionsDb = $this->rolePermRepository->getById($data['roleID']); //lấy permission của roleID tương ứng trong database

        foreach($permissionsDb as $permissionDb){
            $check;
            foreach($data['permissions'] as $permissionNew){
                $check = $this->checkValidPermission($permissionDb['permID'], $permissionNew);
                // var_dump($check);
                if(!$check) break;
            }
            if(!$check){
                throw new \Exception('Lỗi ! Role của tài khoản không quản lí permission muốn thêm');
            }
        }
    }
}