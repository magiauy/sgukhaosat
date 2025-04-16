<?php
namespace Repositories;

use PDO;

class MajorRepository {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function getAll(): array {
        $stmt = $this->pdo->query("SELECT * FROM major");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getById(string $id) {
        $stmt = $this->pdo->prepare("SELECT * FROM major WHERE MajorID = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function isMajorIDExists(string $majorID): bool {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM major WHERE MajorID = ?");
        $stmt->execute([$majorID]);
        return $stmt->fetchColumn() > 0;
    }
    
    public function getTotalCount(): int {
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM major");
        return $stmt->fetchColumn();
    }
    
    public function create(array $data): bool {
        $stmt = $this->pdo->prepare("INSERT INTO major (MajorID, MajorName) VALUES (?, ?)");
        return $stmt->execute([
            $data['MajorID'],
            $data['MajorName']
        ]);
    }

    public function update(string $id, array $data): bool {
        $stmt = $this->pdo->prepare("UPDATE major SET MajorName = ? WHERE MajorID = ?");
        return $stmt->execute([
            $data['MajorName'],
            $id
        ]);
    }

    public function delete(string $id): bool {
        $stmt = $this->pdo->prepare("DELETE FROM major WHERE MajorID = ?");
        return $stmt->execute([$id]);
    }

    public function getPaginated($limit, $offset) {
        $stmt = $this->pdo->prepare("SELECT * FROM major LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    public function searchPaginated($keyword, $limit, $offset) {
        $stmt = $this->pdo->prepare("SELECT * FROM major WHERE MajorID LIKE :kw OR MajorName LIKE :kw LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':kw', "%$keyword%");
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    public function searchCount($keyword) {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM major WHERE MajorID LIKE :kw OR MajorName LIKE :kw");
        $stmt->bindValue(':kw', "%$keyword%");
        $stmt->execute();
        return $stmt->fetchColumn();
    }
    
}
