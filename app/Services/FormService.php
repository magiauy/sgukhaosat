<?php

namespace Services;
use Repositories\Database;
use Repositories\Interface\IBaseRepository;
use Repositories\Interface\IBaseRepositoryTransaction;
use Repositories\Interface\IQuestionRepository;
use Repositories\QuestionRepository;
use Services\Interface\IBaseService;
use Repositories\FormRepository;

class FormService implements IBaseService
{
    private IBaseRepositoryTransaction $formRepository;
    private IQuestionRepository $questionRepository;
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
            $formCreated = $this->formRepository->create($form, $pdo);
            // Kiểm tra xem có thất bại không (trả về false, null, 0, '')
            if (!$formCreated) {
                // Ném ra Exception để nhảy vào catch và rollback
                throw new \Exception("Lỗi khi thêm form."); // Có thể thêm chi tiết lỗi nếu repository trả về
            }

            $questionsCreated = $this->questionRepository->create($questions, $pdo);
            // Kiểm tra xem có thất bại không
            if (!$questionsCreated) {
                // Ném ra Exception để nhảy vào catch và rollback
                throw new \Exception("Lỗi khi thêm câu hỏi."); // Có thể thêm chi tiết lỗi
            }
            // Nếu cả hai đều thành công, commit transaction
            $pdo->commit();
            return true;
        } catch (\Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw new \Exception("Lỗi khi thực hiện thao tác: " . $e->getMessage(), $e->getCode() ?: 500, $e);
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
        $form = $this->formRepository->getById($id);
        if (!$form) {
            throw new \Exception("Không tìm thấy form với ID: $id", 404);
        }
        $questions = $this->questionRepository->getByFormId($id);
        if (!$questions) {
            throw new \Exception("Không tìm thấy câu hỏi cho form với ID: $id", 404);
        }
        return [
            'form' => $form,
            'questions' => $questions
        ];
    }

    function getAll()
    {
        // TODO: Implement getAll() method.
    }
}