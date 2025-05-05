<?php

namespace Repositories\Interface;

interface IAnswerRepository extends IBaseRepositoryTransaction
{
    function getByResult($resultId);
    function getByQuestion($questionId);
    function getBulkCreate($data, $resultId, \PDO $pdo);
    function getAnswerStatistics($formId, $questionId);
}