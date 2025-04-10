<?php

namespace Repositories\Interface;

interface IFormRepositoryTransaction extends IBaseRepositoryTransaction
{
    function getByIdAndUser ($id, $userId);

}