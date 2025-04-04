<?php
    // namespace Controllers;
    
    // use Services\Role_PermService;
    // use \Controllers\Interface\IBaseController;
    // use \Services\Interface\IBaseService;
    // use Core\Request;
    // use Core\Response;

    // class Role_PermController implements IBaseController{
    //     private IBaseService $rolePerm;

    //     public function __construct(){
    //         $this->rolePerm = new Role_PermService();
    //     }

    //     function create(Response $response, Request $request){
    //         try {
    //             $_rolePerm = $this->rolePerm->create($request->getBody());
    //             if($_rolePerm){
    //                 $response->json(['Message: ' => 'Created Successfully']);
    //             }
    //             else $response->json(['Message: ' => 'Created Failed'], 500);
    //         } catch (\Throwable $th) {
    //             $response->json(['Error: ' => $th->getMessage()], 500);
    //         }
    //     }

    //     function update(Response $response, Request $request){
    //         try {
    //             $data = $request->getBody();
    //             if(empty($data['roleID']) || empty($data['permID'])){
    //                 throw new \Exception('Missing data', 400);
    //             }

    //             $id = $data['roleID'];        
    //             $_rolePerm = $this->rolePerm->update($id, $data);
    //             if($_rolePerm){
    //                 $response->json(['Message: ' => 'Updated successfully'], 200);     
    //             }
    //             else{
    //                 throw new \Exception('Update failed', 500);
    //             }
    //         } catch (\Throwable $th) {
    //             $response->json(['Error: ' => $th->getMessage()], $th->getCode());     
    //         }
    //     }
    //     function delete(Response $response, Request $request){
    //         try {
    //             $id = $request->getBody();
    //             if(empty($id['roleID']) || empty($id['permID'])){
    //                 throw new Execption ('Missing data', 400);
    //             }
    //             $role_perm = $this->rolePerm->delete($id);
    //             if($role_perm){
    //                 $response->json(['Message: ' => 'Deleted successfully'], 200); 
    //             }
    //             else{
    //                 throw new \Exception('Deleted failed', 500);
    //             }
    //         } catch (\Throwable $th) {
    //             $response->json(['Error: ' => $th->getMessage()], $th->getCode());     
    //         }
    //     }

    //     function getById(Response $response, Request $request){
    //         try {
    //             $id = $request->getParam('id');
    //             $role_perm = $this->rolePerm->getById($id);
    //             if($role_perm){
    //                 $response->json([
    //                     'Message: ' => 'Getted successfully',
    //                     'Data: ' => $role_perm
    //                 ], 200); 
    //             }
    //             else{
    //                 throw new \Exception('Getted failed', 500);
    //             }
    //         } catch (\Throwable $th) {
    //             $response->json(['Error: ' => $th->getMessage()], $th->getCode());     
    //         }
    //     }
    //     function getAll(Response $response, Request $request){
    //         try {
    //             $role_perm = $this->rolePerm->getAll();
    //             $response->json(['Message: ' => 'Getted successfully', 'Data: ' => $role_perm]);
    //         } catch (\Throwable $th) {
    //             $response->json(['Error: ' => $th->getMessage()], $th->getCode());   
    //         }
    //     }
    // }