<?php

namespace Services\Interface;

interface IFormService extends IBaseService
{
    function getByIdAndUser ($id, $userId);

}