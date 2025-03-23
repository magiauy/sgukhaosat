<?php

namespace Controllers;

use Core\Request;
use Core\Response;
interface IAuthController extends IBaseController
{
    public function login(Response $response, Request $request);
    public function register(Response $response, Request $request);
    public function logout(Response $response, Request $request);
    public function me(Response $response, Request $request);
}