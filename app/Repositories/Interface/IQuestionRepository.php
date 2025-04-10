<?php

namespace Repositories\Interface;

interface IQuestionRepository extends IBaseRepositoryTransaction
{

    function createQuestion($data,$form,\PDO $pdo);

    function getByFormID($formID);
}