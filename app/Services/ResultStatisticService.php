<?php

namespace Services;

use Repositories\AnswerRepository;
use Repositories\FormRepository;
use Repositories\QuestionRepository;
use Repositories\ResultRepository;

class ResultStatisticService
{
    private ResultRepository $resultRepository;
    private AnswerRepository $answerRepository;
    private FormRepository $formRepository;
    private QuestionRepository $questionRepository;

    public function __construct()
    {
        $this->resultRepository = new ResultRepository();
        $this->answerRepository = new AnswerRepository();
        $this->formRepository = new FormRepository();
        $this->questionRepository = new QuestionRepository();
    }

public function getStatisticByForm($fid): array
{
    try {
        $form = $this->formRepository->getByIdForUser($fid);
        if (!$form) {
            throw new \Exception("Form with ID {$fid} not found.");
        }

        $statistics = $this->resultRepository->getByForm($fid);
        error_log("ResultStatisticService::getStatisticByForm - FID: {$fid} - Statistics Count: " . count($statistics));

        if (empty($statistics)) {
            return [
                'FID' => $fid,
                'formTitle' => $form['FName'],
                'totalResponses' => 0,
                'questions' => []
            ];
        }

        // Get all answers for all responses
        $allAnswers = [];
        foreach ($statistics as $statistic) {
            $answers = $this->answerRepository->getByResult($statistic['RID']);
            if ($answers) {
                $allAnswers = array_merge($allAnswers, $answers);
            }
        }

        // Group answers by question
        $groupedAnswers = [];
        foreach ($allAnswers as $answer) {
            $qid = $answer['QID'];
            $qTypeID = $answer['QTypeID'];

            //Tìm QID , nếu như có parent thì tìm lên parent đến khi null và lấy Type và ID của parent
            if ($answer['QParent'] !== null) {
                $parentQuestion = $this->questionRepository->getById($answer['QParent']);
                if ($parentQuestion) {
                    $qid = $parentQuestion['QID'];
                    $qTypeID = $parentQuestion['QTypeID'];
                }
            }

            if (!isset($groupedAnswers[$qid])) {
                $groupedAnswers[$qid] = [
                    'QID' => $qid,
                    'QTypeID' => $qTypeID,
                    'QContent' => $answer['QContent'],
                    'responses' => []
                ];
            }


            switch ($qTypeID) {
                case 'GRID_CHECKBOX':
                    $this->processGridCheckBoxAnswerContent($answer['AContent'], $qid, $groupedAnswers);
                    break;
                case 'GRID_MULTIPLE_CHOICE':
                    $this->processGridMultiChoiceAnswerContent($answer['AContent'], $qid, $groupedAnswers);
                    break;
                case 'CHECKBOX':
                    $this->processCheckBoxAnswerContent($answer['AContent'], $qid, $groupedAnswers);
                    break;
                default:
                    // Handle non-grid questions
                    $answerValue = $answer;

                    // Check if this answer already exists
                    $found = false;
                    foreach ($groupedAnswers[$qid]['responses'] as &$response) {
                        if ($response['answer'] === $answerValue) {
                            $response['count']++;
                            $found = true;
                            break;
                        }
                    }

                    // Add new answer if not found
                    if (!$found) {
                        $groupedAnswers[$qid]['responses'][] = [
                            'answer' => $answerValue,
                            'count' => 1
                        ];
                    }
                    break;

            }


        }

        // Convert associative array to indexed array
        return [
            'FID' => $fid,
            'formTitle' => $form['FName'],
            'totalResponses' => count($statistics),
            'questions' => array_values($groupedAnswers)
        ];
    } catch (\Exception $e) {
        error_log("ResultStatisticService::getStatisticByForm - Error: " . $e->getMessage());
        return [
            'status' => 'error',
            'message' => $e->getMessage()
        ];
    }
}
    private function processGridCheckBoxAnswerContent(string $answerContent, string $qid, array &$groupedAnswers): void
    {
        $answerData = json_decode($answerContent, true);

        if ($answerData && isset($answerData['row']) && isset($answerData['columns'])) {
            $row = $answerData['row'];
            $columns = $answerData['columns'];

            // Handle the columns based on question type
            foreach ($columns as $column) {
                $formattedAnswer = $row . ' - ' . $column;

                // Check if this grid answer already exists in responses
                $found = false;
                foreach ($groupedAnswers[$qid]['responses'] as &$response) {
                    if ($response['answer'] === $formattedAnswer) {
                        $response['count']++;
                        $found = true;
                        break;
                    }
                }

                // Add new grid answer if not found
                if (!$found) {
                    $groupedAnswers[$qid]['responses'][] = [
                        'answer' => $formattedAnswer,
                        'count' => 1
                    ];
                }
            }
        }
    }

    private function processCheckBoxAnswerContent(string $answerContent, string $qid, array &$groupedAnswers): void
    {
        $selectedOptions = json_decode($answerContent, true);

        if ($selectedOptions && is_array($selectedOptions)) {
            foreach ($selectedOptions as $option) {
                // Check if this option already exists in responses
                $found = false;
                foreach ($groupedAnswers[$qid]['responses'] as &$response) {
                    if ($response['answer'] === $option) {
                        $response['count']++;
                        $found = true;
                        break;
                    }
                }

                // Add new option if not found
                if (!$found) {
                    $groupedAnswers[$qid]['responses'][] = [
                        'answer' => $option,
                        'count' => 1
                    ];
                }
            }
        }
    }

    private function processGridMultiChoiceAnswerContent(string $answerContent, string $qid, array &$groupedAnswers): void
    {
        $answerData = json_decode($answerContent, true);

        if ($answerData && isset($answerData['row']) && isset($answerData['column'])) {
            $row = $answerData['row'];
            // For GRID_MULTIPLE_CHOICE, columns contains a single value as string, not an array
            $column = $answerData['column'];
            $formattedAnswer = $row . ' - ' . $column;

            // Check if this grid answer already exists in responses
            $found = false;
            foreach ($groupedAnswers[$qid]['responses'] as &$response) {
                if ($response['answer'] === $formattedAnswer) {
                    $response['count']++;
                    $found = true;
                    break;
                }
            }

            // Add new grid answer if not found
            if (!$found) {
                $groupedAnswers[$qid]['responses'][] = [
                    'answer' => $formattedAnswer,
                    'count' => 1
                ];
            }
        }
    }
}