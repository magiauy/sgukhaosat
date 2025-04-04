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
        $sql = 'INSERT INTO roles (roleID, roleName) VALUES (:roleID, :roleName)';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'roleID' => $data['roleID'],
            'roleName' => $data['roleName']
        ]);
        return $stmt->rowCount() === 1;
    }

    function update($id, $data, \PDO $pdo){}

    function delete($id, \PDO $pdo): bool
    {
        $sql = 'DELETE FROM roles WHERE roleID = :roleID';
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
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}