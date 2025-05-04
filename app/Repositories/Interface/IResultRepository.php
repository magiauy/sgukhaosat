<?php

namespace Repositories\Interface;

interface IResultRepository extends IBaseRepositoryTransaction
{
    function getByForm($formId);
    function getByUser($userId);
    function getByFormAndUser($formId, $userId);
    function countByForm($formId);
}