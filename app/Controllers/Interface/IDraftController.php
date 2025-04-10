<?php

namespace Controllers\Interface;

use Core\Request;
use Core\Response;

interface IDraftController extends IBaseController
{
    function getByUserID(Response $response, Request $request);
    function idGenerate(Response $response, Request $request);
}