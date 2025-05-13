<?php

namespace Services\Interface;

interface IStatisticsService {
    /**
     * Get overview statistics data including total surveys, total responses, etc.
     */
    function getOverviewStatistics();

    /**
     * Get statistics specifically for a single form
     */
    function getFormResponseStatistics($formId);

    /**
     * Get response statistics grouped by time periods
     */
    function getResponsesByTimePeriod($period, $startDate = null, $endDate = null);

    /**
     * Get detailed statistics for all questions in a form
     */
    function getQuestionResponseStatistics($formId);
}
