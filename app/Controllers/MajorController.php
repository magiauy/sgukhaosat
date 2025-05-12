<?php
namespace Controllers;

use Core\Request;
use Core\Response;
use Services\MajorService;

class MajorController {
    private MajorService $service;

    public function __construct() {
        $this->service = new MajorService();
    }

    public function getAll(Response $response) {
        $response->json(['data' => $this->service->getAll()]);
    }

    public function getById(Response $response, $id) {
        if (!$id) $response->json([
            'error' => 'ID is required',
            'status' => false
        ]);

        $Major = $this->service->getById($id);
    
        if ($Major) {
            $response->json([
                'data' => $Major,
                'status' => true
            ]);
        } else {
            $response->json([
                'error' => 'Chu kỳ không tồn tại',
                'status' => false
            ]);
        }
    }

    public function getTotalCount(Response $response) {
        $totalCount = $this->service->getTotalCount();
        $response->json(['totalCount' => $totalCount]);
    }
    
    public function create(Response $res, Request $req) {
        $data = $req->getBody();
        $majorID = $data['MajorID'] ?? null;
        $majorName = $data['MajorName'] ?? null;
    
        if (!$majorName || !$majorID) {
            $res->json([
                'message' => 'Dữ liệu không hợp lệ',
                'status' => false
            ]);
        } 
        if ($this->service->isMajorIDExists($majorID)) {
            $res->json([
                'message' => 'Mã ngành đã tồn tại. Vui lòng chọn mã ngành khác.',
                'status' => false
            ]);
        }
    
        $this->service->create([
            'MajorName' => $majorName,
            'MajorID' => $majorID
        ]);
    
        $res->json([
            'message' => 'Tạo ngành học thành công',
            'status' => true
        ]);
    }
    

    public function update(Response $response, Request $request) {
        $id = $request->getParam("id");
        if (!$id) $response->json([
            'error' => 'ID is required',
            'status' => false
        ]);

        $data = $request->getBody();
        $success = $this->service->update($id, $data);
        
        $response->json([
            'message' => $success ? 'Cập nhật ngành học thành công' : 'Cập nhật thất bại',
            'status' => $success
        ]);
    }

    public function delete(Response $response, Request $request) {
        $id = $request->getParam("id");
        if (!$id) $response->json([
            'error' => 'ID is required',
            'status' => false
        ]);
        $success = $this->service->delete($id);
        $response->json([
            'message' => $success ? 'Xóa ngành học thành công' : 'Xóa thất bại',
            'status' => $success
        ]);
    }
    
    public function getPaginated(Response $response, Request $request) {
        $page = (int)($request->getParam("page") ?? 1);
        $limit = (int)($request->getParam("limit") ?? 5);
        $offset = ($page - 1) * $limit;
    
        $majors = $this->service->getPaginated($limit, $offset);
        $totalCount = $this->service->getTotalCount();

    
        $response->json([
            'data' => $majors,
            'totalCount' => $totalCount
        ]);
    }
    
    public function search(Response $response, Request $request) {
//        $keyword = $queryParams['search'] ?? '';
//        $page = (int)($queryParams['page'] ?? 1);
//        $limit = (int)($queryParams['limit'] ?? 5);
//        $offset = ($page - 1) * $limit;

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
