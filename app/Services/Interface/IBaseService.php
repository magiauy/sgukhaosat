<?php

namespace Services\Interface;

interface IBaseService{
    function create($data);
    function update($id,$data);
    function delete($id);
    function getById($id);
    function getAll();

}