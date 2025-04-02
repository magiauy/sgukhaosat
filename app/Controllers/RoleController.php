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
                $response->json(['message' => "Role is created successfully"]);
            }
            else $response->json(['message' => 'Failed'], 500);
        }catch (\Exception $e){
            $response->json(['error' => $e->getMessage()], $e->getCode());
        }
    }

    public function update(Response $response, Request $request){
        try {
            $roleId = $request->getParam('roleId');
            if(!$roleId){
                $response->json(['message' => "Miss data"], 500);
                return;
            }
            $data = $request->getBody();
            $role = $this->roleService->update($roleId, $data);
            if($role){
                $response->json(['message' => "Role is updated successfully"]);
            }
            else $response->json(['message' => 'Failed'], 500);
        }catch (\Exception $e){
            $response->json(['error' => $e->getMessage()], $e->getCode());
        }
    }

    public function delete(Response $response, Request $request){
        try {
            $roleId = $request->getParam('roleId');
            if(!$roleId){
                $response->json(['message' => 'Miss data'], 500);
                return;
            }
            $role = $this->roleService->delete($roleId);
            if($role){
                $response->json(['message' => 'Deleted role successfully']);
            }
            else $response->json(['message' => 'Deleted role failed']);
        }catch (\Exception $e){
            $response->json(['error' => $e->getMessage()], $e->getCode());
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
                'message:' => 'Successfully',
                'data' => $role
            ]);
        }catch (\Exception $e){
            $response->json(['error' => $e->getMessage()], $e->getCode());
        }
    }

    public function getAll(Response $response, Request $request){
        try {
            $role = $this->roleService->getAll();
            $response->json([
                'message: ' => 'Successfully',
                'data: ' => $role
            ]);
        }catch (\Exception $e){
            $response->json(['error' => $e->getMessage()], $e->getCode());
        }
    }



}