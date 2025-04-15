<?php

namespace Services\Interface;

interface IFormService extends IBaseService
{
    function getByIdAndUser ($id, $userId);
    function getFormWithPagination($offset, $limit, $userId, $search = null, $sort = null);
    function createDraft( $userId);

    function getByIdForUser($id);
}