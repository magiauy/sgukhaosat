<?php

namespace Repositories;

use Exception;
use PDO;
use Repositories\Interface\IQuestionRepository;

class QuestionRepository implements IQuestionRepository
{
    private $pdo;
    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
    }

    /**
     * @throws Exception
     */
//    public function create($data, PDO $pdo)
//    {
//        if (empty($data)) {
//            throw new Exception("Không có dữ liệu để thêm!", 400);
//        }
//        $sql = "INSERT INTO question (FID, QIndex, QContent, QParent, QTypeID) VALUES (:FID, :QIndex, :QContent, :QParent, :QTypeID)";
//        $stmt = $pdo->prepare($sql);
//        print_r(json_encode($data));
//        $stmt->execute([
//            ':FID' => $data['FID'],
//            ':QIndex' => $data['QIndex'],
//            ':QContent' => $data['QContent'],
//            ':QParent' => $data['QParent'],
//            ':QTypeID' => $data['QTypeID']
//        ]);
//
//
//    }
    public function create($data, \PDO $pdo): bool
    {
        if (empty($data)) {
            throw new \Exception("Không có dữ liệu để thêm!", 400);
        }

        $mainSql = "INSERT INTO question (QContent, QParent, QTypeID, FID, QIndex) VALUES (:QContent, :QParent, :QTypeID, :FID, :QIndex)";
        $stmt = $pdo->prepare($mainSql);

        foreach ($data as $question) {
            $params = [
                ':QContent' => $question['QContent'] ?? null,
                ':QParent' => $question['QParent'] ?? null,
                ':QTypeID' => $question['QTypeID'] ?? null,
                ':FID' => $question['FID'] ?? null,
                ':QIndex' => $question['QIndex'] ?? null
            ];

            $stmt->execute($params);
            $parentId = $pdo->lastInsertId();

            // Handle children if they exist
            if (!empty($question['children'])) {
                foreach ($question['children'] as $child) {
                    $child['QParent'] = $parentId;
                    $child['FID'] = $question['FID'];
                    $stmt->execute([
                        ':QContent' => $child['QContent'] ?? null,
                        ':QParent' => $child['QParent'] ?? null,
                        ':QTypeID' => $child['QTypeID'] ?? null,
                        ':FID' => $child['FID'] ?? null,
                        ':QIndex' => $child['QIndex'] ?? null
                    ]);
                }
            }
        }
        return true;
    }

    public function update($id, $data, PDO $pdo)
    {
        if (empty($data)) {
            throw new Exception("Không có dữ liệu để cập nhật!", 400);
        }
        $sql = "UPDATE question SET QIndex = :QIndex, QContent = :QContent, QParent = :QParent, QTypeID = :QTypeID WHERE QID = :QID";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':QID' => $id,
            ':QIndex' => $data['QIndex'],
            ':QContent' => $data['QContent'],
            ':QParent' => $data['QParent'],
            ':QTypeID' => $data['QTypeID']
        ]);
    }

    public function delete($id, PDO $pdo)
    {
        $childIDs = $this->getChildQuestions($id, $pdo);

        if (!empty($childIDs)) {
            $placeholders = implode(',', array_fill(0, count($childIDs), '?'));
            $sqlDeleteChildren = "DELETE FROM question WHERE QID IN ($placeholders)";
            $stmt = $pdo->prepare($sqlDeleteChildren);
            $stmt->execute($childIDs);

        }

        // Xóa chính nó sau khi đã xóa hết con
        $sqlDeleteParent = "DELETE FROM question WHERE QID = ?";
        $stmt = $pdo->prepare($sqlDeleteParent);
        $stmt->execute([$id]);

    }

    private function getChildQuestions($QID, PDO $pdo): array
    {
        $sql = "SELECT QID FROM question WHERE QParent = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$QID]);
        $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $allChildren = [];
        foreach ($rows as $childID) {
            $allChildren[] = $childID;
            $allChildren = array_merge($allChildren, $this->getChildQuestions($childID, $pdo));
        }

        return $allChildren;
    }

    public function getById($id)
    {
        $sql = "SELECT * FROM question WHERE QID = :QID";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':QID' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getAll(): array
    {
        $sql = "SELECT * FROM question";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    function getByFormID($formID): array
    {
        $sql = "SELECT * FROM question WHERE FID = :FID";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':FID' => $formID]);
        $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Tạo danh sách cây câu hỏi
        $questionTree = [];
        $lookup = [];

        // Tạo lookup table để truy vấn nhanh
        foreach ($questions as $question) {
            $question['children'] = [];
            $lookup[$question['QID']] = $question;
        }

        // Xây dựng cây cha-con
        foreach ($lookup as &$question) {
            if (!empty($question['QParent'])) {
                $lookup[$question['QParent']]['children'][] = &$question;
            } else {
                $questionTree[] = &$question;
            }
        }

        return $questionTree;
    }


}