<?php

namespace Repositories;

use Repositories\Interface\IBaseRepository;
use PDO;

class PermissionRepository implements IBaseRepository
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
    }

    function create($data)
    {
       
    }

    function update($id, $data)
    {
        // TODO: Implement update() method.
    }

    function delete($id)
    {
        // TODO: Implement delete() method.
    }

    function getById($id)
    {
        // var_dump($this->pdo);
        $sql = 'SELECT * FROM permissions WHERE permID = :id';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    function getAll()
    {
        // TODO: Implement getAll() method.
    }

    function getChildrenById($id){
        // var_dump($id);
        $sql = 'SELECT * FROM permissions WHERE permParent = :id';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}