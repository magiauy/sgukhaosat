<?php

namespace Repositories;

interface IAuthRepository extends IBaseRepository
{
    function login($data);
    function register($data);
    function logout();
    function me();
}