<?php

namespace Controllers;

use Controllers\Interface\IDraftController;
use Core\Request;
use Core\Response;
use Services\Interface\IDraftService;
use Exception;

class DraftController implements IDraftController
{
    private IDraftService $draftService;

    public function __construct(IDraftService $draftService)
    {
        $this->draftService = $draftService;
    }

    public function create(Response $response, Request $request): void
    {
        $data = $request->getBody();
        try {
            $id = $this->draftService->create($data);
            $response->json([
                'status' => true,
                'message' => 'Draft created successfully',
                'id' => $id
            ]);
        } catch (Exception $e) {
            $response->json([
                'status' => false,
                'message' => 'Failed to create draft',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Response $response, Request $request): void
    {
        $data = $request->getBody();
        $id = $request->getParam('id');

        try {
            $success = $this->draftService->update($id, $data);
            $response->json([
                'status' => $success,
                'message' => $success ? 'Draft updated successfully' : 'Draft not found or not updated'
            ], $success ? 200 : 404);
        } catch (Exception $e) {
            $response->json([
                'status' => false,
                'message' => 'Failed to update draft',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function delete(Response $response, Request $request): void
    {
        $id = $request->getParam('id');

        try {
            $success = $this->draftService->delete($id);
            $response->json([
                'status' => $success,
                'message' => $success ? 'Draft deleted successfully' : 'Draft not found'
            ], $success ? 200 : 404);
        } catch (Exception $e) {
            $response->json([
                'status' => false,
                'message' => 'Failed to delete draft',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getById(Response $response, Request $request): void
    {
        $id = $request->getParam('id');

        try {
            $data = $this->draftService->getById($id);
            if ($data) {
                $response->json([
                    'status' => true,
                    'data' => $data
                ]);
            } else {
                $response->json([
                    'status' => false,
                    'message' => 'Draft not found'
                ], 404);
            }
        } catch (Exception $e) {
            $response->json([
                'status' => false,
                'message' => 'Failed to fetch draft',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAll(Response $response, Request $request): void
    {
        try {
            $data = $this->draftService->getAll();
            $response->json([
                'status' => true,
                'data' => $data
            ]);
        } catch (Exception $e) {
            $response->json([
                'status' => false,
                'message' => 'Failed to fetch drafts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getByUserID(Response $response, Request $request): void
    {
        $uid = $request->getParam('uid');

        try {
            $data = $this->draftService->getByUserID($uid);
            $response->json([
                'status' => true,
                'data' => $data
            ]);
        } catch (Exception $e) {
            $response->json([
                'status' => false,
                'message' => 'Failed to fetch drafts by user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function idGenerate(Response $response, Request $request): void
    {
        try {
            $id = $this->draftService->generateId();
            $response->json([
                'status' => true,
                'nextId' => $id
            ]);
        } catch (Exception $e) {
            $response->json([
                'status' => false,
                'message' => 'Failed to generate ID',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
