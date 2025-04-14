<?php
namespace Repositories;

use PDO;
use Exception;

class PeriodRepository {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function getAll(): array {
        $stmt = $this->pdo->query("SELECT * FROM period");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getPaginated(int $limit, int $offset): array {
        $stmt = $this->pdo->prepare("SELECT * FROM period LIMIT ? OFFSET ?");
        $stmt->execute([$limit, $offset]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getTotalCount(): int {
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM period");
        return $stmt->fetchColumn();
    }
    
    public function getById(int $id) {
        $stmt = $this->pdo->prepare("SELECT * FROM period WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create(array $data): bool {
        $stmt = $this->pdo->prepare("INSERT INTO period (startYear, endYear) VALUES (?, ?)");
        return $stmt->execute([
            $data['startYear'],
            $data['endYear']
        ]);
    }

    public function update(int $id, array $data): bool {
        $stmt = $this->pdo->prepare("UPDATE period SET startYear = ?, endYear = ? WHERE id = ?");
        return $stmt->execute([
            $data['startYear'],
            $data['endYear'],
            $id
        ]);
    }

    public function delete(int $id): bool {
        $stmt = $this->pdo->prepare("DELETE FROM period WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
