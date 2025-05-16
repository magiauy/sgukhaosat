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
    
    /**
     * Get documents by type with pagination
     *
     * @param string $type The document type (quy_trinh_khao_sat, quy_trinh_cap_nhat_chuan_dau_ra, danh_sach_quy_trinh_cac_chu_ky)
     * @param int $limit Number of items per page
     * @param int $offset Starting position for pagination
     * @return array Documents and total count
     */
    public function getDocumentsByType(string $type, int $limit, int $offset): array
    {
        try {
            // Get total count for pagination
            $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM document WHERE type = :type AND isDelete = FALSE");
            $countStmt->bindParam(':type', $type, PDO::PARAM_STR);
            $countStmt->execute();
            $totalCount = $countStmt->fetchColumn();

            // Get documents with pagination
            $stmt = $this->pdo->prepare("SELECT * FROM document WHERE type = :type AND isDelete = FALSE ORDER BY createAt DESC LIMIT :limit OFFSET :offset");
            $stmt->bindParam(':type', $type, PDO::PARAM_STR);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return [
                'documents' => $documents,
                'totalCount' => $totalCount
            ];
        } catch (\PDOException $e) {
            // Log the error
            error_log("Error fetching documents: " . $e->getMessage());
            return [
                'documents' => [],
                'totalCount' => 0
            ];
        }
    }

    /**
     * Get files associated with a document
     *
     * @param int $documentId The document ID
     * @return array Associated files
     */
    public function getFilesByDocumentId(int $documentId): array
    {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM file WHERE id_Doc = :documentId AND isDelete = FALSE");
            $stmt->bindParam(':documentId', $documentId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            // Log the error
            error_log("Error fetching files: " . $e->getMessage());
            return [];
        }
    }
}
