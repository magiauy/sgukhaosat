<?php

namespace Services;

use Repositories\Database;
use Repositories\AnswerRepository;
use Repositories\FormRepository;
use Repositories\ResultRepository;
use Repositories\QuestionRepository;
use Services\Interface\IResultService;

class ResultService implements IResultService
{
    private ResultRepository $resultRepository;
    private AnswerRepository $answerRepository;
    private QuestionRepository $questionRepository;
    private FormRepository $formService;


    public function __construct()
    {
        $this->resultRepository = new ResultRepository();
        $this->answerRepository = new AnswerRepository();
        $this->questionRepository = new QuestionRepository();
        $this->formService = new FormRepository();
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
            
            $questions = $this->questionRepository->getByFormID($formId);
            
//            $requiredQuestions = [];
//            foreach ($questions as $question) {
//                if ($question['QRequired'] == 1) {
//                    $requiredQuestions[$question['QID']] = $question;
//                }
//            }
//
//            $providedAnswers = [];
//            foreach ($answers as $answer) {
//                $providedAnswers[$answer['QID']] = $answer;
//            }
//
//            $missingRequired = [];
//            foreach ($requiredQuestions as $qid => $question) {
//                if (!isset($providedAnswers[$qid])) {
//                    $missingRequired[] = $qid;
//                    continue;
//                }
//
//                $answer = $providedAnswers[$qid];
//                $content = $answer['AContent'];
//                $isEmpty = false;
//
//                if (is_array($content)) {
//                    $isEmpty = empty($content);
//                } else if (is_string($content)) {
//                    $isEmpty = trim($content) === '';
//                } else {
//                    $isEmpty = empty($content);
//                }
//
//                if ($isEmpty) {
//                    $missingRequired[] = $qid;
//                }
//            }
//
//            if (!empty($missingRequired)) {
//                return [
//                    'success' => false,
//                    'error' => 'MISSING_REQUIRED_FIELDS',
//                    'missingFields' => $missingRequired,
//                    'message' => 'Vui lòng điền đầy đủ các trường bắt buộc.'
//                ];
//            }
            
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

    public function getFormResponse(int $formId, int $responseId)
    {
        $response = $this->resultRepository->getById($responseId);
        if (!$response) {
            throw new \Exception("Response not found", 404);
        }
        $answers = $this->answerRepository->getByResult($responseId);
        if (!$answers) {
            throw new \Exception("Answers not found for response ID: {$responseId}", 404);
        }
        $form = $this->formService->getByIdForUser($formId);
        if (!$form) {
            throw new \Exception("Form not found", 404);
        }
        $questions = $this->questionRepository->getByFormIDForStatistic($formId);
        if (!$questions) {
            throw new \Exception("Questions not found for form ID: {$formId}", 404);
        }
        $form['questions'] = $questions;

        //Sort quest by Index
        usort($form['questions'], function ($a, $b) {
            return $a['QIndex'] <=> $b['QIndex'];
        });
        //Sort children by Index
        foreach ($form['questions'] as &$question) {
            if (isset($question['children'])) {
                usort($question['children'], function ($a, $b) {
                    return $a['QIndex'] <=> $b['QIndex'];
                });
            }
        }


        return [
            'answers' => $answers,
            'form' => $form,
        ];
    }

    public function getUserResponses(int $formId)
    {
        $responses = $this->resultRepository->getByForm($formId);
        if (!$responses) {
            throw new \Exception("No responses found for form ID: {$formId}", 404);
        }
        return $responses;
    }

    public function deleteResult(int $responseId)
    {
       return $this->resultRepository->deleteResult($responseId);
    }
}