<?php

namespace Repositories;

use PDO;
use Repositories\Interface\IAnswerRepository;

class AnswerRepository implements IAnswerRepository
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
    }

    function create($data, \PDO $pdo): bool
    {
        try {
            $sql = "INSERT INTO answer (RID, QID, AContent) VALUES (:RID, :QID, :AContent)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':RID' => $data['RID'],
                ':QID' => $data['QID'],
                ':AContent' => $data['AContent']
            ]);
            return $stmt->rowCount() > 0;
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function getBulkCreate($answers, $resultId, \PDO $pdo): bool
    {
        try {
            if (empty($answers)) {
                error_log("AnsRepository::getBulkCreate - No answers provided for result ID: {$resultId}");
                return true; 
            }

            $values = [];
            $params = [];
            
            foreach ($answers as $index => $answer) {
                $qidKey = ":QID{$index}";
                $contentKey = ":AContent{$index}";
                
                $values[] = "(:RID, {$qidKey}, {$contentKey})";
                $params[':RID'] = $resultId;
                $params[$qidKey] = $answer['QID'];
                $params[$contentKey] = $answer['AContent'];
            }
            
            $sql = "INSERT INTO answer (RID, QID, AContent) VALUES " . implode(', ', $values);
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            error_log("AnsRepository::getBulkCreate - Inserted " . $stmt->rowCount() . " answers for result ID: {$resultId}");
            return true;
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function update($id, $data, \PDO $pdo): bool
    {
        try {
            $sql = "UPDATE answer SET AContent = :AContent WHERE QID = :QID AND RID = :RID";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':QID' => $id,
                ':RID' => $data['RID'],
                ':AContent' => $data['AContent']
            ]);
            return $stmt->rowCount() > 0;
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function delete($id, \PDO $pdo): bool
    {
        try {
            $sql = "DELETE FROM answer WHERE QID = :QID AND RID = :RID";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':QID' => $id['QID'],
                ':RID' => $id['RID']
            ]);
            return $stmt->rowCount() > 0;
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function getById($id)
    {
        try {
            // Get by question ID and result ID
            $sql = "SELECT * FROM answer WHERE QID = :QID AND RID = :RID";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':QID' => $id['QID'],
                ':RID' => $id['RID']
            ]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function getAll(): array
    {
        try {
            $sql = "SELECT * FROM answer";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function getByResult($resultId): array
    {
        try {
            $sql = "SELECT a.*, q.QContent, q.QTypeID 
                    FROM answer a
                    JOIN question q ON a.QID = q.QID
                    WHERE a.RID = :RID";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':RID' => $resultId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function getByQuestion($questionId): array
    {
        try {
            $sql = "SELECT a.*, r.UID, r.Date 
                    FROM answer a
                    JOIN result r ON a.RID = r.RID
                    WHERE a.QID = :QID
                    ORDER BY r.Date DESC";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':QID' => $questionId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function getAnswerStatistics($formId, $questionId): array
    {
        try {
            $sql = "SELECT a.AContent, COUNT(*) as count
                    FROM answer a
                    JOIN result r ON a.RID = r.RID
                    WHERE r.FID = :FID AND a.QID = :QID
                    GROUP BY a.AContent
                    ORDER BY count DESC";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':FID' => $formId,
                ':QID' => $questionId
            ]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }
    function countAll(){
        try {
            $sql = "SELECT COUNT(*) as total FROM answer";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }
}