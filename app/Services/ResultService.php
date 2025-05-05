<?php

namespace Services;

use Repositories\Database;
use Repositories\AnswerRepository;
use Repositories\ResultRepository;
use Repositories\QuestionRepository;
use Services\Interface\IResultService;

class ResultService implements IResultService
{
    private ResultRepository $resultRepository;
    private AnswerRepository $answerRepository;
    private QuestionRepository $questionRepository;

    public function __construct()
    {
        $this->resultRepository = new ResultRepository();
        $this->answerRepository = new AnswerRepository();
        $this->questionRepository = new QuestionRepository();
    }

    function create($data)
    {
        $pdo = Database::getInstance()->getConnection();
        return $this->resultRepository->create($data, $pdo);
    }

    function update($id, $data)
    {
        $pdo = Database::getInstance()->getConnection();
        return $this->resultRepository->update($id, $data, $pdo);
    }

    function delete($id)
    {
        $pdo = Database::getInstance()->getConnection();
        return $this->resultRepository->delete($id, $pdo);
    }

    function getById($id)
    {
        return $this->resultRepository->getById($id);
    }

    function getAll()
    {
        return $this->resultRepository->getAll();
    }

    function getByForm($formId)
    {
        return $this->resultRepository->getByForm($formId);
    }

    function getByUser($userId)
    {
        return $this->resultRepository->getByUser($userId);
    }

    function getByFormAndUser($formId, $userId)
    {
        return $this->resultRepository->getByFormAndUser($formId, $userId);
    }

    function countByForm($formId)
    {
        return $this->resultRepository->countByForm($formId);
    }

    function submitSurvey($formId, $userId, $answers)
    {
        try {
            $pdo = Database::getInstance()->getConnection();
            $pdo->beginTransaction();

            $resultData = [
                'FID' => $formId,
                'UID' => $userId
            ];
            $resultId = $this->resultRepository->create($resultData, $pdo);

            if (!$resultId) {
                throw new \Exception("Failed to create result record");
            }

            $processedAnswers = [];
            foreach ($answers as $answer) {
                $processedAnswers[] = [
                    'QID' => $answer['QID'],
                    'AContent' => is_array($answer['AContent']) ? json_encode($answer['AContent']) : $answer['AContent']
                ];
            }

            $this->answerRepository->getBulkCreate($processedAnswers, $resultId, $pdo);

            $pdo->commit();
            return [
                'success' => true,
                'resultId' => $resultId
            ];
        } catch (\Exception $e) {
            if (isset($pdo) && $pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw new \Exception("Failed to submit survey: " . $e->getMessage(), $e->getCode());
        }
    }
}