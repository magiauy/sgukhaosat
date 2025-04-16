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

    public function create(array $data): bool {
        return $this->repo->create($data);
    }

    public function update(int $id, array $data): bool {
        return $this->repo->update($id, $data);
    }

    public function delete(int $id): bool {
        return $this->repo->delete($id);
    }

    public function getPaginated(int $limit, int $offset): array {
        return $this->repo->getPaginated($limit, $offset);
    }

    public function searchPaginated(string $keyword, int $limit, int $offset, ?string $startYear = null, ?string $endYear = null): array {
        return $this->repo->searchPaginated($keyword, $limit, $offset, $startYear, $endYear);
    }
    public function getTotalCount(?string $startYear = null, ?string $endYear = null): int {
        return $this->repo->searchCount('', $startYear, $endYear);
    }
    public function searchCount(string $keyword, ?string $startYear = null, ?string $endYear = null): int {
        return $this->repo->searchCount($keyword, $startYear, $endYear);
    }

    
    
}
