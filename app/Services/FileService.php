<?php
namespace Services;

use Repositories\FileRepository;

class FileService {
    private FileRepository $repo;

    public function __construct() {
        $this->repo = new FileRepository();
    }

    public function getAllByDocumentId(string $documentId): array {
        return $this->repo->getAllByDocumentId($documentId);
    }

    public function getById(string $id) {
        return $this->repo->getById($id);
    }
    
    public function getTotalCount(): int {
        return $this->repo->getTotalCount();
    }
    
    public function createMultiple(array $files): bool {
        return $this->repo->createMultiple($files);
    }

    public function delete(string $id_Doc): bool {
        return $this->repo->delete($id_Doc);
    }


    public function isFileIDExists(string $fileID): bool {
        return $this->repo->isFileIDExists($fileID);
    }

    public function update(string $id, array $data): bool {
        return $this->repo->update($id, $data);
    }
    
    public function getPaginated($limit, $offset) {
        $result = $this->repo->getPaginated($limit, $offset);
        $totalCount = $this->repo->getTotalCount();
        $currentPage = $offset / $limit + 1;
        $totalPages = ceil($totalCount / $limit);
        return [
            'file' => $result,
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
            'file' => $result,
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
