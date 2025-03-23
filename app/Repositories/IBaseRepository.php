<?php

namespace Repositories;

interface IBaseRepository{
    function create($data);
    function update($id,$data);
    function delete($id);
    function getById($id);
    function getAll();
}