<?php

namespace Repositories;

use PDO;
use Repositories\Interface\IdGenerator;
use Repositories\Interface\IDraftRepository;

class DraftRepository implements IDraftRepository, IdGenerator
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
    }

    function create($data): bool|string
    {
        try {
            $sql = "INSERT INTO draft ( UID, DraftContent,FID, CreateAt, UpdateAt) VALUES (:UID, :DraftContent,:FID, :CreateAt, :UpdateAt)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':UID'         => $data['UID'],
                ':DraftContent'=> $data['DraftContent'],
                ':FID'         => $data['FID'],
                ':CreateAt'    => date('Y-m-d H:i:s'),
                ':UpdateAt'    => date('Y-m-d H:i:s')
            ]);
            return $this->pdo->lastInsertId();
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function update($id, $data): bool
    {
        try {
            $sql = "UPDATE draft SET DraftContent = :DraftContent, UpdateAt = :UpdateAt WHERE FID = :FID";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':FID'          => $id,
                ':DraftContent' => json_encode($data),
                ':UpdateAt'     => date('Y-m-d H:i:s')
            ]);
            return $stmt->rowCount() > 0;
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function delete($id): bool
    {
        try {
            $sql = "DELETE FROM draft WHERE DID = :DID";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':DID' => $id
            ]);
            return $stmt->rowCount() > 0;
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function getById($id)
    {
        try {
            $sql = "SELECT * FROM draft WHERE DID = :DID";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':DID' => $id
            ]);

            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function getAll(): array
    {
        try {
            $sql = "SELECT * FROM draft";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function getByUserID($id): array
    {
        try {
            $sql = "SELECT * FROM draft WHERE UID = :UID";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':UID' => $id
            ]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function getNextId()
    {
        try {
            $sql = "SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'draft'";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['AUTO_INCREMENT'];
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function getByFormID($id)
    {
        try {
            $sql = "SELECT * FROM draft WHERE FID = :FID";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':FID' => $id
            ]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }

    }
}