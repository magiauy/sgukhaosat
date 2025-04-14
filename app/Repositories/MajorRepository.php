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

    public function update(int $id, array $data): bool {
        $stmt = $this->pdo->prepare("UPDATE major SET MajorName = ? WHERE MajorID = ?");
        return $stmt->execute([
            $data['MajorName'],
            $id
        ]);
    }

    public function delete(int $id): bool {
        $stmt = $this->pdo->prepare("DELETE FROM major WHERE MajorID = ?");
        return $stmt->execute([$id]);
    }
}
