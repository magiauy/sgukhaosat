<?php

namespace Services;

use Repositories\Database;
use Repositories\FormRepository;
use Repositories\ResultRepository;
use Repositories\QuestionRepository;
use Repositories\AnswerRepository;
use Services\Interface\IStatisticsService;

class StatisticsServiceV2 implements IStatisticsService {
    public FormRepository $formRepository;
    public ResultRepository $resultRepository;
    public QuestionRepository $questionRepository;
    public AnswerRepository $answerRepository;

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
        $totalResponses = $this->resultRepository->countAll();
        
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
     * Get additional dashboard metrics
     */
    function getDashboardMetrics() {
        $pdo = Database::getInstance()->getConnection();
        
        // Get average response time (in seconds)
        $avgTimeQuery = "SELECT AVG(TIMESTAMPDIFF(SECOND, r.StartTime, r.Date)) as averageTime 
                        FROM result r 
                        WHERE r.StartTime IS NOT NULL AND r.Date IS NOT NULL";
        $stmt = $pdo->query($avgTimeQuery);
        $avgTimeResult = $stmt->fetch(\PDO::FETCH_ASSOC);
        $avgResponseTime = $avgTimeResult ? round($avgTimeResult['averageTime']) : 0;
        
        // Calculate response rate (completed responses / started responses)
        $responseRateQuery = "SELECT 
                             (SELECT COUNT(*) FROM result WHERE Status = 'Completed') as completed,
                             (SELECT COUNT(*) FROM result) as total";
        $stmt = $pdo->query($responseRateQuery);
        $rateResult = $stmt->fetch(\PDO::FETCH_ASSOC);
        $responseRate = ($rateResult && $rateResult['total'] > 0) 
            ? round(($rateResult['completed'] / $rateResult['total']) * 100, 1) 
            : 0;
        
        // Get active surveys (surveys with responses in the last 7 days)
        $activeQuery = "SELECT COUNT(DISTINCT f.FID) as active_count
                       FROM form f
                       JOIN result r ON f.FID = r.FID
                       WHERE r.Date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)";
        $stmt = $pdo->query($activeQuery);
        $activeResult = $stmt->fetch(\PDO::FETCH_ASSOC);
        $activeSurveys = $activeResult ? $activeResult['active_count'] : 0;
        
