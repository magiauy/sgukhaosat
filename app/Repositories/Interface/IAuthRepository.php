<?php

namespace Repositories\Interface;

interface IAuthRepository extends IBaseRepository
{
    function login($data);
    function register($data);
    function logout();
    function me();

    function getUsersByEmails(array $emails): array;
    function getLastInsertId(): int;
}