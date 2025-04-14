<?php
namespace Services;

use Repositories\MajorRepository;

class MajorService {
    private MajorRepository $repo;

    public function __construct() {
        $this->repo = new MajorRepository();
    }

    public function getAll(): array {
        return $this->repo->getAll();
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
}