        return [
            'averageResponseTime' => $avgResponseTime,
            'responseRate' => $responseRate,
            'activeSurveys' => $activeSurveys
        ];
    }

    /**
     * Get weekly activity trend
     */
    private function getWeeklyActivityTrend() {
        $pdo = Database::getInstance()->getConnection();
        
        $sql = "SELECT 
                    YEARWEEK(r.Date, 1) as week,
                    DATE_FORMAT(MIN(r.Date), '%Y-%m-%d') as startDate,
                    DATE_FORMAT(MAX(r.Date), '%Y-%m-%d') as endDate,
                    COUNT(*) as responses
                FROM result r
                WHERE r.Date IS NOT NULL AND r.Date >= DATE_SUB(NOW(), INTERVAL 12 WEEK)
                GROUP BY YEARWEEK(r.Date, 1)
                ORDER BY week ASC";
                
        $stmt = $pdo->query($sql);
        $results = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        return $results;
    }

    /**
     * Get user participation metrics
     */
    private function getUserParticipationMetrics() {
        $pdo = Database::getInstance()->getConnection();
        
        $sql = "SELECT 
                    COUNT(DISTINCT r.UID) as uniqueUsers,
                    COUNT(*) as totalResponses,
                    ROUND(COUNT(*) / COUNT(DISTINCT r.UID), 2) as avgResponsesPerUser
                FROM result r
                WHERE r.UID IS NOT NULL";
                
        $stmt = $pdo->query($sql);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        // Get top active users
        $sqlTopUsers = "SELECT 
                            r.UID as email,
                            u.fullName,
                            COUNT(*) as responseCount
                        FROM result r
                        LEFT JOIN users u ON r.UID = u.email
                        WHERE r.UID IS NOT NULL
                        GROUP BY r.UID, u.fullName
                        ORDER BY responseCount DESC
                        LIMIT 5";
                        
        $stmt = $pdo->prepare($sqlTopUsers);
        $stmt->execute();
        $topUsers = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        $result['topUsers'] = $topUsers;
        
        return $result;
    }

    /**
     * Get survey completion rates
     */
    private function getSurveyCompletionRates() {
        $pdo = Database::getInstance()->getConnection();
        
        $sql = "SELECT 
                    f.FID,
                    f.FName,
                    f.Limit as targetResponses,
                    COUNT(r.RID) as actualResponses,
                    CASE 
                        WHEN f.Limit > 0 THEN ROUND((COUNT(r.RID) / f.Limit) * 100, 2)
                        ELSE 0
                    END as completionPercentage
                FROM forms f
                LEFT JOIN result r ON f.FID = r.FID
                WHERE f.isDelete = 0 AND f.Limit > 0
                GROUP BY f.FID, f.FName, f.Limit
                ORDER BY completionPercentage DESC
                LIMIT 10";
                
        $stmt = $pdo->query($sql);
        $results = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        return $results;
    }

    /**
     * Get responses by survey
     */
    function getResponsesBySurvey($limit = 10) {
        $pdo = Database::getInstance()->getConnection();
        
        $sql = "SELECT f.FID, f.FName as surveyName, 
                       COUNT(r.RID) as responseCount,
                       f.Limit as targetResponses,
                       CASE 
                           WHEN f.Limit > 0 THEN ROUND((COUNT(r.RID) / f.Limit) * 100, 2)
                           ELSE 0
                       END as completionPercentage
                FROM forms f 
                LEFT JOIN result r ON f.FID = r.FID 
                WHERE f.isDelete = 0 
                GROUP BY f.FID, f.FName, f.Limit
                ORDER BY responseCount DESC 
                LIMIT :limit";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get responses by date
     */
    private function getResponsesByDate($days = 30) {
        $pdo = Database::getInstance()->getConnection();
        
        $sql = "SELECT DATE(r.Date) as date, COUNT(*) as count 
                FROM result r
                WHERE r.Date IS NOT NULL AND r.Date >= DATE_SUB(CURRENT_DATE(), INTERVAL :days DAY)
                GROUP BY DATE(r.Date) 
                ORDER BY date ASC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':days', $days, \PDO::PARAM_INT);
        $stmt->execute();
        $results = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
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
        $responseTrend = $this->getFormResponseTrend($formId);
        
        // Get completion rate
        $completionRate = 0;
        if ($form['Limit'] > 0) {
            $completionRate = round(($totalResponses / $form['Limit']) * 100, 2);
        }
        
        // Get last 5 responses
        $recentResponses = $this->getRecentFormResponses($formId, 5);
        
        return [
            'form' => $form,
            'totalResponses' => $totalResponses,
            'responseTrend' => $responseTrend,
            'completionRate' => $completionRate,
            'recentResponses' => $recentResponses
        ];
    }

    /**
     * Get recent form responses
     */
    private function getRecentFormResponses($formId, $limit = 5) {
        $pdo = Database::getInstance()->getConnection();
        
        $sql = "SELECT r.RID, r.UID, u.fullName, r.Date
                FROM result r
                LEFT JOIN users u ON r.UID = u.email
                WHERE r.FID = :formId
                ORDER BY r.Date DESC
                LIMIT :limit";
                
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':formId', $formId, \PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get form metadata for detailed statistics
     */
    function getFormMetadata($formId) {
        $pdo = Database::getInstance()->getConnection();
        
        $sql = "SELECT f.FID, f.FName, f.Note, f.Limit, f.isPublic, f.Status,
                       ft.FTypeName as formType, 
                       m.MajorName as major,
                       p.startYear, p.endYear,
                       COUNT(DISTINCT q.QID) as questionCount
                FROM forms f
                LEFT JOIN form_type ft ON f.TypeID = ft.FTypeID
                LEFT JOIN major m ON f.MajorID = m.MajorID
                LEFT JOIN period p ON f.PeriodID = p.periodID
                LEFT JOIN question q ON f.FID = q.FID AND q.isDeleted = 0
                WHERE f.FID = :formId
                GROUP BY f.FID, f.FName, f.Note, f.Limit, f.isPublic, f.Status, ft.FTypeName, m.MajorName, p.startYear, p.endYear";
                
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':formId', $formId, \PDO::PARAM_INT);
        $stmt->execute();
        
        $metadata = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        // Get whitelisted users count
        $sqlWhitelist = "SELECT COUNT(*) as whitelistedCount
                        FROM whitelist_form
                        WHERE FID = :formId";
                        
        $stmt = $pdo->prepare($sqlWhitelist);
        $stmt->bindParam(':formId', $formId, \PDO::PARAM_INT);
        $stmt->execute();
        $whitelist = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if ($metadata && $whitelist) {
            $metadata['whitelistedCount'] = $whitelist['whitelistedCount'];
        }
        
        return $metadata;
    }

    /**
     * Get response trend for a specific form with extended options
     */
    function getFormResponseTrendExtended($formId, $timeframe = 'daily', $days = 30) {
        $pdo = Database::getInstance()->getConnection();
        
        // Format grouping based on timeframe
        $groupBy = 'DATE(r.Date)';
        $dateFormat = '%Y-%m-%d';
        $intervalSql = "DATE_SUB(CURRENT_DATE(), INTERVAL :days DAY)";
        
        if ($timeframe === 'weekly') {
            $groupBy = 'YEARWEEK(r.Date, 1)';
            $dateFormat = '%x-W%v';
            $intervalSql = "DATE_SUB(CURRENT_DATE(), INTERVAL :days DAY)";
        } elseif ($timeframe === 'monthly') {
            $groupBy = 'DATE_FORMAT(r.Date, "%Y-%m")';
            $dateFormat = '%Y-%m';
            $intervalSql = "DATE_SUB(CURRENT_DATE(), INTERVAL :days DAY)";
        } elseif ($timeframe === 'hourly') {
            $groupBy = 'DATE_FORMAT(r.Date, "%Y-%m-%d %H:00")';
            $dateFormat = '%Y-%m-%d %H:00';
            $intervalSql = "DATE_SUB(NOW(), INTERVAL :days HOUR)";
            $days = min($days, 48); // Limit hourly data to avoid excessive points
        }
        
        $sql = "SELECT DATE_FORMAT(r.Date, :dateFormat) as label,
                       $groupBy as groupKey,
                       COUNT(*) as count
                FROM result r
                WHERE r.FID = :formId AND r.Date IS NOT NULL
                      AND r.Date >= $intervalSql
                GROUP BY groupKey, label
                ORDER BY groupKey ASC";
                
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':formId', $formId, \PDO::PARAM_INT);
        $stmt->bindParam(':dateFormat', $dateFormat, \PDO::PARAM_STR);
        $stmt->bindParam(':days', $days, \PDO::PARAM_INT);
        $stmt->execute();
        
        $trend = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        return [
            'timeframe' => $timeframe,
            'period' => $days,
            'data' => $trend
        ];
    }

    /**
     * Get response trend for a specific form (basic version)
     */
    private function getFormResponseTrend($formId) {
        $pdo = Database::getInstance()->getConnection();
        
        $sql = "SELECT DATE(r.Date) as date, COUNT(*) as count 
                FROM result r 
                WHERE r.FID = :formId AND r.Date IS NOT NULL
                GROUP BY DATE(r.Date) 
                ORDER BY date ASC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':formId', $formId, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
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
        } elseif ($period === 'hour') {
            $groupBy = 'DATE_FORMAT(r.Date, "%Y-%m-%d %H")';
            $dateFormat = '%Y-%m-%d %H:00';
        } elseif ($period === 'year') {
            $groupBy = 'YEAR(r.Date)';
            $dateFormat = '%Y';
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
        
        $results = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        return [
            'period' => $period,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'data' => $results
        ];
    }

    /**
     * Get time analysis metrics with additional grouping
     */
    function getTimeAnalysisMetrics($period, $groupBy, $startDate = null, $endDate = null) {
        $pdo = Database::getInstance()->getConnection();
        
        // Valid groupBy fields
        $validGroupByFields = ['FID', 'MajorID', 'TypeID', 'UID', 'Status'];
        
        if (!in_array($groupBy, $validGroupByFields)) {
            throw new \Exception("Invalid group by field", 400);
        }
        
        // Format period grouping based on parameter
        $periodGroupBy = 'DATE(r.Date)';
        $dateFormat = '%Y-%m-%d';
        
        if ($period === 'week') {
            $periodGroupBy = 'YEARWEEK(r.Date, 1)';
            $dateFormat = '%x-W%v';
        } elseif ($period === 'month') {
            $periodGroupBy = 'DATE_FORMAT(r.Date, "%Y-%m")';
            $dateFormat = '%Y-%m';
        }
        
        // Join clause and display field based on groupBy
        $joinClause = '';
        $displayField = '';
        
        if ($groupBy === 'FID') {
            $joinClause = 'LEFT JOIN forms f ON r.FID = f.FID';
            $displayField = 'f.FName as groupName';
        } elseif ($groupBy === 'MajorID') {
            $joinClause = 'LEFT JOIN forms f ON r.FID = f.FID LEFT JOIN major m ON f.MajorID = m.MajorID';
            $displayField = 'm.MajorName as groupName';
        } elseif ($groupBy === 'TypeID') {
            $joinClause = 'LEFT JOIN forms f ON r.FID = f.FID LEFT JOIN form_type ft ON f.TypeID = ft.FTypeID';
            $displayField = 'ft.FTypeName as groupName';
        } elseif ($groupBy === 'UID') {
            $joinClause = 'LEFT JOIN users u ON r.UID = u.email';
            $displayField = 'u.fullName as groupName, r.UID';
        } elseif ($groupBy === 'Status') {
            $joinClause = 'LEFT JOIN forms f ON r.FID = f.FID';
            $displayField = 'CASE WHEN f.Status = 1 THEN "Active" ELSE "Inactive" END as groupName';
        }
        
        // Build query with optional date range
        $sql = "SELECT DATE_FORMAT(r.Date, '$dateFormat') as periodLabel, 
                       $periodGroupBy as periodGroup, 
                       $displayField,
                       f.$groupBy as groupValue,
                       COUNT(*) as count 
                FROM result r 
                $joinClause
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
        
        $sql .= " GROUP BY periodGroup, periodLabel, f.$groupBy ORDER BY periodGroup ASC, count DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        $results = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        // Reorganize data for easy consumption
        $organizedData = [];
        foreach ($results as $row) {
            if (!isset($organizedData[$row['periodLabel']])) {
                $organizedData[$row['periodLabel']] = [
                    'period' => $row['periodLabel'],
                    'groups' => []
                ];
            }
            
            $organizedData[$row['periodLabel']]['groups'][] = [
                'name' => $row['groupName'],
                'value' => $row['groupValue'],
                'count' => $row['count']
            ];
        }
        
        return array_values($organizedData);
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
            if (in_array($question['QTypeID'], ['SUBTITLE', 'DESCRIPTION'])) {
                continue;
            }
            
            $stats = $this->answerRepository->getAnswerStatistics($formId, $question['QID']);
            
            $questionStats[] = [
                'question' => $question,
                'statistics' => $stats,
                'responseCount' => count($stats)
            ];
        }
        
        return $questionStats;
    }

    /**
     * Generate a custom report based on provided parameters
     */
    function generateCustomReport($params) {
        $pdo = Database::getInstance()->getConnection();
        $result = [];
        
        // Required params
        if (!isset($params['reportType'])) {
            throw new \Exception("Report type is required", 400);
        }
        
        $reportType = $params['reportType'];
        
        // Generate different reports based on type
        if ($reportType === 'form_comparison') {
            // Compare multiple forms
            if (!isset($params['formIds']) || !is_array($params['formIds'])) {
                throw new \Exception("Form IDs are required for comparison", 400);
            }
            
            $formIds = $params['formIds'];
            $placeholders = implode(',', array_fill(0, count($formIds), '?'));
            
            $sql = "SELECT f.FID, f.FName, COUNT(r.RID) as responseCount,
                           f.Limit as targetResponses,
                           CASE 
                               WHEN f.Limit > 0 THEN ROUND((COUNT(r.RID) / f.Limit) * 100, 2)
                               ELSE 0
                           END as completionPercentage,
                           MIN(r.Date) as firstResponse,
                           MAX(r.Date) as lastResponse,
                           DATEDIFF(MAX(r.Date), MIN(r.Date)) + 1 as activeDays,
                           ROUND(COUNT(r.RID) / (DATEDIFF(MAX(r.Date), MIN(r.Date)) + 1), 2) as responsesPerDay
                    FROM forms f
                    LEFT JOIN result r ON f.FID = r.FID
                    WHERE f.FID IN ($placeholders)
                    GROUP BY f.FID, f.FName, f.Limit
                    ORDER BY responseCount DESC";
                    
            $stmt = $pdo->prepare($sql);
            $stmt->execute($formIds);
            $result['comparisonData'] = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
        } elseif ($reportType === 'user_activity') {
            // User activity report
            $startDate = $params['startDate'] ?? date('Y-m-d', strtotime('-30 days'));
            $endDate = $params['endDate'] ?? date('Y-m-d');
            
            $sql = "SELECT u.email, u.fullName, u.roleID,
                           COUNT(r.RID) as responseCount,
                           COUNT(DISTINCT r.FID) as uniqueForms,
                           MIN(r.Date) as firstActivity,
                           MAX(r.Date) as lastActivity
                    FROM users u
                    LEFT JOIN result r ON u.email = r.UID AND r.Date BETWEEN ? AND ?
                    GROUP BY u.email, u.fullName, u.roleID
                    HAVING responseCount > 0
                    ORDER BY responseCount DESC";
                    
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$startDate, $endDate]);
            $result['userData'] = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            $result['period'] = [
                'startDate' => $startDate,
                'endDate' => $endDate
            ];
            
        } elseif ($reportType === 'question_analysis') {
            // Question analysis report
            if (!isset($params['formId'])) {
                throw new \Exception("Form ID is required for question analysis", 400);
            }
            
            $formId = $params['formId'];
            
            // Get all questions
            $questions = $this->questionRepository->getByFormId($formId);
            
            // Get response distribution for each question
            $result['questions'] = [];
            foreach ($questions as $question) {
                if (in_array($question['QTypeID'], ['SUBTITLE', 'DESCRIPTION'])) {
                    continue;
                }
                
                $stats = $this->answerRepository->getAnswerStatistics($formId, $question['QID']);
                
                // Analyze responses based on question type
                $analysisResult = [
                    'question' => $question,
                    'responseCount' => count($stats),
                    'statistics' => $stats
                ];
                
                // Add additional analysis for specific question types
                if (in_array($question['QTypeID'], ['MULTIPLE_CHOICE', 'CHECKBOX', 'GRID_MULTIPLE_CHOICE', 'GRID_CHECKBOX'])) {
                    // Get most common answers
                    $responses = [];
                    foreach ($stats as $stat) {
                        if (isset($stat['AContent'])) {
                            $responses[] = $stat['AContent'];
                        }
                    }
                    
                    $analysisResult['responseCounts'] = array_count_values($responses);
                    arsort($analysisResult['responseCounts']);
                }
                
                $result['questions'][] = $analysisResult;
            }
        }
        
        $result['reportType'] = $reportType;
        $result['generatedAt'] = date('Y-m-d H:i:s');
        
        return $result;
    }

    /**
     * Export statistics to CSV format
     */
    function exportStatisticsToCsv($formId, $exportType = 'responses') {
        $pdo = Database::getInstance()->getConnection();
        
        if ($exportType === 'responses') {
            // Export all responses for a form
            $sql = "SELECT r.RID, r.UID, u.fullName, r.Date,
                           q.QID, q.QContent as question, a.AContent as answer
                    FROM result r
                    LEFT JOIN users u ON r.UID = u.email
                    JOIN answer a ON r.RID = a.RID
                    JOIN question q ON a.QID = q.QID
                    WHERE r.FID = :formId
                    ORDER BY r.RID, q.QID";
                    
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':formId', $formId, \PDO::PARAM_INT);
            $stmt->execute();
            
            $results = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            // Group by response
            $responses = [];
            foreach ($results as $row) {
                if (!isset($responses[$row['RID']])) {
                    $responses[$row['RID']] = [
                        'RID' => $row['RID'],
                        'UID' => $row['UID'],
                        'fullName' => $row['fullName'],
                        'Date' => $row['Date'],
                        'answers' => []
                    ];
                }
                
                $responses[$row['RID']]['answers'][$row['QID']] = [
                    'question' => $row['question'],
                    'answer' => $row['answer']
                ];
            }
            
            // Generate CSV
            $output = fopen('php://temp', 'r+');
            
            // Headers
            fputcsv($output, ['Response ID', 'User Email', 'User Name', 'Date', 'Question', 'Answer']);
            
            // Data rows
            foreach ($responses as $response) {
                foreach ($response['answers'] as $answer) {
                    fputcsv($output, [
                        $response['RID'],
                        $response['UID'],
                        $response['fullName'],
                        $response['Date'],
                        $answer['question'],
                        $answer['answer']
                    ]);
                }
            }
            
            rewind($output);
            $csv = stream_get_contents($output);
            fclose($output);
            
            return $csv;
            
        } elseif ($exportType === 'summary') {
            // Export summary statistics for a form
            $form = $this->formRepository->getById($formId);
            $questions = $this->questionRepository->getByFormId($formId);
            $questionStats = [];
            
            foreach ($questions as $question) {
                if (in_array($question['QTypeID'], ['SUBTITLE', 'DESCRIPTION'])) {
                    continue;
                }
                
                $stats = $this->answerRepository->getAnswerStatistics($formId, $question['QID']);
                $questionStats[$question['QID']] = [
                    'question' => $question,
                    'stats' => $stats
                ];
            }
            
            // Generate CSV
            $output = fopen('php://temp', 'r+');
            
            // Form info
            fputcsv($output, ['Form ID', 'Form Name', 'Total Responses', 'Target Responses', 'Completion Rate']);
            $totalResponses = $this->resultRepository->countByForm($formId);
            $completionRate = ($form['Limit'] > 0) ? round(($totalResponses / $form['Limit']) * 100, 2) : 0;
            fputcsv($output, [$form['FID'], $form['FName'], $totalResponses, $form['Limit'], $completionRate . '%']);
            
            fputcsv($output, []); // Empty row as separator
            
            // Question summaries
            fputcsv($output, ['Question ID', 'Question Content', 'Question Type', 'Response Count']);
            
            foreach ($questionStats as $qid => $data) {
                fputcsv($output, [
                    $qid,
                    $data['question']['QContent'],
                    $data['question']['QTypeID'],
                    count($data['stats'])
                ]);
            }
            
            rewind($output);
            $csv = stream_get_contents($output);
            fclose($output);
            
            return $csv;
        }
        
        throw new \Exception("Invalid export type", 400);
    }

    /**
     * Get time-based analysis for responses
     */
    function getTimeAnalysis() {
        $pdo = Database::getInstance()->getConnection();
        
        // Get hourly distribution
        $hourlyQuery = "SELECT 
                         HOUR(Date) as hour,
                         COUNT(*) as count 
                       FROM result 
                       WHERE Date IS NOT NULL
                       GROUP BY HOUR(Date)
                       ORDER BY HOUR(Date)";
        $stmt = $pdo->query($hourlyQuery);
        $hourlyDistribution = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        // Get day of week distribution
        $dayQuery = "SELECT 
                      DAYNAME(Date) as day,
                      COUNT(*) as count 
                    FROM result 
                    WHERE Date IS NOT NULL
                    GROUP BY DAYNAME(Date)
                    ORDER BY WEEKDAY(Date)";
        $stmt = $pdo->query($dayQuery);
        $dayDistribution = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        // Get peak hour
        $peakHourQuery = "SELECT 
                           HOUR(Date) as hour,
                           COUNT(*) as count 
                         FROM result 
                         WHERE Date IS NOT NULL
                         GROUP BY HOUR(Date)
                         ORDER BY COUNT(*) DESC
                         LIMIT 1";
        $stmt = $pdo->query($peakHourQuery);
        $peakHour = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        // Get peak day
        $peakDayQuery = "SELECT 
                          DAYNAME(Date) as day,
                          COUNT(*) as count 
                        FROM result 
                        WHERE Date IS NOT NULL
                        GROUP BY DAYNAME(Date)
                        ORDER BY COUNT(*) DESC
                        LIMIT 1";
        $stmt = $pdo->query($peakDayQuery);
        $peakDay = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        // Get average completion time
        $avgTimeQuery = "SELECT AVG(TIMESTAMPDIFF(SECOND, StartTime, Date)) as averageTime 
                         FROM result 
                         WHERE StartTime IS NOT NULL AND Date IS NOT NULL AND Status = 'Completed'";
        $stmt = $pdo->query($avgTimeQuery);
        $avgTimeResult = $stmt->fetch(\PDO::FETCH_ASSOC);
        $avgCompletionTime = $avgTimeResult ? round($avgTimeResult['averageTime']) : 0;
        
        // Get date range statistics
        $dateRangeQuery = "SELECT 
                            MIN(Date) as firstResponse,
                            MAX(Date) as lastResponse,
                            COUNT(*) as totalResponses,
                            DATEDIFF(MAX(Date), MIN(Date)) as dateRangeInDays
                          FROM result 
                          WHERE Date IS NOT NULL";
        $stmt = $pdo->query($dateRangeQuery);
        $dateRange = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        return [
            'hourlyDistribution' => $hourlyDistribution,
            'dayDistribution' => $dayDistribution,
            'peakHour' => $peakHour,
            'peakDay' => $peakDay,
            'averageCompletionTime' => $avgCompletionTime,
            'dateRange' => $dateRange
        ];
    }
}
