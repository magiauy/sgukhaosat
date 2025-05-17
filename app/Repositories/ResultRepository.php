<?php

namespace Repositories;

use PDO;
use Repositories\Interface\IResultRepository;

class ResultRepository implements IResultRepository
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
    }

    function create($data, \PDO $pdo): bool|string
    {
        try {
            $sql = "INSERT INTO result (FID, UID, Date) VALUES (:FID, :UID, :Date)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':FID' => $data['FID'],
                ':UID' => $data['UID'],
                ':Date' => date('Y-m-d H:i:s')
            ]);
            return $pdo->lastInsertId();
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function update($id, $data, \PDO $pdo): bool
    {
        try {
            $sql = "UPDATE result SET FID = :FID, UID = :UID, Date = :Date WHERE RID = :RID";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':RID' => $id,
                ':FID' => $data['FID'],
                ':UID' => $data['UID'],
                ':Date' => $data['Date']
            ]);
            return $stmt->rowCount() > 0;
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function delete($id, \PDO $pdo): bool
    {
        try {
            $sql = "DELETE FROM result WHERE RID = :RID";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':RID' => $id]);
            return $stmt->rowCount() > 0;
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function getById($id): array|false
    {
        try {
            $sql = "SELECT * FROM result WHERE RID = :RID";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':RID' => $id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function getAll(): array
    {
        try {
            $sql = "SELECT * FROM result ORDER BY Date DESC";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function getByForm($formId): array
    {
        try {
            $sql = "SELECT r.*, u.fullName, u.email FROM result r 
                    LEFT JOIN users u ON r.UID = u.email 
                    WHERE r.FID = :FID 
                    ORDER BY r.Date DESC";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':FID' => $formId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function getByUser($userId): array
    {
        try {
            $sql = "SELECT r.*, f.FName FROM result r 
                    LEFT JOIN forms f ON r.FID = f.FID 
                    WHERE r.UID = :UID 
                    ORDER BY r.Date DESC";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':UID' => $userId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function getByFormAndUser($formId, $userId): array
    {
        try {
            $sql = "SELECT * FROM result WHERE FID = :FID AND UID = :UID ORDER BY Date DESC";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':FID' => $formId,
                ':UID' => $userId
            ]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    function countByForm($formId): int
    {
        try {
            $sql = "SELECT COUNT(*) FROM result WHERE FID = :FID";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':FID' => $formId]);
            return (int) $stmt->fetchColumn();
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }

    /**
     * Count all responses
     */
    public function countAll() {
        $sql = "SELECT COUNT(*) as totalResponses FROM result";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetch(\PDO::FETCH_ASSOC)['totalResponses'];
    }

    /**
     * Get response counts grouped by form
     */
    public function getResponseCounts() {
        $sql = "SELECT FID, COUNT(*) as responseCount FROM result GROUP BY FID";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get response trend for a form
     */
    public function getResponseTrend($formId, $timeframe, $days) {
        $sql = "SELECT DATE(Date) as responseDate, COUNT(*) as responseCount 
                FROM result 
                WHERE FID = :formId AND Date >= DATE_SUB(CURDATE(), INTERVAL :days DAY) 
                GROUP BY responseDate 
                ORDER BY responseDate";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':formId' => $formId, ':days' => $days]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get time analysis statistics
     */
    public function getTimeAnalysis() {
        $sql = "SELECT HOUR(Date) as hour, COUNT(*) as responseCount 
                FROM result 
                GROUP BY hour 
                ORDER BY hour";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function deleteResult(int $responseId)
    {
        try {
            $sql = "DELETE FROM result WHERE RID = :RID";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':RID' => $responseId]);
            return $stmt->rowCount() > 0;
        } catch (\PDOException $e) {
            throw new \RuntimeException($e->getMessage(), $e->getCode());
        }
    }
}