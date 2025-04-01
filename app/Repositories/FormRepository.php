<?php

namespace Repositories;
use Exception;
use Repositories\Interface\IBaseRepositoryTransaction;

class FormRepository implements IBaseRepositoryTransaction{

    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
    }

    /**
     * @throws Exception
     */
    public function create($data, \PDO $pdo) {
        if (empty($data)) {
            throw new \Exception("Không có dữ liệu để thêm!", 400);
        }
            $sql = "INSERT INTO forms (FID, FName, TypeID, MajorID, PeriodID, Note, `Limit`, File, Status) VALUES (:FID, :FName, :TypeID, :MajorID, :PeriodID, :Note, :Limit, :File, :Status)";
            $stmt = $pdo->prepare($sql);
//            print_r($data);
            $stmt->execute([
                ':FID' => $data['FID'],
                ':FName' => $data['FName'],
                ':TypeID' => $data['TypeID'],
                ':MajorID' => $data['MajorID'],
                ':PeriodID' => $data['PeriodID'],
                ':Note' => $data['Note'],
                ':Limit' => $data['Limit'],
                ':File' => $data['File'],
                ':Status' => $data['Status']
            ]);
            return $stmt->rowCount() > 0; // Trả về true nếu có dòng nào được thêm vào

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

}