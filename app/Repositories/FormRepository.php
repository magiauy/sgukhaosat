<?php

namespace Repositories;
use Exception;
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

    public function delete($id, \PDO $pdo) {
        $sql = "DELETE FROM forms WHERE FID = :FID";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':FID' => $id]);
    }

    public function getById($id) {
        $sql = "SELECT * FROM forms WHERE FID = :FID";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':FID' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
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
}