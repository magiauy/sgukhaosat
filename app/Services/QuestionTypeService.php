<?php

namespace Services;

use Repositories\Interface\IBaseRepository;
use Repositories\QuestionTypeRepository;
use Services\Interface\IBaseService;

class QuestionTypeService implements IBaseService
{
    private IBaseRepository $questionTypeRepository;
    public function __construct()
    {
        $this->questionTypeRepository = new QuestionTypeRepository();
    }

    function create($data)
    {
        // TODO: Implement create() method.
    }

    function update($id, $data)
    {
        // TODO: Implement update() method.
    }

    function delete($id)
    {
        // TODO: Implement delete() method.
    }

    function getById($id)
    {
        // TODO: Implement getById() method.
    }

    function getAll()
    {
        try {
            return $this->questionTypeRepository->getAll();
        } catch (\Exception $e) {
            throw new \Exception("Lỗi khi lấy dữ liệu từ bảng question_type: " . $e->getMessage(), 500);
        }
    }
}