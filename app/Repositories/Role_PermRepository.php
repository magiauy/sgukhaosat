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
        $arrValue = [];
        foreach($data['permission'] as $value){
            $arrValue[] = "('{$data['roleID']}', '{$value}')";
        }
        $valuesString = implode(", ", $arrValue);
        $sql = "INSERT INTO role_permission (roleID, permID) VALUES {$valuesString}";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        return $stmt->rowCount();
    }

    function update($id, $data, \PDO $pdo)
    {
        $sql = 'UPDATE role_permission SET permID = :permID WHERE roleID = :_role';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'permID' => $data['permID'],
            '_role' => $id
        ]);
        return $stmt->rowCount();
    }

    function delete($id, \PDO $pdo)
    {
        $sql = 'DELETE FROM role_permission WHERE roleID = :roleID';
        $stmt = $pdo->prepare($sql);
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
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    function getAll(): array
    {
        $sql = 'SELECT * FROM role_permission';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}