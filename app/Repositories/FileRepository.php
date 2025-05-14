<?php
namespace Repositories;

use PDO;

class FileRepository {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getConnection();
    }

    
    public function getAllByDocumentId(string $docId): array {
        $stmt = $this->pdo->prepare("SELECT * FROM file WHERE id_Doc = ? AND isDelete = FALSE");
        $stmt->execute([$docId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    
    public function getById(string $id) {
        $stmt = $this->pdo->prepare("SELECT * FROM file WHERE FileID = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function isFileIDExists(string $fileID): bool {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM file WHERE FileID = ?");
        $stmt->execute([$fileID]);
        return $stmt->fetchColumn() > 0;
    }
    
    public function getTotalCount(): int {
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM file");
        return $stmt->fetchColumn();
    }
    
    public function createMultiple(array $files): bool {
    $stmt = $this->pdo->prepare("INSERT INTO file (id_Doc, id_major, path_folder_url) VALUES (?, ?, ?)");
    
    foreach ($files as $file) {
        $stmt->execute([
            $file['id_Doc'],
            $file['id_major'],
            $file['path_folder_url']
        ]);
    }
    return true;
}

    public function update(string $id, array $data): bool {
        $stmt = $this->pdo->prepare("
            UPDATE file 
            SET FileTitle = ?, type = ?, createAt = ?, isDelete = ? 
            WHERE FileID = ?
        ");
        return $stmt->execute([
            $data['FileTitle'],
            $data['type'],
            $data['createAt'],
            $data['isDelete'],
            $id
        ]);
    }


   public function delete(string $id_Doc): bool {
        $stmt = $this->pdo->prepare("UPDATE file SET isDelete = TRUE WHERE id_Doc = ?");
        return $stmt->execute([$id_Doc]);
    }


    public function getPaginated($limit, $offset) {
        $stmt = $this->pdo->prepare("SELECT * FROM file LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    public function searchPaginated($keyword, $limit, $offset) {
        $stmt = $this->pdo->prepare("SELECT * FROM file WHERE FileID LIKE :kw OR FileName LIKE :kw LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':kw', "%$keyword%");
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    public function searchCount($keyword) {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM file WHERE FileID LIKE :kw OR FileName LIKE :kw");
        $stmt->bindValue(':kw', "%$keyword%");
        $stmt->execute();
        return $stmt->fetchColumn();
    }
    
}
