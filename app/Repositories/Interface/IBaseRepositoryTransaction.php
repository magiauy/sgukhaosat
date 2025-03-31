<?php

namespace Repositories\Interface;

interface IBaseRepositoryTransaction
{
    function create($data,\PDO $pdo);
    function update($id,$data,\PDO $pdo);
    function delete($id,\PDO $pdo);
    function getById($id);
    function getAll();
}