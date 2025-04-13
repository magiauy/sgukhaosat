<?php

namespace Repositories;
use Exception;
use mysql_xdevapi\Result;
use Repositories\Interface\IFormRepositoryTransaction;

class FormRepository implements IFormRepositoryTransaction{

    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
    }

    /**
     * @throws Exception
     */
    public function create($data, \PDO $pdo): bool|string
    {
        if (empty($data)) {
            throw new \Exception("Không có dữ liệu để thêm!", 400);
        }
            $sql = "INSERT INTO forms ( FName,UID, TypeID, MajorID, PeriodID, Note, `Limit`, File, Status) VALUES ( :FName,:UID, :TypeID, :MajorID, :PeriodID, :Note, :Limit, :File, :Status)";
            $stmt = $pdo->prepare($sql);
//            print_r($data);
            $stmt->execute([
                ':FName' => $data['FName'],
                ':UID' => $data['UID'],
                ':TypeID' => $data['TypeID'],
                ':MajorID' => $data['MajorID'],
                ':PeriodID' => $data['PeriodID'],
                ':Note' => $data['Note'],
                ':Limit' => $data['Limit'],
                ':File' => $data['File'],
                ':Status' => $data['Status']
            ]);
            //Trả về ID của form vừa tạo
            return $pdo->lastInsertId();
    }

    /**
     * @throws Exception
     */
    public function update($id, $data, \PDO $pdo) {
        if (empty($data)) {
            throw new \Exception("Không có dữ liệu để cập nhật!", 400);
        }
        $sql = "UPDATE forms SET FName = :FName, TypeID = :TypeID, MajorID = :MajorID, PeriodID = :PeriodID, Note = :Note, `Limit` = :Limit, File = :File, Status = :Status WHERE FID = :FID";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':FID' => $id,
            ':FName' => $data['FName'],
            ':TypeID' => $data['TypeID'],
            ':MajorID' => $data['MajorID'],
            ':PeriodID' => $data['PeriodID'],
            ':Note' => $data['Note'],
            ':Limit' => $data['Limit'],
            ':File' => $data['File'],
            ':Status' => $data['Status']
        ]);
    }

    public function updateDraft($id, $data)
    {
        try {
            if (empty($data)) {
                throw new \Exception("Không có dữ liệu để cập nhật!", 400);
            }

            $sql = "UPDATE forms SET FName = :FName, TypeID = :TypeID, MajorID = :MajorID, PeriodID = :PeriodID, Note = :Note, `Limit` = :Limit, File = :File, Status = :Status WHERE FID = :FID";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':FID' => $id,
                ':FName' => $data['FName'],
                ':TypeID' => $data['TypeID'],
                ':MajorID' => $data['MajorID'],
                ':PeriodID' => $data['PeriodID'],
                ':Note' => $data['Note'],
                ':Limit' => $data['Limit'],
                ':File' => $data['File'],
                ':Status' => $data['Status']
            ]);
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function delete($id, \PDO $pdo) {
        $sql = "DELETE FROM forms WHERE FID = :FID";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':FID' => $id]);
    }

    public function getById($id)
    {
        $FID = $id['id'];
        $email = $id['email'];

        $sql = "SELECT * FROM forms WHERE FID = :FID";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':FID' => $FID]);

        $result = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$result) return false;
        if ((int)$result['isPublic'] === 0 && $result['UID'] !== $email) {
            return false; // Không phải người tạo và không phải public
        }
        return $result;
    }


    public function getAll() {
        $sql = "SELECT * FROM forms";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    function getByIdAndUser($id, $userId)
    {
        $sql = "SELECT * FROM forms WHERE FID =:FID AND UID = :UserID";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':FID' => $id, ':UserID' => $userId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    function checkPermission($id, $userId) : bool
    {
        $sql = "SELECT * FROM forms WHERE FID =:FID";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':FID' => $id]);
        $form = $stmt->fetch(\PDO::FETCH_ASSOC);
        //Is public == 0 => private
        if ($form['isPublic'] == 0) {
            if ($form['UID'] == $userId) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    function getFormWithPagination($offset, $limit, $userId, $search = null, $sort = null)
    {
        $sql = "SELECT * FROM forms WHERE (isPublic = 1) OR (isPublic = 0 AND UID = :uid)";

        if ($search) {
            $sql .= " AND FName LIKE :FName";
        }

        $sql .= $sort ? " ORDER BY FName $sort" : " ORDER BY FID DESC";
        $sql .= " LIMIT :offset, :limit";

        $stmt = $this->pdo->prepare($sql);

        // Bind giá trị
        $stmt->bindValue(':uid', $userId);

        if ($search) {
            $stmt->bindValue(':FName', "%$search%");
        }

        $stmt->bindValue(':offset', (int)$offset, \PDO::PARAM_INT);
        $stmt->bindValue(':limit', (int)$limit, \PDO::PARAM_INT);

        $stmt->execute();

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    function countFormsWithPagination($userId, $search){
        $sql = "SELECT COUNT(*) as total FROM forms WHERE (isPublic = 1) OR (isPublic = 0 AND UID = :uid)";

        if ($search) {
            $sql .= " AND FName LIKE :FName";
        }

        $stmt = $this->pdo->prepare($sql);

        // Bind giá trị
        $stmt->bindValue(':uid', $userId);

        if ($search) {
            $stmt->bindValue(':FName', "%$search%");
        }

        $stmt->execute();

        return $stmt->fetch(\PDO::FETCH_ASSOC)['total'];
    }

    function createDraft($user)
    {
        $sql = "INSERT INTO forms ( FName,UID, TypeID, MajorID, PeriodID, Note, `Limit`, File, Status) VALUES ( :FName,:UID, :TypeID, :MajorID, :PeriodID, :Note, :Limit, :File, :Status)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':FName' => 'Bảng khảo sát mới',
            ':UID' => $user,
            ':TypeID' => NULL,
            ':MajorID' => NULL,
            ':PeriodID' => NULL,
            ':Note' => '',
            ':Limit' => 0,
            ':File' => '',
            ':Status' => 0
        ]);
        return $this->pdo->lastInsertId();

    }

    function checkStatus($form, $status)
    {
        $sql = "SELECT * FROM forms WHERE FID = :FID AND Status = :Status";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':FID' => $form, ':Status' => $status]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
}