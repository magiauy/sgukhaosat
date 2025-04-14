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

    public function getPaginated(int $limit, int $offset): array {
        return $this->repo->getPaginated($limit, $offset);
    }
    
    public function getTotalCount(): int {
        return $this->repo->getTotalCount();
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
}
