<?php

namespace Services;

use Exception;
use Repositories\DraftRepository;
use Repositories\Interface\IDraftRepository;
use Repositories\Interface\IdGenerator;
use Services\Interface\IDraftService;

class DraftService implements IDraftService
{
    private IDraftRepository $draftRepository;
    private IdGenerator $idGenerator;

    public function __construct()
    {
        $repo = new DraftRepository();
        $this->draftRepository = $repo;
        $this->idGenerator = $repo;
    }

    /**
     * @throws Exception
     */
    public function create($data): bool|string
    {
        try {
            return $this->draftRepository->create($data);
        } catch (\RuntimeException $e) {
            throw new Exception("Lỗi tạo bản nháp: " . $e->getMessage());
        }
    }

    /**
     * @throws Exception
     */
    public function update($id, $data): bool
    {
        try {
            return $this->draftRepository->update($id, $data);
        } catch (\RuntimeException $e) {
            throw new Exception("Lỗi cập nhật bản nháp: " . $e->getMessage());
        }
    }

    /**
     * @throws Exception
     */
    public function delete($id): bool
    {
        try {
            return $this->draftRepository->delete($id);
        } catch (\RuntimeException $e) {
            throw new Exception("Lỗi xóa bản nháp: " . $e->getMessage());
        }
    }

    /**
     * @throws Exception
     */
    public function getById($id)
    {
        try {
            return $this->draftRepository->getById($id);
        } catch (\RuntimeException $e) {
            throw new Exception("Không thể lấy bản nháp: " . $e->getMessage());
        }
    }

    public function getAll(): array
    {
        try {
            return $this->draftRepository->getAll();
        } catch (\RuntimeException $e) {
            throw new Exception("Không thể lấy danh sách bản nháp: " . $e->getMessage());
        }
    }

    /**
     * @throws Exception
     */
    public function getByUserID($id): array
    {
        try {
            return $this->draftRepository->getByUserID($id);
        } catch (\RuntimeException $e) {
            throw new Exception("Không thể lấy bản nháp theo người dùng: " . $e->getMessage());
        }
    }

    /**
     * @throws Exception
     */
    public function generateId()
    {
        try {
            return $this->idGenerator->getNextId();
        } catch (\RuntimeException $e) {
            throw new Exception("Không thể tạo ID mới: " . $e->getMessage());
        }
    }
}
