<?php

namespace Repositories\Interface;

interface IFormRepositoryTransaction extends IBaseRepositoryTransaction
{
    function getByIdAndUser ($id, $userId);

    function checkPermission($id, $userId);

    function getFormWithPagination($offset, $limit, $userId, $search = null, $sort = null);

    function countFormsWithPagination($userId, $search);

    function createDraft($user);

    function checkStatus($form, $status);

    function updateDraft($id, $data);

    function getFormWithWhitelist($email);

    function updateStatus($fid, $status,\PDO $pdo): bool;

}