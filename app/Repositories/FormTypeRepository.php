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
    
    public function getById(string $id) {
        $stmt = $this->pdo->prepare("SELECT * FROM form_type WHERE FTypeID = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
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

    public function update(string $id, array $data): bool {
        $stmt = $this->pdo->prepare("UPDATE form_type SET FTypeName = ? WHERE FTypeID = ?");
        return $stmt->execute([
            $data['FTypeName'],
            $id
        ]);
    }

    public function delete(string $id): bool {
        $stmt = $this->pdo->prepare("DELETE FROM form_type WHERE FTypeID = ?");
        return $stmt->execute([$id]);
    }
    public function getPaginated($limit, $offset) {
        $stmt = $this->pdo->prepare("SELECT * FROM form_type LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    public function searchPaginated($keyword, $limit, $offset) {
        $stmt = $this->pdo->prepare("SELECT * FROM form_type WHERE FTypeID LIKE :kw OR FTypeName LIKE :kw LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':kw', "%$keyword%");
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    public function searchCount($keyword) {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM form_type WHERE FTypeID LIKE :kw OR FTypeName LIKE :kw");
        $stmt->bindValue(':kw', "%$keyword%");
        $stmt->execute();
        return $stmt->fetchColumn();
    }
    
}
?>
