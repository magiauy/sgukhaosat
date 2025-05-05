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

    function getFormWithWhitelist($email)
    {
        //Lấy toàn bộ FID của người có email này trong bảng whitelist và FID phải có status = 1
        $sql = "SELECT FID FROM whitelist_form WHERE UID = :Email";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':Email' => $email]);
        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        $formIDs = [];
        foreach ($result as $row) {
            $formIDs[] = $row['FID'];
        }
        if (empty($formIDs)) {
            return [];
        }
        $sql = "SELECT * FROM forms WHERE FID IN (" . implode(',', array_fill(0, count($formIDs), '?')) . ") AND Status = 1";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($formIDs);
//        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        //Tính số lần làm của người này thông qua FID và UID bên bảng result so với limit , nếu đã = limit thì không lấy form này nữa
        $forms = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        foreach ($forms as &$form) {
            $sql = "SELECT COUNT(*) as count FROM result WHERE FID = :FID AND UID = :UID";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':FID' => $form['FID'], ':UID' => $email]);
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            $form['count'] = (int)$result['count'];
        }
        //Lọc ra những form đã đủ số lần làm
        $forms = array_filter($forms, function ($form) {
            return $form['count'] < $form['Limit'];
        });
        //Sắp xếp theo FID giảm dần
//        usort($forms, function ($a, $b) {
//            return $b['FID'] <=> $a['FID'];
//        });
        return ['forms' => $forms];

    }

    function updateStatus($fid, $status, $pdo): bool
    {
        $sql = "UPDATE forms SET Status = :Status WHERE FID = :FID";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':FID' => $fid, ':Status' => $status]);
        return $stmt->rowCount() > 0;
    }

    function getByIdForUser($id)
    {
        $sql = "SELECT * FROM forms WHERE FID = :FID";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':FID' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }


}