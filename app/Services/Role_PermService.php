<?php
    // namespace Services;
    
    // use \Repositories\Database;
    // use \Repositories\Role_PermRepository;
    // use \Repositories\Interface\IBaseRepositoryTransaction;
    // use \Services\Interface\IBaseService;

    // class Role_PermService implements IBaseService{
    //     private IBaseRepositoryTransaction $rolePerm;

    //     public function __construct(){
    //         $this->rolePerm = new Role_PermRepository();
    //     }

    //     function create($data){
    //         $pdo = Database::getInstance()->getConnection();
    //         return $this->rolePerm->create($data, $pdo);
    //     } 

    //     function update($id, $data){
    //         $pdo = Database::getInstance()->getConnection();
    //         return $this->rolePerm->update($id, $data, $pdo);
    //     }

    //     function delete($id){
    //         $pdo = Database::getInstance()->getConnection();
    //         return $this->rolePerm->delete($id, $pdo);
    //     }

    //     function getById($id): array
    //     {
    //         return $this->rolePerm->getById($id);
    //     }
    //     function getAll(): array
    //     {
    //         return $this->rolePerm->getAll();
    //     }
    // }