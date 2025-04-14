<?php
namespace Repositories;

use PDO;

class FormTypeRepository {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function getAll(): array {
        $stmt = $this->pdo->query("SELECT * FROM form_type");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getTotalCount(): int {
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM form_type");
        return $stmt->fetchColumn();
    }
    
    public function create(array $data): bool {
        $stmt = $this->pdo->prepare("INSERT INTO form_type (FTypeID, FTypeName) VALUES (?, ?)");
        return $stmt->execute([
            $data['FTypeID'],
            $data['FTypeName']
        ]);
    }

    public function update(int $id, array $data): bool {
        $stmt = $this->pdo->prepare("UPDATE form_type SET FTypeName = ? WHERE FTypeID = ?");
        return $stmt->execute([
            $data['FTypeName'],
            $id
        ]);
    }

    public function delete(int $id): bool {
        $stmt = $this->pdo->prepare("DELETE FROM form_type WHERE FTypeID = ?");
        return $stmt->execute([$id]);
    }
}
?>
