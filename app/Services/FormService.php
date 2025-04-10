<?php

namespace Services;
use Exception;
use Repositories\Database;
use Repositories\Interface\IFormRepositoryTransaction;
use Repositories\Interface\IQuestionRepository;
use Repositories\QuestionRepository;
use Services\Interface\IBaseService;
use Repositories\FormRepository;
use Services\Interface\IFormService;

class FormService implements IFormService
{
    private IFormRepositoryTransaction $formRepository;
    private IQuestionRepository $questionRepository;
    function __construct()
    {
        $this->formRepository = new FormRepository();
        $this->questionRepository = new QuestionRepository();
    }


    /**
     * @throws Exception
     */
    function create($data)
    {
        $pdo = Database::getInstance()->getConnection();
        $email = $data['user']->email;
        $form = $data['form'];
        $questions = $data['questions'];
        $form['UID'] = $email;
//        print_r('question: ' . json_encode($questions));
        try {
            $pdo->beginTransaction();
            $formCreated = $this->formRepository->create($form, $pdo);
            // Kiểm tra xem có thất bại không (trả về false, null, 0, '')
            if (!$formCreated) {
                // Ném ra Exception để nhảy vào catch và rollback
                throw new Exception("Lỗi khi thêm form."); // Có thể thêm chi tiết lỗi nếu repository trả về
            }

//            print_r($questions);
            $questionsCreated = $this->questionRepository->createQuestion($questions,$formCreated, $pdo);
            // Kiểm tra xem có thất bại không
            if (!$questionsCreated) {
                // Ném ra Exception để nhảy vào catch và rollback
                throw new Exception("Lỗi khi thêm câu hỏi."); // Có thể thêm chi tiết lỗi
            }
            // Nếu cả hai đều thành công, commit transaction
            $pdo->commit();
            return true;
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            $code = is_numeric($e->getCode()) ? (int)$e->getCode() : 500;
            throw new Exception("Lỗi khi thực hiện thao tác: " . $e->getMessage(), $code, $e);
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

    /**
     * @throws Exception
     */
    function getById($id)
    {
        try {
            $form = $this->formRepository->getById($id);
            if (!$form) {
                throw new Exception("Không tìm thấy form với ID: $id", 404);
            }
            $questions = $this->questionRepository->getByFormId($id);
            if (!$questions) {
                throw new Exception("Không tìm thấy câu hỏi cho form với ID: $id", 404);
            }
            return [
                'form' => $form,
                'questions' => $questions
            ];
        } catch (Exception $e) {
            throw new Exception("Lỗi khi lấy form: " . $e->getMessage(), $e->getCode() ?: 500, $e);
        }
    }

    function getAll()
    {
        try {
            $forms = $this->formRepository->getAll();
            if (!$forms) {
                throw new Exception("Không tìm thấy form nào", 404);
            }
            foreach ($forms as &$form) {
                $formQuestions = $this->questionRepository->getByFormId($form['FID']);
                if (!$formQuestions) {
                    throw new Exception("Không tìm thấy câu hỏi cho form với ID: " . $form['FID'], 404);
                }
                $form['questions'] = $formQuestions;
            }
            unset($form); // Break the reference with the last element


            return [
                'forms' => $forms,
            ];
        } catch (Exception $e) {
            throw new Exception("Lỗi khi lấy danh sách form: " . $e->getMessage(), $e->getCode() ?: 500, $e);
        }
    }

    function getByIdAndUser($id, $userId)
    {
        try {
            $form = $this->formRepository->getByIdAndUser($id, $userId);
            if (!$form) {
                throw new Exception("Không tìm thấy form với ID: $id cho người dùng với ID: $userId", 404);
            }
            $questions = $this->questionRepository->getByFormId($id);
            if (!$questions) {
                throw new Exception("Không tìm thấy câu hỏi cho form với ID: $id", 404);
            }
            return [
                'form' => $form,
                'questions' => $questions
            ];
        } catch (Exception $e) {
            throw new Exception("Lỗi khi lấy form: " . $e->getMessage(), $e->getCode() ?: 500, $e);
        }
    }
}