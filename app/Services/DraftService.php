<?php

namespace Services;

use Exception;
use Repositories\DraftRepository;
use Repositories\FormRepository;
use Repositories\Interface\IDraftRepository;
use Repositories\Interface\IdGenerator;
use Repositories\Interface\IFormRepositoryTransaction;
use Services\Interface\IDraftService;

class DraftService implements IDraftService
{
    private IDraftRepository $draftRepository;
    private IdGenerator $idGenerator;
    private IFormRepositoryTransaction $formRepository;

    public function __construct()
    {
        $repo = new DraftRepository();
        $this->formRepository = new FormRepository();
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
            $form = $data['form'];
            $questions = $data['questions'];
            if(!$this->formRepository->checkStatus($id,0)){
                throw new Exception("Thông tin form không hợp lệ");
            }
            if (!$this->formRepository->checkPermission($id, $data['user']->email)) {
                throw new Exception("Bạn không có quyền sửa bản nháp này");
            }
            $this->formRepository->updateDraft($id, $form);

            return $this->draftRepository->update($id, $questions);
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
