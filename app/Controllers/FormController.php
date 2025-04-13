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
        $data = $request->getBody();
        $id = $request->getParam('id');
        try {
            if ($this->formService->update($id, $data)) {
                $response->json([
                    'status' => true,
                    'message' => 'Form updated successfully',
                ]);
            }else{
                $response->json([
                    'status' => false,
                    'message' => 'Failed to update form'
                ], 500);
            }
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => 'Failed to update form',
                'error' => $e->getMessage()
            ], 500);
        }

    }

    function delete(Response $response, Request $request)
    {
        // TODO: Implement delete() method.
    }

    function getById(Response $response, Request $request)
    {
        $data = [
            'id' => $request->getParam('id'),
            'email' => $request->getBody()['user']->email ?? null
        ];

        try {
            $form = $this->formService->getById($data);

            $response->json([
                'status' => true,
                'message' => 'Form retrieved successfully',
                'data' => $form
            ]);
            return;
        } catch (\Exception $e) {
            $code = $e->getCode() ?: 500;

            $response->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], $code);
            return;

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
            $email = $request->getBody()['user']->email ?? null;
            $form = $this->formService->getFormWithPagination(0, 10, $email);
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
        $form = $this->formService->checkPermission($formId, $userId);
        if ($form) {
            return $form;
        } else {
            return null;
        }
    }

    function getFormWithPagination(Request $request, Response $response)
    {
        $offset = $request->getParam('offset');
        $limit = $request->getParam('limit');
        $userId = $request->getBody()['user']->email ?? null;
        $search = $request->getParam('search') ?? null;
        $sort = $request->getParam('sort') ?? null;


        try {
            $forms = $this->formService->getFormWithPagination($offset, $limit, $userId, $search, $sort);
            if ($forms) {
                $response->json( [
                    'status' => true,
                    'message' => 'Forms retrieved successfully',
                    'data' => $forms
                ]);
            } else {
                $response->json([
                    'status' => false,
                    'message' => 'No forms found'
                ]);
            }
            return ;
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => 'Failed to retrieve forms',
                'error' => $e->getMessage()
            ]);
            return ;
        }
    }

    function createDraft(Response $response, Request $request): void
    {
        $user = $request->getBody()['user'];
        try {
            $draft = $this->formService->createDraft($user->email);
            if ($draft) {
                $response->json([
                    'status' => true,
                    'message' => 'Draft created successfully',
                    'data' => $draft
                ]);
            } else {
                $response->json([
                    'status' => false,
                    'message' => 'Failed to create draft'
                ], 500);
            }
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => 'Failed to create draft',
                'error' => $e->getMessage()
            ], 500);
        }

    }

}