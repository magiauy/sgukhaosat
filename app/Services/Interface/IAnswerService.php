<?php

namespace Services\Interface;

interface IAnswerService extends IBaseService
{
    function getByResult($resultId);
    function getByQuestion($questionId);
    function getAnswerStatistics($formId, $questionId);
}