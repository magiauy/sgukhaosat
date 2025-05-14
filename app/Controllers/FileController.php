<?php
namespace Controllers;

use Core\Request;
use Core\Response;
use Services\FileService;

class FileController {
    private FileService $service;

    public function __construct() {
        $this->service = new FileService();
    }

    public function getAllByDocumentId(Response $response, Request $request) {
        $id_Doc = $request->getParam("id_Doc") ?? null;

        if (!$id_Doc) {
            return $response->json([
                'message' => 'Thiếu tham số id_Doc',
                'status' => false
            ]);
        }

        $files = $this->service->getAllByDocumentId($id_Doc);

        return $response->json([
            'data' => $files,
            'status' => true
        ]);
    }


    public function getById(Response $response, $id) {
        if (!$id) $response->json([
            'error' => 'ID is required',
            'status' => false
        ]);

        $File = $this->service->getById($id);
    
        if ($File) {
            $response->json([
                'data' => $File,
                'status' => true
            ]);
        } else {
            $response->json([
                'error' => 'Tài liệu không tồn tại',
                'status' => false
            ]);
        }
    }

    public function getTotalCount(Response $response) {
        $totalCount = $this->service->getTotalCount();
        $response->json(['totalCount' => $totalCount]);
    }
    
   public function createMultiple(Response $res, Request $req) {
    $data = $req->getBody();
    $files = $data['files'] ?? [];

    if (empty($files)) {
        return $res->json([
            'message' => 'Không có file nào được gửi.',
            'status' => false
        ]);
    }

    $success = $this->service->createMultiple($files);

    return $res->json([
        'message' => $success ? 'Thêm file thành công' : 'Thêm file thất bại',
        'status' => $success
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
            'message' => $success ? 'Cập nhật tài liệu thành công' : 'Cập nhật thất bại',
            'status' => $success
        ]);
    }

    public function delete(Response $res, Request $req, $id_Doc) {
        $success = $this->service->delete($id_Doc);
        return $res->json([
            'message' => $success ? 'Đã ẩn toàn bộ file' : 'Ẩn thất bại',
            'status' => $success
        ]);
    }

    
    public function getPaginated(Response $response, Request $request) {
        $page = (int)($request->getParam("page") ?? 1);
        $limit = (int)($request->getParam("limit") ?? 5);
        $offset = ($page - 1) * $limit;
    
        $files = $this->service->getPaginated($limit, $offset);
        $totalCount = $this->service->getTotalCount();

    
        $response->json([
            'data' => $files,
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
