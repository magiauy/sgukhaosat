<?php

namespace Repositories\Interface;
interface IDraftRepository extends IBaseRepository
{
    function getByUserID($id);
    function getByFormID($id);

}