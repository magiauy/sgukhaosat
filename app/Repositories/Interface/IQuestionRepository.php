<?php

namespace Repositories\Interface;

interface IQuestionRepository extends IBaseRepositoryTransaction
{
    function getByFormID($formID);
}