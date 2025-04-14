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

    public function getTotalCount(Response $response) {
        $totalCount = $this->service->getTotalCount();
        $response->json(['totalCount' => $totalCount]);
    }
    
    public function create(Response $res, Request $req) {
        $data = $req->getBody();
        $formTypeID = $data['FTypeID'] ?? null;
        $formTypeName = $data['FTypeName'] ?? null;

        if (!$formTypeID || !$formTypeName) {
            return $res->json(['message' => 'Dữ liệu không hợp lệ'], 400);
        }

        $this->service->create([
            'FTypeID' => $formTypeID,
            'FTypeName' => $formTypeName
        ]);

        return $res->json(['message' => 'Tạo loại form thành công'], 201);
    }

    public function update(Response $response, Request $request) {
        $id = $request->getParam("id");
        if (!$id) return $response->json(['error' => 'ID is required'], 400);
        $data = $request->getBody();
        $success = $this->service->update((int)$id, $data);
        $response->json([
            'message' => $success ? 'Cập nhật loại form thành công' : 'Cập nhật thất bại'
        ]);
    }

    public function delete(Response $response, Request $request) {
        $id = $request->getParam("id");
        if (!$id) return $response->json(['error' => 'ID is required'], 400);
        $success = $this->service->delete((int)$id);
        $response->json([
            'message' => $success ? 'Xóa loại form thành công' : 'Xóa thất bại'
        ]);
    }
}
?>
