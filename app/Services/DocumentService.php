<?php
namespace Services;

use Repositories\DocumentRepository;

class DocumentService {
    private DocumentRepository $repo;

    public function __construct() {
        $this->repo = new DocumentRepository();
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
    
    public function create(array $data): ?int {
        return $this->repo->create($data);
    }


    public function update(string $id, array $data): bool {
        return $this->repo->update($id, $data);
    }

    public function delete(string $id): bool {
        return $this->repo->delete($id);
    }
    
    public function getPaginated($limit, $offset) {
        $result = $this->repo->getPaginated($limit, $offset);
        $totalCount = $this->repo->getTotalCount();
        $currentPage = $offset / $limit + 1;
        $totalPages = ceil($totalCount / $limit);
        return [
            'document' => $result,
            'totalCount' => $totalCount,
            'currentPage' => $currentPage,
            'totalPages' => $totalPages,
            'limit' => $limit
        ];
    }
    
    public function searchPaginated($keyword, $limit, $offset) {
//        return $this->repo->searchPaginated($keyword, $limit, $offset);
        $result = $this->repo->searchPaginated($keyword, $limit, $offset);
        $totalCount = $this->repo->searchCount($keyword);
        $currentPage = $offset / $limit + 1;
        $totalPages = ceil($totalCount / $limit);
        return [
            'document' => $result,
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
