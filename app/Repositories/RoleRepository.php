<?php

namespace Repositories;

use Repositories\Interface\IBaseRepositoryTransaction;

class RoleRepository implements IBaseRepositoryTransaction
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
    }

    function create($data, \PDO $pdo): bool
    {
        // var_dump($data);
        
        $sql = 'INSERT INTO roles (roleID, roleName, acceptDelete, created_at, updated_at) VALUES (:roleID, :roleName, :acceptDelete, :created_at, :updated_at)';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'roleID' => $data['roleID'],
            'roleName' => $data['roleName'],
            'acceptDelete' => $data['acceptDelete'],
            'created_at' => $data['created_at'],
            'updated_at' => $data['updated_at']
        ]);
        return $stmt->rowCount() === 1;
    }

    function update($id, $data, \PDO $pdo){
        $sql = 'UPDATE roles SET roleName = :roleName, updated_at = :updated_at WHERE roleID = :roleID';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'roleName' => $data['roleName'],
            'updated_at' => $data['updated_at'],
            'roleID' => $data['roleID']
        ]);
        return $stmt->rowCount() === 1;
    }

    function delete($id, \PDO $pdo)
    {
        $placeholders = implode(',', array_fill(0, count($id), '?'));
        $sql = "DELETE FROM roles WHERE roleID IN ($placeholders)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(array_values($id));
    }

    function getById($id)
    {
        $sql = 'SELECT * FROM roles WHERE roleID = :id';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    function getAll()
    {
        $sql = 'SELECT * FROM roles';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        $data = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        // print_r($data);
        return $data;
        // return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    function getByName($name)
    {
        $sql = 'SELECT * FROM roles WHERE roleName = :name';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['name' => $name]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    function getOnPagination($data){
        // var_dump($data);

        $sql = "SELECT * FROM roles 
        WHERE (
            (:isFilter = 0) OR 
            (
                (:isCreate = 0 OR (created_at BETWEEN :fromDateCreate AND :toDateCreate))
                AND 
                (:isUpdate = 0 OR (updated_at BETWEEN :fromDateUpdate AND :toDateUpdate))
            )
        )
        AND (
            (:isSearch = 0) OR (roleID = :search)
        )
        {$data['optionString']} 
        {$data['limitString']}";


        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
// Safely handle empty date strings by converting them to null
            'fromDateCreate' => (!empty($data['fromDateCreate'])) ? $data['fromDateCreate'] : null,
            'toDateCreate' => (!empty($data['toDateCreate'])) ? $data['toDateCreate'] : null,
            'fromDateUpdate' => (!empty($data['fromDateUpdate'])) ? $data['fromDateUpdate'] : null,
            'toDateUpdate' => (!empty($data['toDateUpdate'])) ? $data['toDateUpdate'] : null,
            'isCreate' => $data['isCreate'] ?? 0,
            'isUpdate' => $data['isUpdate'] ?? 0,
            'isFilter' => $data['isFilter'],
            'isSearch' => $data['isSearch'],
            'search' => $data['search'] ?? 0,
        ]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    function getTotalRecord($data){
        // var_dump($data);
        $sql = 'SELECT COUNT(*) FROM roles 
        WHERE (
            (:isFilter = 0) OR 
            (
                (:isCreate = 0 OR (created_at BETWEEN :fromDateCreate AND :toDateCreate))
                AND 
                (:isUpdate = 0 OR (updated_at BETWEEN :fromDateUpdate AND :toDateUpdate))
            )
        )
        AND (
            (:isSearch = 0) OR (roleID = :search)
        )';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'fromDateCreate' => (!empty($data['fromDateCreate'])) ? $data['fromDateCreate'] : null,
            'toDateCreate' => (!empty($data['toDateCreate'])) ? $data['toDateCreate'] : null,
            'fromDateUpdate' => (!empty($data['fromDateUpdate'])) ? $data['fromDateUpdate'] : null,
            'toDateUpdate' => (!empty($data['toDateUpdate'])) ? $data['toDateUpdate'] : null,
            'isCreate' => $data['isCreate'] ?? 0,
            'isUpdate' => $data['isUpdate'] ?? 0,
            'isFilter' => $data['isFilter'],
            'isSearch' => $data['isSearch'],
            'search' => $data['search'] ?? 0,
        ]);
        return $stmt->fetchColumn();
    }
}