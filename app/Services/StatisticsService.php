<?php

namespace Services;

use Repositories\Database;
use Repositories\FormRepository;
use Repositories\ResultRepository;
use Repositories\QuestionRepository;
use Repositories\AnswerRepository;
use Services\Interface\IStatisticsService;

class StatisticsService implements IStatisticsService {
    private FormRepository $formRepository;
    private ResultRepository $resultRepository;
    private QuestionRepository $questionRepository;
    private AnswerRepository $answerRepository;

    function __construct() {
        $this->formRepository = new FormRepository();
        $this->resultRepository = new ResultRepository();
        $this->questionRepository = new QuestionRepository();
        $this->answerRepository = new AnswerRepository();
    }

    /**
     * Get overview statistics data
     */
    function getOverviewStatistics() {
        // Get total number of surveys
        $totalSurveys = $this->formRepository->countAll();
        
        // Get total number of responses
        $totalResponses = $this->formRepository->countCompleted();
        
        // Get number of ongoing surveys
        $ongoingSurveys = $this->formRepository->countOnGoing();
        
        // Get responses by survey
        $responsesBySurvey = $this->getResponsesBySurvey();
        
        // Get responses by date
        $responsesByDate = $this->getResponsesByDate();
        
        // Calculate completion rate if needed
        $completionRate = $totalSurveys > 0 ? round(($totalResponses / $totalSurveys) * 100, 2) : 0;
        
        return [
            'totalSurveys' => $totalSurveys,
            'totalResponses' => $totalResponses,
            'ongoingSurveys' => $ongoingSurveys,
            'completionRate' => $completionRate,
            'responsesBySurvey' => $responsesBySurvey,
            'responsesByDate' => $responsesByDate
        ];
    }

    /**
     * Get responses by survey
     */
    private function getResponsesBySurvey() {
        // This is a placeholder - implement actual SQL query in repository
        $pdo = Database::getInstance()->getConnection();
        
        $sql = "SELECT f.FID, f.FName as surveyName, COUNT(r.RID) as responseCount 
                FROM forms f 
                LEFT JOIN result r ON f.FID = r.FID 
                WHERE f.isDelete = 0 
                GROUP BY f.FID, f.FName 
                ORDER BY responseCount DESC 
                LIMIT 10";
        
        $stmt = $pdo->query($sql);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get responses by date
     */
    private function getResponsesByDate() {
        // This is a placeholder - implement actual SQL query in repository
        $pdo = Database::getInstance()->getConnection();
        
        $sql = "SELECT DATE(r.Date) as date, COUNT(*) as count 
                FROM result r
                WHERE r.Date IS NOT NULL
                GROUP BY DATE(r.Date) 
                ORDER BY date DESC 
                LIMIT 30";
        
        $stmt = $pdo->query($sql);
        $results = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        // Sort by date ascending for chart display
        usort($results, function ($a, $b) {
            return strtotime($a['date']) - strtotime($b['date']);
        });
        
        return $results;
    }

    /**
     * Get statistics for a specific form
     */
    function getFormResponseStatistics($formId) {
        // Get form details
        $form = $this->formRepository->getById($formId);
        if (!$form) {
            throw new \Exception("Form not found", 404);
        }
        
        // Get total responses
        $totalResponses = $this->resultRepository->countByForm($formId);
        
        // Get response trend over time
        $timeframe = 'daily'; // Default timeframe
        $days = 30; // Default days
        $responseTrend = $this->getFormResponseTrend($formId, $timeframe, $days);
        
        return [
            'form' => $form,
            'totalResponses' => $totalResponses,
            'responseTrend' => $responseTrend
        ];
    }

    /**
     * Get response trend for a specific form
     */
    public function getFormResponseTrend($formId, $timeframe, $days) {
        return $this->resultRepository->getResponseTrend($formId, $timeframe, $days);
    }

    /**
     * Get responses by time period
     */
    function getResponsesByTimePeriod($period = 'day', $startDate = null, $endDate = null) {
        $pdo = Database::getInstance()->getConnection();
        
        // Format period grouping based on parameter
        $groupBy = 'DATE(r.Date)';
        $dateFormat = '%Y-%m-%d';
        
        if ($period === 'week') {
            $groupBy = 'YEARWEEK(r.Date, 1)'; // ISO week number format
            $dateFormat = '%x-W%v'; // Year-Week format
        } elseif ($period === 'month') {
            $groupBy = 'DATE_FORMAT(r.Date, "%Y-%m")';
            $dateFormat = '%Y-%m';
        }
        
        // Build query with optional date range
        $sql = "SELECT DATE_FORMAT(r.Date, '$dateFormat') as periodLabel, $groupBy as periodGroup, COUNT(*) as count 
                FROM result r 
                WHERE r.Date IS NOT NULL";
        
        $params = [];
        
        if ($startDate) {
            $sql .= " AND r.Date >= :startDate";
            $params[':startDate'] = $startDate;
        }
        
        if ($endDate) {
            $sql .= " AND r.Date <= :endDate";
            $params[':endDate'] = $endDate;
        }
        
        $sql .= " GROUP BY periodGroup, periodLabel ORDER BY periodGroup ASC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get detailed statistics for all questions in a form
     */
    function getQuestionResponseStatistics($formId) {
        // Get questions for this form
        $questions = $this->questionRepository->getByFormId($formId);
        if (!$questions) {
            throw new \Exception("No questions found for this form", 404);
        }
        
        // Get statistics for each question
        $questionStats = [];
        foreach ($questions as $question) {
            // Skip subtitles or other non-answerable question types
            if ($question['QTypeID'] === 'SUBTITLE') {
                continue;
            }
            
            $stats = $this->answerRepository->getAnswerStatistics($formId, $question['QID']);
            
            $questionStats[] = [
                'question' => $question,
                'statistics' => $stats
            ];
        }
        
        return $questionStats;
    }

    /**
     * Get dashboard statistics
     */
    function getDashboardStats() {
        return [
            'totalSurveys' => $this->formRepository->countAll(),
            'totalResponses' => $this->resultRepository->countAll(),
            'activeSurveys' => $this->formRepository->countOnGoing()
        ];
    }

    /**
     * Get form count statistics
     */
    function getFormCountStats() {
        return $this->formRepository->getFormCounts();
    }

    /**
     * Get form response counts
     */
    function getFormResponseCounts() {
        return $this->resultRepository->getResponseCounts();
    }

    /**
     * Get single form statistics
     */
    function getSingleFormStats($formId) {
        return $this->formRepository->getFormStatistics($formId);
    }

    /**
     * Get form question statistics
     */
    function getFormQuestionStats($formId) {
        return $this->questionRepository->getQuestionStatistics($formId);
    }

    /**
     * Get time analysis statistics
     */
    function getTimeAnalysis() {
        return $this->resultRepository->getTimeAnalysis();
    }

    /**
     * Generate custom report
     */
    function generateCustomReport($reportData) {
        return $this->formRepository->generateReport($reportData);
    }

    /**
     * Export statistics as CSV
     */
    function exportStatisticsCsv() {
        $data = $this->formRepository->getAllStatistics();
        $csv = "";

        foreach ($data as $row) {
            $csv .= implode(",", $row) . "\n";
        }

        return $csv;
    }
}
