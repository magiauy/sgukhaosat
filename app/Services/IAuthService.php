<?php

namespace Services;

interface IAuthService extends IBaseService
{
    function login($data);
    function register($data);
    function logout();
    function me();
}