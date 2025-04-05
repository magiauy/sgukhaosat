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
            $response->json(['Message' => "Created successfully"]);
        }catch (\Throwable $e){
            $response->json(['Error' => $e->getMessage()], $e->getCode());
        }
    }

    public function update(Response $response, Request $request){
        try {
           $data = $request->getBody();
           $this->roleService->update($data['roleID'], $data);
           $response->json(['Message' => "Updated successfully"], 200);
        }catch (\Throwable $e){
            $response->json(['error ' => $e->getMessage()], $e->getCode() ? $e->getCode() : 500);
        }
    }

    public function delete(Response $response, Request $request){
        try {
            $data = $request->getBody();
            $id = $data['roleID'];
            $role = $this->roleService->delete($id);
            $response->json(['Message: ' => 'Deleted successfully']);
        }catch (\Throwable $e){
            $code =
            $response->json(['error' => $e->getMessage()], 500);
        }
    }

        
    public function getById(Response $response, Request $request){
        try {
            $data = $request->getBody();
            $id = $data['roleID'];
            $role = $this->roleService->getById($id);
            $response->json([
                'Message' => 'Successfully',
                'Data' => $role
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