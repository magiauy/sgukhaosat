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
            $qIndex = $answer['QIndex'];

            //Tìm QID , nếu như có parent thì tìm lên parent đến khi null và lấy Type và ID của parent
            if ($answer['QParent'] !== null) {
                $parentQuestion = $this->questionRepository->getById($answer['QParent']);
                if ($parentQuestion) {
                    $qid = $parentQuestion['QID'];
                    $qTypeID = $parentQuestion['QTypeID'];
                    $qIndex = $parentQuestion['QIndex'];
                }
            }

            if (!isset($groupedAnswers[$qid])) {
                $groupedAnswers[$qid] = [
                    'QID' => $qid,
                    'QTypeID' => $qTypeID,
                    'QContent' => $answer['QContent'],
                    'QIndex' => $qIndex,
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
                    $this->processDefaultAnswerContent($answer['AContent'], $qid, $groupedAnswers);

                    break;

            }


        }
        // Sort questions by QIndex
        usort($groupedAnswers, function ($a, $b) {
            return $a['QIndex'] <=> $b['QIndex'];
        });
        // Sort responses by count in descending order
        foreach ($groupedAnswers as &$question) {
            usort($question['responses'], function ($a, $b) {
                return $b['count'] <=> $a['count'];
            });
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
    private function processDefaultAnswerContent(string $answerContent, string $qid, array &$groupedAnswers): void
    {
        // For default question types (SHORT_TEXT, LONG_TEXT, MULTIPLE_CHOICE, DROPDOWN)
        $content = $answerContent;

        // Check if this answer already exists in responses
        $found = false;
        foreach ($groupedAnswers[$qid]['responses'] as &$response) {
            if ($response['answer'] === $content) {
                $response['count']++;
                $found = true;
                break;
            }
        }

        // Add new answer if not found
        if (!$found) {
            $groupedAnswers[$qid]['responses'][] = [
                'answer' => $content,
                'count' => 1
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

    public function getQuestionsRatings(int $formId, int $questionId)
    {
        //Mặc định là Grid checkbox hoặc là Grid MC , xuống database lấy các Answer lên sau đó duyệt qua các row rồi đeếm coloumn tương ứng voới các row

        $questions = $this->questionRepository->getChildren($questionId);

        $ratings = [];
// First, separate rows and columns from questions
        $rows = [];
        $columns = [];
        $mainQuestion = null;

        foreach ($questions as $question) {
            if ($question['QTypeID'] === 'GRID_MC_ROW') {
                $rows[] = [
                    'id' => $question['QID'],
                    'content' => $question['QContent'],
                    'index' => $question['QIndex']
                ];
            } elseif ($question['QTypeID'] === 'GRID_MC_COLUMN') {
                $columns[] = [
                    'id' => $question['QID'],
                    'content' => $question['QContent'],
                    'index' => $question['QIndex']
                ];
            } elseif ($question['QTypeID'] === 'DESCRIPTION') {
                $mainQuestion = $question;
            }
        }

// Initialize ratings structure with rows and columns
        $ratingResults = [
            'question' => $mainQuestion ? $mainQuestion['QContent'] : '',
            'rows' => [],
            'columns' => array_map(function($col) { return $col['content']; }, $columns),
            'data' => []
        ];

// Initialize data structure for each row
        foreach ($rows as $row) {
            $rowId = $row['id'];
            $rowContent = $row['content'];

            $ratingResults['rows'][] = $rowContent;
            $ratingResults['data'][$rowId] = array_fill(0, count($columns), 0);

            // Get all answers for this row question
            $answers = $this->answerRepository->getByQuestion($rowId);

            if ($answers) {
                foreach ($answers as $answer) {
                    $answerData = json_decode($answer['AContent'], true);

                    if (is_array($answerData) && isset($answerData['column'])) {
                        // For GRID_MULTIPLE_CHOICE
                        $columnValue = $answerData['column'];
                        $columnIndex = array_search($columnValue, $ratingResults['columns']);

                        if ($columnIndex !== false) {
                            $ratingResults['data'][$rowId][$columnIndex]++;
                        }
                    } elseif (is_array($answerData) && isset($answerData['columns'])) {
                        // For GRID_CHECKBOX
                        foreach ($answerData['columns'] as $columnValue) {
                            $columnIndex = array_search($columnValue, $ratingResults['columns']);

                            if ($columnIndex !== false) {
                                $ratingResults['data'][$rowId][$columnIndex]++;
                            }
                        }
                    }
                }
            }
        }
        

        return [
            'questionId' => $questionId,
            'ratings' => $ratingResults
        ];
        // Sort ratings by QIndex

    }
}