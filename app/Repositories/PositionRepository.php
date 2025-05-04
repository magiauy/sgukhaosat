<?php
namespace Repositories;

use PDO;

class PositionRepository {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function getAll(): array {
        $stmt = $this->pdo->query("SELECT * FROM position");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getById(string $id) {
        $stmt = $this->pdo->prepare("SELECT * FROM position WHERE PositionID = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function getTotalCount(): int {
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM position");
        return $stmt->fetchColumn();
    }
    
    public function create(array $data): bool {
        $stmt = $this->pdo->prepare("INSERT INTO position (PositionName) VALUES (?)");
        return $stmt->execute([
            $data['PositionName']
        ]);
    }

    public function update(string $id, array $data): bool {
        $stmt = $this->pdo->prepare("UPDATE position SET PositionName = ? WHERE PositionID = ?");
        return $stmt->execute([
            $data['PositionName'],
            $id
        ]);
    }

    public function delete(string $id): bool {
        $stmt = $this->pdo->prepare("DELETE FROM position WHERE PositionID = ?");
        return $stmt->execute([$id]);
    }

    public function getPaginated($limit, $offset) {
        $stmt = $this->pdo->prepare("SELECT * FROM position LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    public function searchPaginated($keyword, $limit, $offset) {
        $stmt = $this->pdo->prepare("SELECT * FROM position WHERE PositionID LIKE :kw OR PositionName LIKE :kw LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':kw', "%$keyword%");
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    public function searchCount($keyword) {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM position WHERE PositionID LIKE :kw OR PositionName LIKE :kw");
        $stmt->bindValue(':kw', "%$keyword%");
        $stmt->execute();
        return $stmt->fetchColumn();
    }
    
}
