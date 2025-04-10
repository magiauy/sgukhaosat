<?php

namespace Repositories\Interface;
interface IDraftRepository extends IBaseRepository
{
    function getByUserID($id);
}