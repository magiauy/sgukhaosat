<?php

namespace Services\Interface;

use Services\Interface\IBaseService;

interface IDraftService extends IBaseService
{
    function getByUserID($id);
    function generateId();

}