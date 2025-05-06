<?php
namespace Controllers;

use Core\Request;
use Core\Response;
use Services\PositionService;

class PositionController {
    private PositionService $service;

    public function __construct() {
        $this->service = new PositionService();
    }

    public function getAll(Response $response) {
        $response->json(['data' => $this->service->getAll(),
                            'message' => 'Lấy danh sách chức vụ thành công',
                            'status' => true]);
    }

    public function getById(Response $response, $id) {
        if (!$id) return $response->json(['error' => 'ID is required'], 400);
    
        $Position = $this->service->getById($id);
    
        if ($Position) {
            $response->json(['data' => $Position]);
        } else {
            $response->json(['error' => 'Chu kỳ không tồn tại'], 404);
        }
    }

    public function getTotalCount(Response $response) {
        $totalCount = $this->service->getTotalCount();
        $response->json(['totalCount' => $totalCount]);
    }
    
    public function create(Response $res, Request $req) {
        $data = $req->getBody();
        $positionName = $data['PositionName'] ?? null;
    
        if (!$positionName) {
            return $res->json(['message' => 'Dữ liệu không hợp lệ'], 400);
        } 
    
        $this->service->create([
            'PositionName' => $positionName
        ]);
    
        return $res->json(['message' => 'Tạo chức vụ học thành công'], 201);
    }
    

    public function update(Response $response, Request $request) {
        $id = $request->getParam("id");
        if (!$id) return $response->json(['error' => 'ID is required'], 400);

        $data = $request->getBody();
        $success = $this->service->update($id, $data);
        
        $response->json([
            'message' => $success ? 'Cập nhật chức vụ học thành công' : 'Cập nhật thất bại'
        ]);
    }

    public function delete(Response $response, Request $request) {
        $id = $request->getParam("id");
        if (!$id) return $response->json(['error' => 'ID is required'], 400);
        $success = $this->service->delete($id);
        $response->json([
            'message' => $success ? 'Xóa chức vụ học thành công' : 'Xóa thất bại'
        ]);
    }
    
    public function getPaginated(Response $response, Request $request) {
        $page = (int)($request->getParam("page") ?? 1);
        $limit = (int)($request->getParam("limit") ?? 5);
        $offset = ($page - 1) * $limit;
    
        $positions = $this->service->getPaginated($limit, $offset);
        $totalCount = $this->service->getTotalCount();

    
        $response->json([
            'data' => $positions,
            'totalCount' => $totalCount
        ]);
    }
    
    public function search(Response $response, Request $request) {
        $keyword = $request->getParam('search') ?? '';
        $limit = (int)($request->getParam('limit') ?? 10);
        $offset = (int)($request->getParam('offset') ?? 0);
        $result = $this->service->searchPaginated($keyword, $limit, $offset);

        $response->json([
            'data' => $result,
            'status' => true,
        ]);
    }
    
}
