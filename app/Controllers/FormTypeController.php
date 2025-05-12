<?php
namespace Controllers;

use Core\Request;
use Core\Response;
use Services\FormTypeService;

class FormTypeController {
    private FormTypeService $service;

    public function __construct() {
        $this->service = new FormTypeService();
    }

    public function getAll(Response $response) {
        $response->json(['data' => $this->service->getAll()]);
    }

    public function getById(Response $response, $id) {
        if (!$id) $response->json(['error' => 'ID is required'], 400);
    
        $FType = $this->service->getById($id);
    
        if ($FType) {
            $response->json(['data' => $FType]);
        } else {
            $response->json(['error' => 'Loại khảo sát không tồn tại'], 404);
        }
    }

    public function getTotalCount(Response $response) {
        $totalCount = $this->service->getTotalCount();
        $response->json(['totalCount' => $totalCount]);
    }
    
    public function create(Response $res, Request $req) {
        $data = $req->getBody();
        $formTypeID = $data['FTypeID'] ?? null;
        $formTypeName = $data['FTypeName'] ?? null;

        if (!$formTypeID || !$formTypeName) {
             $res->json([
                 'message' => 'Dữ liệu không hợp lệ',
                 'status'=>false
             ]);
        }
        if ($this->service->isFTypeIDExists($formTypeID)) {
            $res->json([
                'message' => 'Loại khảo sát đã tồn tại. Vui lòng chọn mã loại khảo sát khác.',
                'status' => false
            ]);
        }

        $this->service->create([
            'FTypeID' => $formTypeID,
            'FTypeName' => $formTypeName
        ]);

        $res->json([
            'message' => 'Tạo loại form thành công',
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
            'message' => $success ? 'Cập nhật loại khảo sát thành công' : 'Cập nhật thất bại',
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
            'message' => $success ? 'Xóa loại khảo sát thành công' : 'Xóa thất bại',
            'status' => $success
        ]);
    }
    

    public function getPaginated(Response $response, Request $request) {
        $page = (int)($request->getParam("page") ?? 1);
        $limit = (int)($request->getParam("limit") ?? 5);
        $offset = ($page - 1) * $limit;
    
        $fType = $this->service->getPaginated($limit, $offset);
        $totalCount = $this->service->getTotalCount();
    
        $response->json([
            'data' => $fType,
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

