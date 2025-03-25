<?php

namespace Controllers;

use Core\Request;
use Core\Response;

interface IBaseController
{
    function create(Response $response, Request $request);
    function update(Response $response, Request $request);
    function delete(Response $response, Request $request);
    function getById(Response $response, Request $request);
    function getAll(Response $response, Request $request);
}
