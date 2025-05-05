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
        $sql = 'INSERT INTO roles (roleName) VALUES (:roleName)';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'roleName' => $data['roleName']
        ]);
        return $stmt->rowCount() === 1;
    }

    function update($id, $data, \PDO $pdo){
        $sql = 'UPDATE roles SET roleName = :roleName WHERE roleID = :id';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'roleName' => $data['roleName'],
            'id' => $id
        ]);
        return $stmt->rowCount() === 1;
    }

    function delete($id, \PDO $pdo): bool
    {
        $sql = 'DELETE FROM roles WHERE roleID in (:roleID)';
        $id = implode(', ', array_values($id));
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['roleID' => $id]);
        return $stmt->rowCount();
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
}