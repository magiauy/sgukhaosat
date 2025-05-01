<?php

namespace Repositories\Interface;

interface IWhitelistForm
{

    function create($id , $data);

    function delete($id);
    function getByFormID($id);
}