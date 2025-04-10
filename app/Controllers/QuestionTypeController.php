<?php

namespace Controllers;

use Controllers\Interface\IBaseController;
use Core\Request;
use Core\Response;
use Services\Interface\IBaseService;
use Services\QuestionTypeService;

class QuestionTypeController implements IBaseController
{
    private IBaseService $questionTypeService;
    public function __construct()
    {
        $this->questionTypeService = new QuestionTypeService();
    }

    function create(Response $response, Request $request)
    {
        // TODO: Implement create() method.
    }

    function update(Response $response, Request $request)
    {
        // TODO: Implement update() method.
    }

    function delete(Response $response, Request $request)
    {
        // TODO: Implement delete() method.
    }

    function getById(Response $response, Request $request)
    {
        // TODO: Implement getById() method.
    }

    function getAll(Response $response, Request $request)
    {
        $questionTypes = $this->questionTypeService->getAll();
        if (empty($questionTypes)) {
            $response->json([
                'status' => false,
                'message' => 'Không có dữ liệu nào trong bảng'
            ]);
        }
        $response->json([
            'status' => true,
            'data' => $questionTypes
        ]);
    }
}