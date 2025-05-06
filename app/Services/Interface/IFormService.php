<?php

namespace Services\Interface;

interface IFormService extends IBaseService
{
    function getByIdAndUser ($id, $userId);
    function getFormWithPagination($offset, $limit, $userId, $search = null, $sort = null);
    function createDraft( $userId);

    function getByIdForUser($id);

    function editFromWhitelist($id, $data);

    function addToWhitelist($id, $data);

    function getFormWhitelist($id);
    function deleteFromWhitelist($id, $data);

    function duplicate($id, $userId);

}