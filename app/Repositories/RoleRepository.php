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

    function create($data, \PDO $pdo)
    {
    }

    function update($id, $data, \PDO $pdo)
    {
        // TODO: Implement update() method.
    }

    function delete($id, \PDO $pdo)
    {
        // TODO: Implement delete() method.
    }

    function getById($id)
    {
        $sql = "SELECT * FROM roles WHERE roleID = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    function getAll()
    {
        // TODO: Implement getAll() method.
    }
}