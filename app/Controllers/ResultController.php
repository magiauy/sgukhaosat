<?php

namespace Controllers;

use Controllers\Interface\IBaseController;
use Core\Request;
use Core\Response;
use Services\ResultService;

class ResultController implements IBaseController
{
    private ResultService $resultService;

    public function __construct()
    {
        $this->resultService = new ResultService();
    }

    function create(Response $response, Request $request)
    {
        try {
            $data = $request->getBody();
            
            // Validate required fields
            if (empty($data['FID']) || empty($data['UID'])) {
                throw new \Exception("Form ID and User ID are required", 400);
            }
            
            $result = $this->resultService->create($data);
            
            $response->json([
                'status' => true,
                'message' => 'Result created successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    function update(Response $response, Request $request)
    {
        try {
            $data = $request->getBody();
            $id = $request->getParam('id');
            
            if (empty($id)) {
                throw new \Exception("Result ID is required", 400);
            }
            
            $result = $this->resultService->update($id, $data);
            
            $response->json([
                'status' => true,
                'message' => 'Result updated successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    function delete(Response $response, Request $request)
    {
        try {
            $id = $request->getParam('id');
            
            if (empty($id)) {
                throw new \Exception("Result ID is required", 400);
            }
            
            $result = $this->resultService->delete($id);
            
            $response->json([
                'status' => true,
                'message' => 'Result deleted successfully'
            ]);
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    function getById(Response $response, Request $request)
    {
        try {
            $id = $request->getParam('id');
            
            if (empty($id)) {
                throw new \Exception("Result ID is required", 400);
            }
            
            $result = $this->resultService->getById($id);
            
            if (!$result) {
                throw new \Exception("Result not found", 404);
            }
            
            $response->json([
                'status' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    function getAll(Response $response, Request $request)
    {
        try {
            $results = $this->resultService->getAll();
            
            $response->json([
                'status' => true,
                'data' => $results
            ]);
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    function getByForm(Response $response, Request $request)
    {
        try {
            $formId = $request->getParam('formId');
            
            if (empty($formId)) {
                throw new \Exception("Form ID is required", 400);
            }
            
            $results = $this->resultService->getByForm($formId);
            
            $response->json([
                'status' => true,
                'data' => $results
            ]);
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    function getByUser(Response $response, Request $request)
    {
        try {
            $userId = $request->getParam('userId');
            
            if (empty($userId)) {
                throw new \Exception("User ID is required", 400);
            }
            
            $results = $this->resultService->getByUser($userId);
            
            $response->json([
                'status' => true,
                'data' => $results
            ]);
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    function countByForm(Response $response, Request $request)
    {
        try {
            $formId = $request->getParam('formId');
            
            if (empty($formId)) {
                throw new \Exception("Form ID is required", 400);
            }
            
            $count = $this->resultService->countByForm($formId);
            
            $response->json([
                'status' => true,
                'data' => $count
            ]);
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    function submitSurvey(Response $response, Request $request)
    {
        try {
            $data = $request->getBody();
            
            if (empty($data['formId']) || empty($data['userId']) || empty($data['answers'])) {
                error_log("ResultController::submitSurvey - Missing required fields: " . json_encode($data));
                throw new \Exception("Form ID, User ID, and answers are required", 400);
            }
            
            $result = $this->resultService->submitSurvey($data['formId'], $data['userId'], $data['answers']);
            if ($result['success'] === false) {
                error_log("ResultController::submitSurvey - Error: " . json_encode($result));
                throw new \Exception($result['message'], 400);
            }
            else {
                $response->json([
                    'status' => true,
                    'message' => 'Survey submitted successfully',
                    'data' => $result
                ]);
            }
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }
}