<?php

namespace Repositories;

use Repositories\Interface\IWhitelistForm;

class WhitelistForm implements IWhitelistForm
{
    private $db;

    public function __construct(){
        $this->db = Database::getInstance();
    }

function create($id, $data)
{
    $pdo = $this->db->getConnection();
    $pdo->beginTransaction();
    try {
        // Ensure we have data to insert
        if (empty($data) || !is_array($data)) {
            throw new \Exception("Không có dữ liệu để thêm vào danh sách truy cập");
        }

        $users = $data['users'];
        if (empty($users)) {
            throw new \Exception("Không có người dùng để thêm vào danh sách truy cập");
        }

        $placeholders = implode(", ", array_fill(0, count($users), "(?, ?)"));
        $sql = "INSERT IGNORE INTO whitelist_form (FID, UID) VALUES $placeholders";
        $stmt = $pdo->prepare($sql);

        $params = [];
        foreach ($users as $uid) {
            $params[] = $id;       // FID
            if (!isset($uid['email'])) {
                throw new \Exception("Thiếu thông tin email người dùng");
            }
            $params[] = $uid['email'];      // UID
        }

        $stmt->execute($params);
        $rowCount = $stmt->rowCount();
        $pdo->commit();
        return $rowCount;
    } catch (\PDOException $e) {
        $pdo->rollBack();
        // Log the error
        error_log("SQL Error: " . $e->getMessage());


        // Throw the error for controller handling
        throw new \Exception("Database Error: " . $e->getMessage(), 500);
    }
}

    function delete($id)
    {
        $pdo = $this->db->getConnection();
        $sql = "DELETE FROM whitelist_form WHERE FID = :fid";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['fid' => $id]);
        return $stmt->rowCount() > 0;
    }

    function getByFormID($id)
    {
        $pdo = $this->db->getConnection();
        $sql = "SELECT * FROM whitelist_form WHERE FID = :fid";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['fid' => $id]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

  function deleteWithData($id, $data)
    {
        $pdo = $this->db->getConnection();
        $pdo->beginTransaction();
        try {
            // Ensure we have data to delete
            if (empty($data) || !is_array($data)) {
                throw new \Exception("Không có dữ liệu để xóa khỏi danh sách truy cập");
            }

            $users = $data['users'];
            if (empty($users)) {
                throw new \Exception("Không có người dùng để xóa khỏi danh sách truy cập");
            }

            // Create placeholders for the IN clause - just one ? per email
            $placeholders = implode(', ', array_fill(0, count($users), '?'));
            $sql = "DELETE FROM whitelist_form WHERE FID = ? AND UID IN ($placeholders)";
            $stmt = $pdo->prepare($sql);

            // Create params array with FID as the first parameter
            $params = [$id];
            foreach ($users as $uid) {
                if (!isset($uid['email'])) {
                    throw new \Exception("Thiếu thông tin email người dùng");
                }
                $params[] = $uid['email'];
            }

            // Execute with all parameters at once
            $stmt->execute($params);
            $rowCount = $stmt->rowCount();

            if ($rowCount === 0) {
                throw new \Exception("Không có bản ghi nào được xóa khỏi danh sách truy cập");
            }

            $pdo->commit();
            return true;
        } catch (\PDOException $e) {
            $pdo->rollBack();
            error_log("SQL Error: " . $e->getMessage());
            throw new \Exception("Database Error: " . $e->getMessage(), 500);
        }
    }
}