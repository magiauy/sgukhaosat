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

    
    // data từ frontend: {
    //     "roleName": ""
    //     "permissions": []
    // }
    public function create(Response $response, Request $request){
        try {  
            $data = $request->getBody();
            $role = $this->roleService->create($data);
            $response->json(['Message' => "Created successfully"]);
        }catch (\Throwable $e){
            $response->json(['Error' => $e->getMessage()], $e->getCode());
        }
    }

    // $data từ frontend: {
    //     "roleID": ""
    //     "roleName": ""
    //     "permissions": []
    // }
    public function update(Response $response, Request $request){
        try {
           $data = $request->getBody();
           $this->roleService->update($data['roleID'], $data); 
           $response->json(['message' => "Updated successfully"], 200);
        }catch (\Throwable $e){
            $response->json(['error ' => $e->getMessage()], $e->getCode() ? $e->getCode() : 500);
        }
    }

    // $data từ frontend: {
    //     "roleID": []
    public function delete(Response $response, Request $request){
        try {
            $data = $request->getBody();
            $id = $data['roleID'];
            $this->roleService->delete($id);
            $response->json(['message: ' => 'Deleted successfully']);
        }catch (\Throwable $e){
            $response->json(['error' => $e->getMessage()]);
        }
    }

        
    public function getById(Response $response, Request $request){
        try {
            $id = $request->getParam('id');
            $role = $this->roleService->getById($id);
            $response->json([
                'message' => 'Successfully',
                'data' => $role
            ]);
        }catch (\Throwable $th){
            $response->json(['Error' => $th->getMessage()], $th->getCode());
        }
    }

    public function getAll(Response $response, Request $request){
        try {
         
            $role = $this->roleService->getAll();
          
            $response->json([
                'message' => 'Successfully',
                'data' => $role
            ]);
        }catch (\Exception $e){
            $response->json(['error' => $e->getMessage()], $e->getCode());
        }
    }



}