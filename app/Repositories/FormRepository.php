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
    // First check if there are any results for this form
    $checkSql = "SELECT COUNT(*) as count FROM result WHERE FID = :FID";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([':FID' => $id]);
    $hasResults = $checkStmt->fetch(\PDO::FETCH_ASSOC)['count'] > 0;

    if ($hasResults) {
        // Soft delete if there are results
        $sql = "UPDATE forms SET isDelete = 1 WHERE FID = :FID";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':FID' => $id]);
    } else {
        // Hard delete if no results exist
        $sql = "DELETE FROM forms WHERE FID = :FID";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':FID' => $id]);
    }

    return $stmt->rowCount() > 0;
}

    public function getById($id)
    {
        $FID = $id['id'];
        $email = $id['email'];

        $sql = "SELECT * FROM forms WHERE FID = :FID AND isDelete = 0";
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
        $sql = "SELECT * FROM forms WHERE isDelete = 0";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    function getByIdAndUser($id, $userId)
    {
        $sql = "SELECT * FROM forms WHERE FID =:FID AND UID = :UserID AND isDelete = 0";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':FID' => $id, ':UserID' => $userId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    function checkPermission($id, $userId) : bool
    {
        $sql = "SELECT * FROM forms WHERE FID =:FID AND isDelete = 0";
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
        $sql = "SELECT f.*,
        m.MajorName,
        CONCAT(p.startYear, '-', p.endYear) AS PeriodName,
        ft.FTypeName AS TypeName
        FROM forms f
        LEFT JOIN major m ON f.MajorID = m.MajorID
        LEFT JOIN period p ON f.PeriodID = p.PeriodID
        LEFT JOIN form_type ft ON f.TypeID = ft.FTypeID
        WHERE ((f.isPublic = 1) OR (f.isPublic = 0 AND f.UID = :uid)) AND f.isDelete = 0";

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
        $sql = "SELECT COUNT(*) as total FROM forms WHERE (isPublic = 1) OR (isPublic = 0 AND UID = :uid) AND isDelete = 0";

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
        $sql = "SELECT FID FROM whitelist_form WHERE UID = :Email ";
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
        $sql = "SELECT f.*,
        m.MajorName,
        CONCAT(p.startYear, '-', p.endYear) AS PeriodName,
        ft.FTypeName AS TypeName
        FROM forms f
        LEFT JOIN major m ON f.MajorID = m.MajorID
        LEFT JOIN period p ON f.PeriodID = p.PeriodID
        LEFT JOIN form_type ft ON f.TypeID = ft.FTypeID
        WHERE FID IN (" . implode(',', array_fill(0, count($formIDs), '?')) . ")
        AND f.Status = 1";
        error_log("SQL: " . $sql);
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($formIDs);
//        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        //Tính số lần làm của người này thông qua FID và UID bên bảng result so với limit , nếu đã = limit thì không lấy form này nữa
        $forms = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        error_log("Forms: " . json_encode($forms));
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


    function getFormWithSearchPagination($offset, $limit, $userId, $fName = null, $typeID = null, $majorID = null, $periodID = null)
    {
        $sql = "SELECT f.*,
        m.MajorName,
        CONCAT(p.startYear, '-', p.endYear) AS PeriodName,
        ft.FTypeName AS TypeName
        FROM forms f
        LEFT JOIN major m ON f.MajorID = m.MajorID
        LEFT JOIN period p ON f.PeriodID = p.PeriodID
        LEFT JOIN form_type ft ON f.TypeID = ft.FTypeID
        WHERE (isPublic = 1) OR (isPublic = 0 AND UID = :uid) AND isDelete = 0";

        if ($fName) {
            $sql .= " AND f.FName LIKE :FName";
        }
        if ($typeID) {
            $sql .= " AND f.TypeID = :TypeID";
        }
        if ($majorID) {
            $sql .= " AND f.MajorID = :MajorID";
        }
        if ($periodID) {
            $sql .= " AND f.PeriodID = :PeriodID";
        }

        $sql .= " ORDER BY f.FID DESC LIMIT :offset, :limit";

        $stmt = $this->pdo->prepare($sql);

        // Bind giá trị
        $stmt->bindValue(':uid', $userId);

        if ($fName) {
            $stmt->bindValue(':FName', "%$fName%");
        }
        if ($typeID) {
            $stmt->bindValue(':TypeID', $typeID);
        }
        if ($majorID) {
            $stmt->bindValue(':MajorID', $majorID);
        }
        if ($periodID) {
            $stmt->bindValue(':PeriodID', $periodID);
        }

        $stmt->bindValue(':offset', (int)$offset, \PDO::PARAM_INT);
        $stmt->bindValue(':limit', (int)$limit, \PDO::PARAM_INT);

        $stmt->execute();

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);

    }

    function countFormsWithSearchPagination($userId, $fName = null, $typeID = null, $majorID = null, $periodID = null)
    {
        $sql = "SELECT COUNT(*) as total FROM forms f
        LEFT JOIN major m ON f.MajorID = m.MajorID
        LEFT JOIN period p ON f.PeriodID = p.PeriodID
        LEFT JOIN form_type ft ON f.TypeID = ft.FTypeID
        WHERE (isPublic = 1) OR (isPublic = 0 AND UID = :uid) AND isDelete = 0";

        if ($fName) {
            $sql .= " AND f.FName LIKE :FName";
        }
        if ($typeID) {
            $sql .= " AND f.TypeID = :TypeID";
        }
        if ($majorID) {
            $sql .= " AND f.MajorID = :MajorID";
        }
        if ($periodID) {
            $sql .= " AND f.PeriodID = :PeriodID";
        }

        $stmt = $this->pdo->prepare($sql);

        // Bind giá trị
        $stmt->bindValue(':uid', $userId);

        if ($fName) {
            $stmt->bindValue(':FName', "%$fName%");
        }
        if ($typeID) {
            $stmt->bindValue(':TypeID', $typeID);
        }
        if ($majorID) {
            $stmt->bindValue(':MajorID', $majorID);
        }
        if ($periodID) {
            $stmt->bindValue(':PeriodID', $periodID);
        }

        $stmt->execute();

        return $stmt->fetch(\PDO::FETCH_ASSOC)['total'];
    }
}