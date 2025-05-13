<?php
namespace Controllers;

use Core\Request;
use Core\Response;
use Services\PeriodService;

class PeriodController {
    private PeriodService $service;

    public function __construct() {
        $this->service = new PeriodService();
    }

    public function getAll(Response $response) {
        $response->json(['data' => $this->service->getAll()]);
    }
    
    public function getById(Response $response, $id) {
        if (!$id) $response->json(
            ['error' => 'ID is required',
                'status' => false
            ]);
    
        $Period = $this->service->getById((int)$id);
    
        if ($Period) {
            $response->json([
                'data' => $Period,
                'status' => true
            ]);
        } else {
            $response->json(['error' => 'Chu kỳ không tồn tại'], 404);
        }
    }
    
    public function getTotalCount(Response $response) {
        $totalCount = $this->service->getTotalCount();
        $response->json(['totalCount' => $totalCount]);
    }
    
    public function create(Response $res, Request $req)
    {
        $data = $req->getBody();
        $startYear = $data['startYear'] ?? null;
        $endYear = $data['endYear'] ?? null;

        if (!$startYear || !$endYear) {
            $res->json([
                'message' => 'Dữ liệu không hợp lệ' ,
                'status' => false
            ]);
        }

        $this->service->create([
            'startYear' => $startYear,
            'endYear' => $endYear
        ]);

        $res->json([
            'message' => 'Tạo chu kỳ thành công',
            'status' => true
        ]);
    }

    public function update(Response $response, Request $request) {
        $id = $_GET['id'] ?? null;
        if (!$id) $response->json([
            'error' => 'ID is required',
            'status' => false
        ]);

        $data = $request->getBody();
        $success = $this->service->update((int)$id, $data);

        $response->json([
            'message' => $success ? 'Cập nhật chu kỳ thành công' : 'Cập nhật thất bại',
            'status' => $success
        ]);
    }


    public function delete(Response $response, Request $request) {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
        if (!$id) {
            $response->json([
                'error' => 'ID is required',
                'status' => false
            ]);
        }
        $success = $this->service->delete($id);
        if ($success) {
            $response->json([
                'message' => 'Xóa chu kỳ thành công',
                'status' => true
            ]);
        } else {
            $response->json([
                'message' => 'Xóa chu kỳ thất bại',
                'status' => false
            ]);
        }
    }
    
    public function getPaginated(Response $response, Request $request) {
        $page = (int)($request->getParam("page") ?? 1);
        $limit = (int)($request->getParam("limit") ?? 5);
        $offset = ($page - 1) * $limit;
    
        $periods = $this->service->getPaginated($limit, $offset);
        $totalCount = $this->service->getTotalCount();

    
        $response->json([
            'data' => $periods,
            'totalCount' => $totalCount
        ]);
    }
    
    public function search(Response $response, Request $request) {
        $keyword = $request->getParam('search') ?? '';
        $limit = (int)($request->getParam('limit') ?? 10);
        $offset = (int)($request->getParam('offset') ?? 0);
        $startYear = $request->getParam('startYear') ?? null;
        $endYear = $request->getParam('endYear') ?? null;
    
        $result = $this->service->searchPaginated($keyword, $limit, $offset, $startYear, $endYear);
    
        $response->json([
            'data' => $result,
            'status' => true,
        ]);
    }
    
}
