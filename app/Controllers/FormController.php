<?php

namespace Controllers;

use Controllers\Interface\IFormController;
use Core\jwt_helper;
use Core\Request;
use Core\Response;
use Middlewares\JwtMiddleware;
use Services\FormService;
use Services\Interface\IFormService;

class FormController implements IFormController{
    private IFormService $formService;

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

    function getAll($response, $request)
    {
        try {
            $forms = $this->formService->getAll();
            if ($forms) {
                $response->json([
                    'status' => true,
                    'message' => 'Forms retrieved successfully',
                    'data' => $forms
                ]);
            } else {
                $response->json([
                    'status' => false,
                    'message' => 'No forms found'
                ], 404);
            }
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => 'Failed to retrieve forms',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    function getAllDataPage(Request $request,Response $response, $html)
    {
        try {
            $form = $this->formService->getAll();
            if ($form) {
                $response->json([
                    'status' => true,
                    'message' => 'Forms retrieved successfully',
                    'data' => $form,
                    'html' => $html
                ]);
            } else {
                $response->json([
                    'status' => false,
                    'message' => 'No forms found'
                ], 404);
            }
        } catch (\Exception $e) {
            return[
                'status' => false,
                'message' => 'Failed to retrieve forms',
                'error' => $e->getMessage()
            ];
        }
    }

    function checkPermission($formId, $userId)
    {
        $form = $this->formService->getByIdAndUser($formId, $userId);
        if ($form) {
            return $form;
        } else {
            return null;
        }
    }
}