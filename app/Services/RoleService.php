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
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['updated_at'] = date('Y-m-d H:i:s');

            
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
        if(empty($id)){
            throw new \Exception('Thiếu dữ liệu', 400);            
        }
        try {
            $pdo = Database::getInstance()->getConnection();
            $pdo->beginTransaction();
            $this->rolePermRepository->delete($id, $pdo);
            $this->user->updateRoleIDForDelete($id); //$id đang là mảng
            $this->roleRepository->delete($id, $pdo);
            $pdo->commit();
        } catch (\Throwable $th) {
            $pdo->rollBack();
            throw $th;
        }      
    }

    function getById($id)
    {
        // $pdo = Database::getInstance()->getConnection();  
        try {
            $role = $this->roleRepository->getById($id);
            $permissions = $this->rolePermRepository->getById($id);
            return [
                'role' => $role,
                'permissions' => $permissions
            ];
        } catch (\Throwable $th) {
            throw $th;
        }
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

    function getOnPagination($data){
        try {
            if($data['isFilter']){
                if($data['fromDateCreate'] == "" && $data['toDateCreate'] == ""){
                    $data['isCreate'] = 0;
                }
                else if($data['fromDateCreate'] == "" || $data['toDateCreate'] == ""){
                    throw new \Exception('Thiếu dữ liệu', 400);
                }
                else{
                    $data['isCreate'] = 1;
                    $data['fromDateCreate'] = $data['fromDateCreate'] . ' 00:00:00';
                    $data['toDateCreate'] = $data['toDateCreate'] . ' 23:59:59';
                }

                if($data['fromDateUpdate'] == "" && $data['toDateUpdate'] == ""){
                    $data['isUpdate'] = 0;
                }
                else if($data['fromDateUpdate'] == "" || $data['toDateUpdate'] == ""){
                    throw new \Exception('Thiếu dữ liệu', 400);
                }
                
                else{
                    $data['isUpdate'] = 1;
                     $data['fromDateUpdate'] = $data['fromDateUpdate'] . ' 00:00:00';
                    $data['toDateUpdate'] = $data['toDateUpdate'] . ' 23:59:59';
                }

                if($data['option'] == 'created_desc'){
                    $data['optionString'] = 'ORDER BY created_at DESC';
                }
                else if($data['option'] == 'created_asc'){
                    $data['optionString'] = 'ORDER BY created_at ASC';
                }
                else if($data['option'] == 'updated_desc'){
                    $data['optionString'] = 'ORDER BY updated_at DESC';
                }
                else if($data['option'] == 'updated_asc'){
                    $data['optionString'] = 'ORDER BY updated_at ASC';
                }
                else{
                    throw new \Exception('Thiếu dữ liệu', 400);
                }
            }
            else{
                //mặc định là thời gian tạo mới nhất
                $data['optionString'] = 'ORDER BY created_at DESC';
            }

            if(!isset($data['limit']) || !isset($data['offset'])){
                $data['limitString'] = '';
            }
            else{
                $data['limitString'] = 'LIMIT ' . (int) $data['offset'] . ', ' . (int) $data['limit'];               
            }

            if(!isset($data['isSearch'])){
                $data['isSearch'] = 0;
            }

            return [
                'roles' => $this->roleRepository->getOnPagination($data),
                'total' => $this->roleRepository->getTotalRecord($data)
            ];
        } catch (\Throwable $th) {
            throw $th;
        } 
    }
}