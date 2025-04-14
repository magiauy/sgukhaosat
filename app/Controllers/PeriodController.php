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
    public function getPaginated(Response $response, Request $request) {
        $page = (int)($request->getParam("page") ?? 1);
        $limit = (int)($request->getParam("limit") ?? 5);
    
        $offset = ($page - 1) * $limit;
    
        $periods = $this->service->getPaginated($limit, $offset);
    
        $totalCount = $this->service->getTotalCount();
    
        if ($periods) {
            $response->json([
                'data' => $periods,
                'totalCount' => $totalCount
            ]);
        } else {
            $response->json(['error' => 'Không có dữ liệu'], 404);
        }
    }
    
    public function getTotalCount(Response $response) {
        $totalCount = $this->service->getTotalCount();
        $response->json(['totalCount' => $totalCount]);
    }
    
    public function getById(Response $response, Request $request) {
        $id = $request->getParam("id");
        if (!$id) return $response->json(['error' => 'ID is required'], 400);
        $Period = $this->service->getById((int)$id);
        if ($Period) {
            $response->json(['data' => $Period]);
        } else {
            $response->json(['error' => 'Chu kỳ không tồn tại'], 404);
        }
    }

    public function create(Response $res, Request $req)
    {
        $data = $req->getBody();
        $startYear = $data['startYear'] ?? null;
        $endYear = $data['endYear'] ?? null;

        if (!$startYear || !$endYear) {
            return $res->json(['message' => 'Dữ liệu không hợp lệ'], 400);
        }

        $this->service->create([
            'startYear' => $startYear,
            'endYear' => $endYear
        ]);

        return $res->json(['message' => 'Tạo chu kỳ thành công'], 201);
    }


    public function update(Response $response, Request $request) {
        $id = $request->getParam("id");
        if (!$id) return $response->json(['error' => 'ID is required'], 400);
        $data = $request->getBody();
        $success = $this->service->update((int)$id, $data);
        $response->json([
            'message' => $success ? 'Cập nhật chu kỳ thành công' : 'Cập nhật thất bại'
        ]);
    }

    public function delete(Response $response, Request $request) {
        $id = $request->getParam("id");
        if (!$id) return $response->json(['error' => 'ID is required'], 400);
        $success = $this->service->delete((int)$id);
        $response->json([
            'message' => $success ? 'Xóa chu kỳ thành công' : 'Xóa thất bại'
        ]);
    }
}
