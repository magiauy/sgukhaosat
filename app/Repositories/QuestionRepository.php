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
    public function create($data,\PDO $pdo){

    }
    public function createQuestion($data,$form, \PDO $pdo): bool
    {
        try {
            if (empty($data)) {
                throw new \Exception("Không có dữ liệu để thêm!", 400);
            }
            $FID = $form;
            $mainSql = "INSERT INTO question (QContent, QParent, QTypeID, FID, QIndex,QRequired) VALUES (:QContent, :QParent, :QTypeID, :FID, :QIndex, :QRequired)";
            $stmt = $pdo->prepare($mainSql);
            foreach ($data as $question) {
                $params = [
                    ':QContent' => $question['QContent'] ?? null,
                    ':QParent' => $question['QParent'] ?? null,
                    ':QTypeID' => $question['QTypeID'] ?? null,
                    ':FID' => $FID ?? null,
                    ':QIndex' => $question['QIndex'] ?? null,
                    ':QRequired' => $question['QRequired'] ?? null
                ];

                $stmt->execute($params);
                $parentId = $pdo->lastInsertId();

                // Handle children if they exist
                if (!empty($question['children'])) {
                    foreach ($question['children'] as $child) {
//                        print_r("child: " . json_encode($child));
                        $child['QParent'] = $parentId;
                        $stmt->execute([
                            ':QContent' => $child['QContent'] ?? null,
                            ':QParent' => $child['QParent'] ?? null,
                            ':QTypeID' => $child['QTypeID'] ?? null,
                            'QRequired' => $child['QRequired'] ?? null,
                            ':FID' => $FID ?? null,
                            ':QIndex' => $child['QIndex'] ?? null
                        ]);
                    }
                }
            }
        } catch (Exception $e) {
            throw new Exception($e->getMessage(), 500);
        }
        return true;
    }

    public function update($id, $data, PDO $pdo)
    {
        try {
            if (empty($data)) {
                throw new Exception("Không có dữ liệu để cập nhật!", 400);
            }

            $sql = "UPDATE question SET QIndex = :QIndex ,QRequired = :QRequired WHERE QID = :QID";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':QID' => $id,
                ':QIndex' => $data['QIndex'],
                ':QRequired' => $data['QRequired'] ?? null

            ]);

            //Update index của các câu hỏi con
            if (!empty($data['children'])) {
                foreach ($data['children'] as $child) {
//                    print_r("child: " . json_encode($child));
                    $sql = "UPDATE question SET QIndex = :QIndex WHERE QID = :QID";
                    $stmt = $pdo->prepare($sql);
//                    print_r("QID: " . $child['QID'] . " QIndex: " . $child['QIndex'] . $child['QContent']. "\n");
                    $stmt->execute([
                        ':QID' => $child['QID'],
                        ':QIndex' => $child['QIndex']
                    ]);

                }
            }


        } catch (Exception $e) {
            throw new Exception($e->getMessage(), 500);
        }
    }

    public function delete($id, PDO $pdo)
    {
        try {
            $childIDs = $this->getChildQuestions($id, $pdo);
            if (!empty($childIDs)) {
                $placeholders = implode(',', array_fill(0, count($childIDs), '?'));
                $sqlDeleteChildren = "DELETE FROM question WHERE QID IN ($placeholders)";
                $stmt = $pdo->prepare($sqlDeleteChildren);
                $stmt->execute($childIDs);

            }// Xóa chính nó sau khi đã xóa hết con
            $sqlDeleteParent = "DELETE FROM question WHERE QID = ?";
            $stmt = $pdo->prepare($sqlDeleteParent);
            $stmt->execute([$id]);
        } catch (Exception $e) {
            throw new Exception($e->getMessage(), 500);
        }

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
        try {
            $sql = "SELECT * FROM question WHERE QID = :QID";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':QID' => $id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw new Exception($e->getMessage(), 500);
        }
    }

    public function getAll(): array
    {
        try {
            $sql = "SELECT * FROM question";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw new Exception($e->getMessage(), 500);
        }
    }


    public function getByFormID($formID): array
    {
        // error_log("getByForaaaaaamID: " . $formID);
        try {
            $sql = "SELECT * FROM question WHERE FID = :FID AND `isDeleted` = 0";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':FID' => $formID]);
            $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);// Tạo danh sách cây câu hỏi
            foreach ($questions as &$question) {
                $question['QID'] = (int)$question['QID'];
                $question['FID'] = (int)$question['FID'];
                $question['QIndex'] = (int)$question['QIndex'];
                $question['QParent'] = $question['QParent'] !== null ? (int)$question['QParent'] : null;
                $question['QRequired'] = (int)$question['QRequired'];
                $question['isDeleted'] = (int)$question['isDeleted'];
                // Cast any other integer fields as needed
            }
            // error_log("da chay toi dayyyyyyyyyyy");
            // error_log("questions: " . json_encode($questions));
            return $this->buildQuestionTree($questions);
        } catch (Exception $e) {
            throw new \Exception("Lỗi khi lấy câu hỏi: " . $e->getMessage(), 500);
        }
    }

    function buildQuestionTree(array $questions): array {
        $questionMap = [];
        foreach ($questions as $q) {
            $questionMap[$q['QID']] = $q + ['children' => []];
        }

        $tree = [];

        foreach ($questionMap as $qid => &$q) {
            if ($q['QParent']) {
                if (isset($questionMap[$q['QParent']])) {
                    $questionMap[$q['QParent']]['children'][] = &$q;
                }
                // Nếu parent không tồn tại trong danh sách => loại bỏ
            } else {
                $tree[] = &$q;
            }
        }
        return $tree;
    }

    function softDelete($id ,PDO $pdo)
    {
        $sql = "UPDATE question SET isDeleted = 1 WHERE QID = :QID";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':QID' => $id]);
        return true;
    }

    function hasAnswers($id): bool
    {
        try {
            $sql = "SELECT COUNT(*) FROM answer WHERE QID = :QID";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':QID' => $id]);
            return $stmt->fetchColumn() > 0;
        } catch (Exception $e) {
            throw new Exception($e->getMessage(), 500);
        }
    }

    /**
     * Get question statistics for a form
     */
    public function getQuestionStatistics($formId) {
        $sql = "SELECT q.QContent as question, COUNT(a.AID) as responseCount 
                FROM question q 
                LEFT JOIN answer a ON q.QID = a.QID 
                WHERE q.FID = :formId 
                GROUP BY q.QID, q.QContent";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':formId' => $formId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getByFormIDForStatistic(int $formId)
    {
        try {
            $sql = "SELECT * FROM question WHERE FID = :FID";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':FID' => $formId]);
            $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);// Tạo danh sách cây câu hỏi
            foreach ($questions as &$question) {
                $question['QID'] = (int)$question['QID'];
                $question['FID'] = (int)$question['FID'];
                $question['QIndex'] = (int)$question['QIndex'];
                $question['QParent'] = $question['QParent'] !== null ? (int)$question['QParent'] : null;
                $question['QRequired'] = (int)$question['QRequired'];
                $question['isDeleted'] = (int)$question['isDeleted'];
                // Cast any other integer fields as needed
            }
            // error_log("da chay toi dayyyyyyyyyyy");
            // error_log("questions: " . json_encode($questions));
            return $this->buildQuestionTree($questions);
        } catch (Exception $e) {
            throw new \Exception("Lỗi khi lấy câu hỏi: " . $e->getMessage(), 500);
        }
    }

    public function getChildren(int $questionId)
    {
        try {
            $sql = "SELECT * FROM question WHERE QParent = :QParent";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':QParent' => $questionId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw new Exception($e->getMessage(), 500);
        }
    }
}