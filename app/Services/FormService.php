<?php

namespace Services;
use Repositories\Database;
use Repositories\Interface\IBaseRepository;
use Repositories\Interface\IBaseRepositoryTransaction;
use Repositories\QuestionRepository;
use Services\Interface\IBaseService;
use Repositories\FormRepository;

class FormService implements IBaseService
{
    private IBaseRepositoryTransaction $formRepository;
    private IBaseRepositoryTransaction $questionRepository;
    function __construct()
    {
        $this->formRepository = new FormRepository();
        $this->questionRepository = new QuestionRepository();
    }


    /**
     * @throws \Exception
     */
    function create($data)
    {
        $pdo = Database::getInstance()->getConnection();
        $form = $data['form'];
        $questions = $data['questions'];
        try {
            $pdo->beginTransaction();
            if ($this->formRepository->create($form, $pdo)){
                throw new \Exception("Lỗi khi thêm form", 500);
            }
            if (!$this->questionRepository->create($questions, $pdo)) {
                throw new \Exception("Lỗi khi thêm câu hỏi", 500);
            }
            $pdo->commit();
            return true;
        } catch (\Exception $e) {
            $pdo->rollBack();
            throw new \Exception("Lỗi khi thêm dữ liệu: " . $e->getMessage(), 500);
        }
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
        // TODO: Implement getAll() method.
    }
}