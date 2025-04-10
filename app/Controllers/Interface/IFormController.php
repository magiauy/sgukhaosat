<?php

namespace Controllers\Interface;

use Core\Request;
use Core\Response;

interface IFormController extends IBaseController
{
    function getAllDataPage(Request $request,Response $response,$html);
}