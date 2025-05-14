<?php
namespace Repositories;

use PDO;

class DocumentRepository {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function getAll(): array {
        $stmt = $this->pdo->query("SELECT * FROM document WHERE isDelete = FALSE");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById(string $id) {
        $stmt = $this->pdo->prepare("SELECT * FROM document WHERE DocumentID = ? AND isDelete = FALSE");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    
    public function getTotalCount(): int {
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM document WHERE isDelete = FALSE");
        return $stmt->fetchColumn();
    }

    
    public function create(array $data): ?int {
        $stmt = $this->pdo->prepare("
            INSERT INTO document (DocumentTitle, type)
            VALUES (?, ?)
        ");
        $success = $stmt->execute([
            $data['DocumentTitle'],
            $data['type']
        ]);

        if ($success) {
            return (int)$this->pdo->lastInsertId(); // 👈 Lấy DocumentID mới
        }

        return null;
    }


    public function update(string $id, array $data): bool {
    $stmt = $this->pdo->prepare("
        UPDATE document 
        SET DocumentTitle = ?, type = ? 
        WHERE DocumentID = ?
    ");
    return $stmt->execute([
        $data['DocumentTitle'],
        $data['type'],
        $id
    ]);
}



  public function delete(string $id): bool {
    $stmt = $this->pdo->prepare("UPDATE document SET isDelete = TRUE WHERE DocumentID = ?");
    return $stmt->execute([$id]);
}

    public function getPaginated($limit, $offset) {
        $stmt = $this->pdo->prepare("SELECT * FROM document LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    public function searchPaginated($keyword, $limit, $offset) {
        $stmt = $this->pdo->prepare("SELECT * FROM document WHERE isDelete = FALSE AND (DocumentTitle LIKE :kw OR DocumentID LIKE :kw) LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':kw', "%$keyword%");
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    
    public function searchCount($keyword) {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM document WHERE isDelete = FALSE AND (DocumentTitle LIKE :kw OR DocumentID LIKE :kw)");
        $stmt->bindValue(':kw', "%$keyword%");
        $stmt->execute();
        return $stmt->fetchColumn();
    }

    
}
