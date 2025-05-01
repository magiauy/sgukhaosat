<?php

namespace Services\Interface;

interface IAuthService extends IBaseService
{
    function login($data);
    function register($data);
    function logout();
    function me();
    function getAllWithoutWhitelist($id);
}