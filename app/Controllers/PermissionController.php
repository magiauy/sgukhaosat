<?php

namespace Controllers;

use Controllers\Interface\IBaseController;
use Services\Interface\IBaseService;
use Services\PermissionService;
use Core\Request;
use Core\Response;

class PermissionController implements IBaseController{
    private IBaseService $permService;

    public function __construct(){
        $this->permService = new PermissionService();
    }

    function create(Response $response, Request $request){}
    function update(Response $response, Request $request){}
    function delete(Response $response, Request $request){}
    function getById(Response $response, Request $request){
        $data = $request->getBody();
        try {
            $perm = $this->permService->getById($data['permID']);
            $response->json(['Message' => 'Successfully', 'Data' => $perm]);
        } catch (\Throwable $th) {
            $response->json(['Error' => $th->getMessage()], 500);
        } 
    }
    function getAll(Response $response, Request $request){}
}