<?php

namespace Repositories;

use Repositories\Interface\IBaseRepositoryTransaction;

class Role_PermRepository implements IBaseRepositoryTransaction
{
    private $pdo;

    public function __construct(){
        $this->pdo = Database::getInstance()->getConnection();
    }

    
    function create($data, \PDO $pdo)
    {
        $roleID = $data['roleID'];
        foreach($data['permissions'] as $permID){
            $arrValue[] = "('{$roleID}', '{$permID}')";
        }
        
        $valuesString = implode(", ", $arrValue);
        $sql = "INSERT INTO role_permission (roleID, permID) VALUES {$valuesString}";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        return $stmt->rowCount();
    }

    function update($id, $data, \PDO $pdo)
    {
    }

    //roleID là mảng
    function delete($id, \PDO $pdo)
    {
        $sql = 'DELETE FROM role_permission WHERE roleID in (:roleID)';
        $stmt = $pdo->prepare($sql);
        $id = implode(',', array_values($id));
        $stmt->execute([
            'roleID' => $id
        ]);
        return $stmt->rowCount();
    }

    function getById($id): array
    {
        $sql = 'SELECT permID FROM role_permission WHERE roleID = :id';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        $data = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        // print_r($data);  
        return $data;
        // return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    function getAll(): array
    {
        $sql = 'SELECT * FROM role_permission';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}