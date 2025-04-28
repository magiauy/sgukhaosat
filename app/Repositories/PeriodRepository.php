<?php
namespace Repositories;

use PDO;

class PeriodRepository {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function getAll(): array {
        $stmt = $this->pdo->query("SELECT * FROM period");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getTotalCount(): int {
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM period");
        return $stmt->fetchColumn();
    }
    
    public function getById(int $id) {
        $stmt = $this->pdo->prepare("SELECT * FROM period WHERE periodID = ?");
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
        $stmt = $this->pdo->prepare("UPDATE period SET startYear = ?, endYear = ? WHERE periodID = ?");
        return $stmt->execute([
            $data['startYear'],
            $data['endYear'],
            $id
        ]);
    }

    public function delete(int $id): bool {
        $stmt = $this->pdo->prepare("DELETE FROM period WHERE periodID = ?");
        return $stmt->execute([$id]);
    }

    public function getPaginated($limit, $offset){
        $stmt = $this->pdo->prepare("SELECT * FROM period LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    public function searchPaginated(string $keyword, int $limit, int $offset, ?string $startYear = null, ?string $endYear = null): array {
        $sql = "SELECT * FROM period WHERE 1=1";
        $params = [];
        
        if (!empty($keyword)) {
            $sql .= " AND (CAST(periodID AS CHAR) LIKE :kw OR CAST(startYear AS CHAR) LIKE :kw OR CAST(endYear AS CHAR) LIKE :kw)";
            $params[':kw'] = "%$keyword%";
        }
    
        if (!empty($startYear) && !empty($endYear)) {
            $sql .= " AND startYear >= :startYear AND endYear <= :endYear";
            $params[':startYear'] = $startYear;
            $params[':endYear'] = $endYear;
        } else {
            if (!empty($startYear)) {
                $sql .= " AND startYear >= :startYear";
                $params[':startYear'] = $startYear;
            }
            if (!empty($endYear)) {
                $sql .= " AND endYear <= :endYear";
                $params[':endYear'] = $endYear;
            }
        }
    
        $sql .= " LIMIT :limit OFFSET :offset";
        $stmt = $this->pdo->prepare($sql);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
    
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function searchCount(string $keyword, ?string $startYear = null, ?string $endYear = null): int {
    $sql = "SELECT COUNT(*) FROM period WHERE 1=1";
    $params = [];

    if (!empty($keyword)) {
        $sql .= " AND (CAST(startYear AS CHAR) LIKE :kw OR CAST(endYear AS CHAR) LIKE :kw)";
        $params[':kw'] = "%$keyword%";
    }

    if (!empty($startYear)) {
        $sql .= " AND startYear >= :startYear";
        $params[':startYear'] = $startYear;
    }

    if (!empty($endYear)) {
        $sql .= " AND endYear <= :endYear";
        $params[':endYear'] = $endYear;
    }

    $stmt = $this->pdo->prepare($sql);

    // Gán tham số theo đúng tên
    foreach ($params as $key => $value) {
        $paramType = is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR;
        $stmt->bindValue($key, $value, $paramType);
    }

    $stmt->execute();
    return (int) $stmt->fetchColumn();
}

    
}
