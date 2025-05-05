<?php

namespace Services\Interface;

interface IResultService extends IBaseService
{
    function getByForm($formId);
    function getByUser($userId);
    function getByFormAndUser($formId, $userId);
    function countByForm($formId);
    function submitSurvey($formId, $userId, $answers);
}