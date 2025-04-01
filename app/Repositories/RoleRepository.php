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
        $sql = 'INSERT INTO roles (roleId, roleName) VALUES (:roleId, :roleName)';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'roleId' => $data['roleId'],
            'roleName' => $data['roleName']
        ]);
        return $stmt->rowCount() === 1;
    }

    function update($id, $data, \PDO $pdo): bool
    {
        $sql = 'UPDATE roles
                SET roleName = :roleName
                WHERE roleId = :roleId;
        ';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'roleId' => $id,
            'roleName' => $data['roleName']
        ]);
        return $stmt->rowCount() === 1;
    }

    function delete($id, \PDO $pdo): bool
    {
        $sql = 'DELETE FROM roles WHERE roleId = :roleId';
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['roleId' => $id]);
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
        $sql = "SELECT * FROM roles";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}