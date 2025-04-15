<?php

namespace Repositories\Interface;
interface IDraftRepository extends IBaseRepository
{
    function getByUserID($id);
    function getByFormID($id);

    function deleteByFormID($fid,\PDO $pdo): bool;

}