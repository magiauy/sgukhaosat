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

    // $data vào: {
    //     "roleID": ""
    //     "permissions": []
    // }
    function create($data)
    {
        try {
            $pdo = Database::getInstance()->getConnection();
            $pdo->beginTransaction();

            $this->validPermission($data);
            print_r("ok");

            //Nếu permission và roleID đều hợp lệ
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

    // $data vào: {
    //     "roleID": ""
    //     "permissions": []
    // }
    // $id = $data['roleID];
    function update($id, $data)
    {
        $pdo = Database::getInstance()->getConnection();
        $pdo->beginTransaction();
        if(empty($id)){
            throw new \Exception("Thiếu dữ liệu", 400);
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