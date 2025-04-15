<?php

namespace Services;

use Repositories\Interface\IBaseRepository;
use Repositories\PermissionRepository;
use Services\Interface\IBaseService;

class PermissionService implements IBaseService
{

    private IBaseRepository $permRepository;

    public function __construct()
    {
        $this->permRepository = new PermissionRepository();
    }

    function create($data){}
    function update($id,$data){}
    function delete($id){}

    function getById($id){
        try {
            // var_dump($id);
            $perm['permission'] = $this->permRepository->getById($id);
            $perm['children'] = $this->permRepository->getChildrenById($id);
            return $perm;
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    function getAll(){
        return $this->permRepository->getAll(); 
    }
}