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

    function getByIdForUser($id);
    /**
     * Get forms with search pagination
     *
     * @param int $offset Starting position for pagination
     * @param int $limit Maximum number of records to return
     * @param string $userId User ID/email for filtering forms
     * @param string|null $fName Form name search term
     * @param string|null $typeID Form type ID filter
     * @param string|null $majorID Major ID filter
     * @param string|null $periodID Period ID filter
     * @return array Array of forms matching the search criteria
     */
    function getFormWithSearchPagination($offset, $limit, $userId, $fName = null, $typeID = null, $majorID = null, $periodID = null);

    /**
     * Count total forms matching search criteria
     *
     * @param string $userId User ID/email for filtering forms
     * @param string|null $fName Form name search term
     * @param string|null $typeID Form type ID filter
     * @param string|null $majorID Major ID filter
     * @param string|null $periodID Period ID filter
     * @return int Total number of forms matching the search criteria
     */
    function countFormsWithSearchPagination($userId, $fName = null, $typeID = null, $majorID = null, $periodID = null);
    function countAll();
    function countCompleted();
    function countOngoing();
}