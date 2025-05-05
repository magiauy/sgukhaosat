<?php
namespace Services;

use Repositories\PeriodRepository;

class PeriodService {
    private PeriodRepository $repo;

    public function __construct() {
        $this->repo = new PeriodRepository();
    }

    public function getAll(): array {
        return $this->repo->getAll();
    }
    
    public function getById(int $id) {
        return $this->repo->getById($id);
    }

    public function getTotalCount(): int {
        return $this->repo->getTotalCount();
    }
    
    public function create(array $data): bool {
        return $this->repo->create($data);
    }

    public function update(int $id, array $data): bool {
        return $this->repo->update($id, $data);
    }

    public function delete(int $id): bool {
        return $this->repo->delete($id);
    }

    public function getPaginated($limit, $offset) {
        $result = $this->repo->getPaginated($limit, $offset);
        $totalCount = $this->repo->getTotalCount();
        $currentPage = $offset / $limit + 1;
        $totalPages = ceil($totalCount / $limit);
        return [
            'period' => $result,
            'totalCount' => $totalCount,
            'currentPage' => $currentPage,
            'totalPages' => $totalPages,
            'limit' => $limit
        ];
    }
    
    public function searchPaginated($keyword, $limit, $offset, $startYear = null, $endYear = null) {
        $result = $this->repo->searchPaginated($keyword, $limit, $offset, $startYear, $endYear);
        $totalCount = $this->repo->searchCount($keyword, $startYear, $endYear);
        $currentPage = $offset / $limit + 1;
        $totalPages = ceil($totalCount / $limit);
    
        return [
            'period' => $result,
            'totalCount' => $totalCount,
            'currentPage' => $currentPage,
            'totalPages' => $totalPages,
            'limit' => $limit
        ];
    }
    
    
    public function searchCount($keyword) {
        return $this->repo->searchCount($keyword);
    }

    
    
}
