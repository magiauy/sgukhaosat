<?php
namespace Controllers;

use Core\Request;
use Core\Response;
use Services\DocumentService;

class DocumentController {
    private DocumentService $service;

    public function __construct() {
        $this->service = new DocumentService();
    }

    public function getAll(Response $response) {
        $response->json(['data' => $this->service->getAll()]);
    }

    public function getById(Response $response, $id) {
        if (!$id) $response->json([
            'error' => 'ID is required',
            'status' => false
        ]);

        $Document = $this->service->getById($id);
    
        if ($Document) {
            $response->json([
                'data' => $Document,
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
    
    public function create(Response $res, Request $req) {
        $data = $req->getBody();
        $documentTitle = $data['DocumentTitle'] ?? null;
        $type = $data['type'] ?? null;

        if (!$documentTitle || !$type) {
            return $res->json([
                'message' => 'Thiếu dữ liệu bắt buộc',
                'status' => false
            ]);
        }

        $documentId = $this->service->create([
            'DocumentTitle' => $documentTitle,
            'type' => $type,
            'createAt' => date('Y-m-d H:i:s'),
            'isDelete' => 0
        ]);

        if ($documentId) {
            return $res->json([
                'message' => 'Tạo tài liệu thành công',
                'status' => true,
                'data' => [ 'DocumentID' => $documentId ]
            ]);
        }

        return $res->json([
            'message' => 'Tạo tài liệu thất bại',
            'status' => false
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

    public function delete(Response $response, Request $request) {
        $id = $request->getParam("id");
        if (!$id) $response->json([
            'error' => 'ID is required',
            'status' => false
        ]);
        $success = $this->service->delete($id);
        $response->json([
            'message' => $success ? 'Xóa tài liệu thành công' : 'Xóa thất bại',
            'status' => $success
        ]);
    }
    
    public function getPaginated(Response $response, Request $request) {
        $page = (int)($request->getParam("page") ?? 1);
        $limit = (int)($request->getParam("limit") ?? 5);
        $offset = ($page - 1) * $limit;
    
        $documents = $this->service->getPaginated($limit, $offset);
        $totalCount = $this->service->getTotalCount();

    
        $response->json([
            'data' => $documents,
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
    
    /**
     * Get documents by type with pagination for UI pages
     *
     * @param Response $response
     * @param Request $request
     * @param string $type Document type
     * @return void
     */
    public function getDocumentsByType(Response $response, Request $request, $type) {
        $page = (int)($request->getParam("page") ?? 1);
        $limit = (int)($request->getParam("limit") ?? 5);
        $offset = ($page - 1) * $limit;
        
        $result = $this->service->getDocumentsByType($type, $limit, $offset);
        
        $response->json([
            'documents' => $result['documents'],
            'totalCount' => $result['totalCount'],
            'status' => true
        ]);
    }
    
    /**
     * Get files associated with a document
     *
     * @param Response $response
     * @param int $documentId
     * @return void
     */
    public function getFilesByDocumentId(Response $response, $documentId) {
        $files = $this->service->getFilesByDocumentId((int)$documentId);
        
        $response->json([
            'files' => $files,
            'status' => true
        ]);
    }
}
