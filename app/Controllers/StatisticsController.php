<?php

namespace Controllers;

use Core\Request;
use Core\Response;
use Services\StatisticsService;

class StatisticsController {
    private StatisticsService $statisticsService;

    function __construct() {
        $this->statisticsService = new StatisticsService();
    }

    /**
     * Get overview statistics data
     */
    function getOverviewStatistics(Response $response, Request $request) {
        try {
            $statistics = $this->statisticsService->getOverviewStatistics();
            
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
     * Get form response statistics for a specific form
     */
    function getFormResponseStatistics(Response $response, Request $request) {
        try {
            $formId = $request->getParam('formId');
            
            if (empty($formId)) {
                throw new \Exception("Form ID is required", 400);
            }
            
            $statistics = $this->statisticsService->getFormResponseStatistics($formId);
            
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
     * Get response statistics by time period (day, week, month)
     */
    function getResponsesByTimePeriod(Response $response, Request $request) {
        try {
            $period = $request->getParam('period') ?? 'day';
            $startDate = $request->getParam('startDate') ?? null;
            $endDate = $request->getParam('endDate') ?? null;
            
            $statistics = $this->statisticsService->getResponsesByTimePeriod($period, $startDate, $endDate);
            
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
     * Get detailed question response statistics for a specific form
     */
    function getQuestionResponseStatistics(Response $response, Request $request) {
        try {
            $formId = $request->getParam('formId');
            
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
     * Get dashboard statistics
     */
    function getDashboardStats(Response $response, Request $request) {
        try {
            $statistics = $this->statisticsService->getDashboardStats();
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
     * Get form count statistics
     */
    function getFormCountStats(Response $response, Request $request) {
        try {
            $statistics = $this->statisticsService->getFormCountStats();

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
     * Get form response counts
     */
    function getFormResponseCounts(Response $response, Request $request) {
        try {
            error_log("Fetching form response counts");
            $statistics = $this->statisticsService->getFormResponseCounts();
            error_log($statistics);
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
     * Get single form statistics
     */
    function getSingleFormStats(Response $response, Request $request, $formId) {
        try {
            $statistics = $this->statisticsService->getSingleFormStats($formId);

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
     * Get form question statistics
     */
    function getFormQuestionStats(Response $response, Request $request, $formId) {
        try {
            $statistics = $this->statisticsService->getFormQuestionStats($formId);

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
     * Get form response trend
     */
    function getFormResponseTrend(Response $response, Request $request, $formId) {
        try {
            $timeframe = $request->getParam('timeframe') ?? 'daily';
            $days = $request->getParam('days') ?? 30;

            $statistics = $this->statisticsService->getFormResponseTrend($formId, $timeframe, $days);

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
     * Get time analysis statistics
     */
    function getTimeAnalysis(Response $response, Request $request) {
        try {
            $statistics = $this->statisticsService->getTimeAnalysis();

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
     * Generate custom report
     */
    function generateCustomReport(Response $response, Request $request) {
        try {
            $reportData = $request->getBody();
            $report = $this->statisticsService->generateCustomReport($reportData);

            $response->json([
                'status' => true,
                'data' => $report
            ]);
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    /**
     * Export statistics as CSV
     */
    function exportStatisticsCsv(Response $response, Request $request) {
        try {
            $csvData = $this->statisticsService->exportStatisticsCsv();

            $response->setHeader('Content-Type', 'text/csv');
            $response->setHeader('Content-Disposition', 'attachment; filename="statistics.csv"');
            $response->write($csvData);
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }
}
