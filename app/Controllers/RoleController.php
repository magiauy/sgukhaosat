<?php

namespace Controllers;

use Controllers\Interface\IBaseController;
use Services\Interface\IBaseService;
use Services\RoleService;
use Core\Request;
use Core\Response;

class RoleController implements IBaseController{
    private IBaseService $roleService;

    public function __construct(){
        $this->roleService = new RoleService();
    }

    
    public function create(Response $response, Request $request){
        try {  
            $data = $request->getBody();
            $role = $this->roleService->create($data);
            if($role){
                $response->json(['Message' => "Role is created successfully"]);
            }
            else $response->json(['Message' => 'Failed'], 500);
        } catch (\Throwable $th) {
            $response->json(['error' => $th->getMessage()], 500);
        }
    }

    public function update(Response $response, Request $request){
        try {
            $roleId = $request->getParam('roleId');
            if(!$roleId){
                $response->json(['Message' => "Miss data"], 500);
                return;
            }
            $data = $request->getBody();
            $role = $this->roleService->update($roleId, $data);
            if($role){
                $response->json(['Message' => "Role is updated successfully"]);
            }
            else $response->json(['Message' => 'Failed'], 500);
        } catch (\Throwable $th) {
            $response->json(['error' => $th->getMessage()], 500);
        }
    }

    public function delete(Response $response, Request $request){
        try {
            $roleId = $request->getParam('roleId');
            if(!$roleId){
                $response->json(['Message: ' => 'Miss data'], 500);
                return;
            }
            $role = $this->roleService->delete($roleId);
            if($role){
                $response->json(['Message: ' => 'Deleted role successfully']);
            }
            else $response->json(['Message: ' => 'Deleted role failed']);
        } catch (\Throwable $th) {
            $response->json(['Error: ' => $th->getMessage()]);
        }
    }

        
    public function getById(Response $response, Request $request){
        try {
            $roleId = $request->getParam('roleId');
            if(!$roleId){
                $response->json(['Message:' => 'Miss data'], 500);
            }
            $role = $this->roleService->getById($roleId);
            if(!$role){
                $response->json(['Message:' => 'Get Failed'], 500);
                return;
            }
            $response->json([
                'Message:' => 'Successfully',
                'Data' => $role
            ]);
        } catch (\Throwable $th) {
            $response->json(['Error: ' => $th->getMessage()], 500);
        }
    }

    public function getAll(Response $response, Request $request){
        try {
            $role = $this->roleService->getAll();
            $response->json([
                'Message: ' => 'Successfully',
                'Data: ' => $role
            ]);
        } catch (\Throwable $th) {
            $response->json(['Error: ' => $th->getMessage()], 500);
        }
    }



}