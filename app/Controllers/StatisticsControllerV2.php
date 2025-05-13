<?php

namespace Controllers;

use Core\Request;
use Core\Response;
use Services\StatisticsServiceV2;

class StatisticsControllerV2 {
    private StatisticsServiceV2 $statisticsService;

    function __construct() {
        $this->statisticsService = new StatisticsServiceV2();
    }    /**
     * Get comprehensive dashboard statistics
     */
    function getDashboardStats(Response $response, Request $request) {
        try {
            // Log the request
            error_log("Dashboard stats request received");
            
            $statistics = $this->statisticsService->getOverviewStatistics();
            
            // Add additional dashboard-specific metrics if available
            if (method_exists($this->statisticsService, 'getDashboardMetrics')) {
                $statistics['additionalMetrics'] = $this->statisticsService->getDashboardMetrics();
            }
            
            // Validate that we have valid data structures
            if (!is_array($statistics)) {
                throw new \Exception("Invalid statistics format returned from service");
            }
            
            // Log success
            error_log("Dashboard stats retrieved successfully");
            
            $response->json([
                'status' => true,
                'data' => $statistics
            ]);
        } catch (\Exception $e) {
            // Log the error
            error_log("Dashboard stats error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    /**
     * Get form count statistics (total, active, completed)
     */
    function getFormCountStats(Response $response, Request $request) {
        try {
            $totalForms = $this->statisticsService->formRepository->countAll();
            $activeForms = $this->statisticsService->formRepository->countOnGoing();
            $completedForms = $this->statisticsService->formRepository->countCompleted();
            
            $response->json([
                'status' => true,
                'data' => [
                    'total' => $totalForms,
                    'active' => $activeForms,
                    'completed' => $completedForms,
                    'completionRate' => $totalForms > 0 ? round(($completedForms / $totalForms) * 100, 2) : 0
                ]
            ]);
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    /**
     * Get response counts for all forms
     */
    function getFormResponseCounts(Response $response, Request $request) {
        try {
            $limit = $request->getParam('limit') ? (int)$request->getParam('limit') : 10;
            $responsesBySurvey = $this->statisticsService->getResponsesBySurvey($limit);
            
            $response->json([
                'status' => true,
                'data' => $responsesBySurvey
            ]);
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    /**
     * Get comprehensive statistics for a single form
     */
    function getSingleFormStats(Response $response, Request $request, $formId = null) {
        try {
            if (empty($formId)) {
                $formId = $request->getParam('formId');
            }
            
            if (empty($formId)) {
                throw new \Exception("Form ID is required", 400);
            }
            
            $statistics = $this->statisticsService->getFormResponseStatistics($formId);
            
            // Get additional form metadata if available
            if (method_exists($this->statisticsService, 'getFormMetadata')) {
                $statistics['metadata'] = $this->statisticsService->getFormMetadata($formId);
            }
            
            $response->json([
                'status' => true,
                'data' => $statistics
            ]);
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    /**
     * Get detailed statistics for all questions in a form
     */
    function getFormQuestionStats(Response $response, Request $request, $formId = null) {
        try {
            if (empty($formId)) {
                $formId = $request->getParam('formId');
            }
            
            if (empty($formId)) {
                throw new \Exception("Form ID is required", 400);
            }
            
            $statistics = $this->statisticsService->getQuestionResponseStatistics($formId);
            
            $response->json([
                'status' => true,
                'data' => $statistics
            ]);
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    /**
     * Get response trend over time for a specific form
     */
    function getFormResponseTrend(Response $response, Request $request, $formId = null) {
        try {
            if (empty($formId)) {
                $formId = $request->getParam('formId');
            }
            
            if (empty($formId)) {
                throw new \Exception("Form ID is required", 400);
            }
            
            $timeframe = $request->getParam('timeframe') ?? 'daily';
            $days = $request->getParam('days') ? (int)$request->getParam('days') : 30;
            
            $trend = $this->statisticsService->getFormResponseTrendExtended($formId, $timeframe, $days);
            
            $response->json([
                'status' => true,
                'data' => $trend
            ]);
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    /**
     * Get time-based analysis of responses
     */
    function getTimeAnalysis(Response $response, Request $request) {
        try {
            $period = $request->getParam('period') ?? 'day';
            $startDate = $request->getParam('startDate') ?? null;
            $endDate = $request->getParam('endDate') ?? null;
            $groupBy = $request->getParam('groupBy') ?? null;
            
            $statistics = $this->statisticsService->getResponsesByTimePeriod($period, $startDate, $endDate);
            
            // Add additional time analysis if available
            if (method_exists($this->statisticsService, 'getTimeAnalysisMetrics') && $groupBy) {
                $statistics['detailedAnalysis'] = $this->statisticsService->getTimeAnalysisMetrics($period, $groupBy, $startDate, $endDate);
            }
            
            $response->json([
                'status' => true,
                'data' => $statistics
            ]);
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    /**
     * Generate custom report based on parameters
     */
    function generateCustomReport(Response $response, Request $request) {
        try {
            // Get report parameters from request body
            $reportParams = $request->getBody();
            
            if (empty($reportParams)) {
                throw new \Exception("Report parameters are required", 400);
            }
            
            // Generate custom report if the method is available
            if (method_exists($this->statisticsService, 'generateCustomReport')) {
                $report = $this->statisticsService->generateCustomReport($reportParams);
                
                $response->json([
                    'status' => true,
                    'data' => $report
                ]);
            } else {
                throw new \Exception("Custom report generation is not available", 501);
            }
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    /**
     * Export statistics data to CSV format
     */
    function exportStatisticsCsv(Response $response, Request $request) {
        try {
            $formId = $request->getParam('formId');
            $exportType = $request->getParam('type') ?? 'responses';
            
            if (empty($formId)) {
                throw new \Exception("Form ID is required", 400);
            }
            
            // Export statistics to CSV if the method is available
            if (method_exists($this->statisticsService, 'exportStatisticsToCsv')) {
                $csvData = $this->statisticsService->exportStatisticsToCsv($formId, $exportType);
                
                // Set appropriate headers for CSV download
                header('Content-Type: text/csv; charset=utf-8');
                header('Content-Disposition: attachment; filename="statistics_export_' . date('Y-m-d') . '.csv"');
                
                echo $csvData;
                exit;
            } else {
                throw new \Exception("CSV export is not available", 501);
            }
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }
}
