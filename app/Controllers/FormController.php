<?php

namespace Controllers;

use Controllers\Interface\IBaseController;
use Core\Request;
use Core\Response;
use Services\Interface\IBaseService;
use Services\FormService;

class FormController implements IBaseController{
    private IBaseService $formService;

    function __construct()
    {
        $this->formService = new FormService();
    }

    function create(Response $response, Request $request)
    {
        $data = $request->getBody();
        try {
            if ($this->formService->create($data)) {
                $response->json([
                    'status' => true,
                    'message' => 'Form created successfully',
                    'data' => $data
                ]);
            }else{
                $response->json([
                    'status' => false,
                    'message' => 'Failed to create form'
                ], 500);
            }
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => 'Failed to create form',
                'error' => $e->getMessage()
            ], 500);
        }

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
        $id = $request->getParam('id');
        try {
            $form = $this->formService->getById($id);
            if ($form) {
                $response->json([
                    'status' => true,
                    'message' => 'Form retrieved successfully',
                    'data' => $form
                ]);
            } else {
                $response->json([
                    'status' => false,
                    'message' => 'Form not found'
                ], 404);
            }
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => 'Failed to retrieve form',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    function getAll(Response $response, Request $request)
    {

    }
}