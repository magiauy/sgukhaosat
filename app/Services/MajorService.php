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

    public function getById(string $id) {
        return $this->repo->getById($id);
    }
    
    public function getTotalCount(): int {
        return $this->repo->getTotalCount();
    }
    
    public function create(array $data): bool {
        if ($this->isMajorIDExists($data['MajorID'])) {
            return false; 
        }
        return $this->repo->create($data);
    }

    public function isMajorIDExists(string $majorID): bool {
        return $this->repo->isMajorIDExists($majorID);
    }

    public function update(string $id, array $data): bool {
        return $this->repo->update($id, $data);
    }

    public function delete(string $id): bool {
        return $this->repo->delete($id);
    }
    
    public function getPaginated($limit, $offset) {
        return $this->repo->getPaginated($limit, $offset);
    }
    
    public function searchPaginated($keyword, $limit, $offset) {
        return $this->repo->searchPaginated($keyword, $limit, $offset);
    }
    
    public function searchCount($keyword) {
        return $this->repo->searchCount($keyword);
    }
    
}
