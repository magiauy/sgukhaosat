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

    public function getTotalCount(Response $response) {
        $totalCount = $this->service->getTotalCount();
        $response->json(['totalCount' => $totalCount]);
    }
    
    public function create(Response $res, Request $req)
    {
        $data = $req->getBody();
        $majorID = $data['MajorID'] ?? null;
        $majorName = $data['MajorName'] ?? null;

        if (!$majorID || !$majorName) {
            return $res->json(['message' => 'Dữ liệu không hợp lệ'], 400);
        }

        $this->service->create([
            'MajorID' => $majorID,
            'MajorName' => $majorName
        ]);

        return $res->json(['message' => 'Tạo ngành học thành công'], 201);
    }

    public function update(Response $response, Request $request) {
        $id = $request->getParam("id");
        if (!$id) return $response->json(['error' => 'ID is required'], 400);
        $data = $request->getBody();
        $success = $this->service->update((int)$id, $data);
        $response->json([
            'message' => $success ? 'Cập nhật ngành học thành công' : 'Cập nhật thất bại'
        ]);
    }

    public function delete(Response $response, Request $request) {
        $id = $request->getParam("id");
        if (!$id) return $response->json(['error' => 'ID is required'], 400);
        $success = $this->service->delete((int)$id);
        $response->json([
            'message' => $success ? 'Xóa ngành học thành công' : 'Xóa thất bại'
        ]);
    }
}
