<?php

namespace Controllers;

use Controllers\Interface\IBaseController;
use Core\Request;
use Core\Response;
use Services\AnswerService;

class AnswerController implements IBaseController
{
    private AnswerService $answerService;

    public function __construct()
    {
        $this->answerService = new AnswerService();
    }

    function create(Response $response, Request $request)
    {
        try {
            $data = $request->getBody();
            
            // Validate required fields
            if (empty($data['RID']) || empty($data['QID']) || !isset($data['AContent'])) {
                throw new \Exception("Result ID, Question ID, and Answer Content are required", 400);
            }
            
            $result = $this->answerService->create($data);
            
            $response->json([
                'status' => true,
                'message' => 'Answer created successfully',
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
            $questionId = $request->getParam('id');
            
            if (empty($questionId) || empty($data['RID'])) {
                throw new \Exception("Question ID and Result ID are required", 400);
            }
            
            $result = $this->answerService->update($questionId, $data);
            
            $response->json([
                'status' => true,
                'message' => 'Answer updated successfully',
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
            $data = $request->getBody();
            
            if (empty($data['QID']) || empty($data['RID'])) {
                throw new \Exception("Question ID and Result ID are required", 400);
            }
            
            $result = $this->answerService->delete([
                'QID' => $data['QID'],
                'RID' => $data['RID']
            ]);
            
            $response->json([
                'status' => true,
                'message' => 'Answer deleted successfully'
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
            $data = $request->getBody();
            
            if (empty($data['QID']) || empty($data['RID'])) {
                throw new \Exception("Question ID and Result ID are required", 400);
            }
            
            $answer = $this->answerService->getById([
                'QID' => $data['QID'],
                'RID' => $data['RID']
            ]);
            
            if (!$answer) {
                throw new \Exception("Answer not found", 404);
            }
            
            $response->json([
                'status' => true,
                'data' => $answer
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
            $answers = $this->answerService->getAll();
            
            $response->json([
                'status' => true,
                'data' => $answers
            ]);
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    function getByResult(Response $response, Request $request)
    {
        try {
            $resultId = $request->getParam('resultId');
            
            if (empty($resultId)) {
                throw new \Exception("Result ID is required", 400);
            }
            
            $answers = $this->answerService->getByResult($resultId);
            
            $response->json([
                'status' => true,
                'data' => $answers
            ]);
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    function getByQuestion(Response $response, Request $request)
    {
        try {
            $questionId = $request->getParam('questionId');
            
            if (empty($questionId)) {
                throw new \Exception("Question ID is required", 400);
            }
            
            $answers = $this->answerService->getByQuestion($questionId);
            
            $response->json([
                'status' => true,
                'data' => $answers
            ]);
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    function getAnswerStatistics(Response $response, Request $request)
    {
        try {
            $formId = $request->getParam('formId');
            $questionId = $request->getParam('questionId');
            
            if (empty($formId) || empty($questionId)) {
                throw new \Exception("Form ID and Question ID are required", 400);
            }
            
            $statistics = $this->answerService->getAnswerStatistics($formId, $questionId);
            
            $response->json([
                'status' => true,
                'data' => $statistics
            ]);
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }
}