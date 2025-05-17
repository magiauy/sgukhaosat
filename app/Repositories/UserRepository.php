<?php

namespace Repositories;
use Exception;
use Repositories\Interface\IAuthRepository;
use Throwable;

class UserRepository implements IAuthRepository {
    private \PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
    }

    /**
     * @throws Throwable
     */
    public function create($data): bool {
        $this->pdo->beginTransaction();
        try {
            $placeholders = implode(", ", array_fill(0, count($data), "(?, ?, ?, ?, ? ,?,?,?)"));
            $sql = "INSERT INTO users (email, password, created_at, updated_at, status , roleID, `position`,fullName) VALUES $placeholders";
            $stmt = $this->pdo->prepare($sql);
            $expectedOrder = ['email', 'password', 'created_at', 'updated_at', 'status', 'roleID','position','fullName'];
            $params = [];
            foreach ($data as $row) {

                if (!is_array($row)) {
                    throw new Exception("Dữ liệu đầu vào không hợp lệ!");
                }
                $row = array_merge(array_fill_keys($expectedOrder, null), $row);

                // Ánh xạ giá trị theo đúng thứ tự
                $params = array_merge($params, array_map(fn($key) => $row[$key], $expectedOrder));
            }

            $stmt->execute($params);
            $this->pdo->commit();

            return true;
        } catch (\PDOException $e) {
            $this->pdo->rollBack();
            // ✅ In lỗi đầy đủ ra log (giúp debug dễ hơn)
            error_log("SQL Error: " . $e->getMessage());

            // ✅ Throw lại lỗi để Controller xử lý
            throw new \Exception("Database Error: " . $e->getMessage(), 500);
        }
    }

    public function update($id, $data): bool { 
        // var_dump($data);
        $sql = "UPDATE users SET roleID = :roleID, phone = :phone, 
                status = :status, updated_at = NOW(), position = :position,
                fullName = :fullName, isFirstLogin = :isFirstLogin
                WHERE email = :email";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'roleID' => $data['roleID'],
            'phone' => $data['phone'],
            'email' => $id,
            'status' => $data['status'],
            'position' => $data['position'],
            'fullName' => $data['fullName'],
            'isFirstLogin' => $data['isFirstLogin'],
        ]);
        return $stmt->rowCount() === 1;
    }
    
    public function delete($emails): bool {
        // error_log("Emails: " . json_encode($emails));
        $placeholders = [];
        $params = [];
    
        foreach ($emails as $index => $email) {
            $key = ":email$index";
            $placeholders[] = $key;
            $params[$key] = $email;
        }
    
        $inClause = implode(', ', $placeholders);
        $sql = "DELETE FROM users WHERE email IN ($inClause)";
    
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
    
        return $stmt->rowCount() > 0;
    }
    

    public function getById($id){
        $sql = "SELECT u.*, p.PositionName 
        FROM users u
        LEFT JOIN position p ON u.position = p.PositionID
        WHERE u.email = :email";        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['email' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function getAll(): array
    {
        $sql = "SELECT * FROM users";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * @throws Exception
     */
    public function login($data){
        try {
            $sql = "SELECT * FROM users WHERE email = :email";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(['email' => $data['email']]);
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);
            // error_log("User: " . json_encode($user));
            if (!$user || !password_verify($data['password'], $user['password'])) {
                // Throw with 401 status code for invalid credentials
                throw new Exception("Sai tài khoản hoặc mật khẩu", 401);
            }
            unset($user['password']);
            return $user;
        } catch (Exception $e) {
            throw new Exception($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function register($data): \Error
    {
        return new \Error("Not implemented");
    }

    public function logout(): \Error
    {
        return new \Error("Not implemented");
    }

    public function me(): \Error
    {
        return new \Error("Not implemented");
    }
    
    
    public function getByRoleID($id){ //$id là mảng các roleID
        // var_dump($id);
        $sql = "SELECT * FROM users WHERE roleID in (:roleID)";
        $stmt = $this->pdo->prepare($sql);
        $id = implode(', ', array_values($id));
        // var_dump($id);
        $stmt->execute(['roleID' => $id]);
        $data = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        // var_dump($data);
        return $data;
    }

    public function deleteByRoleID($id): bool{
        $sql = "DELETE FROM users WHERE roleID in (:id)";
        $id = implode(', ', array_values($id));
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount();
    }

    public function updateRoleID($emailsList, $roleID){
        try {
            $placeholders = implode(',', array_fill(0, count($emailsList), '?'));
            $sql = "UPDATE users SET roleID = ? WHERE email in ($placeholders)";
            $params = array_merge([$roleID], $emailsList);
            // var_dump($params);
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (\Throwable $th) {
            throw $th;
        }
    }

/**
 * Get users by email addresses
 *
 * @param array $emails List of email addresses
 * @return array List of user records
 * @throws Exception
 */
public function getUsersByEmails(array $emails): array
{
    if (empty($emails)) {
        return [];
    }

    // Create placeholders for each email parameter
    $placeholders = array_map(function($i) {
        return ":email$i";
    }, array_keys($emails));

    $placeholdersList = implode(',', $placeholders);
$query = "SELECT u.*, p.PositionName AS positionName FROM users u 
              LEFT JOIN position p ON u.position = p.PositionID 
              WHERE u.email IN ($placeholdersList)";
    try {
        $stmt = $this->pdo->prepare($query);
        if ($stmt === false) {
            throw new Exception("Failed to prepare statement");
        }

        // Bind each email to its corresponding placeholder
        foreach ($emails as $i => $email) {
            $stmt->bindValue(":email$i", $email);
        }

        $stmt->execute();
        $users = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Remove sensitive information
        foreach ($users as &$user) {
            unset($user['password']);
        }

        return $users;
    } catch (Exception $e) {
        error_log("Error getting users by emails: " . $e->getMessage());
        throw new Exception("Failed to fetch users: " . $e->getMessage(), 500);
    }
}

    function getLastInsertId(): int
    {
        return $this->pdo->lastInsertId();
    }

    /**
     * @param string $email User's email
     * @param string $newPassword New password to set
     * @return void
     * @throws \PDOException
     */

    public function resetPassword($email, $newPassword)
    {
        $sql = "UPDATE users SET password = :password, updated_at = NOW() WHERE email = :email";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'password' => $newPassword,
            'email' => $email,
        ]);
    }

    /**
     * @param array $ids List of role IDs to update
     * @return void
     * @throws \PDOException
     */
    public function updateRoleIDForDelete($ids){
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $sql = "UPDATE users SET roleID = 'USER' WHERE roleID IN ($placeholders)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(array_values($ids));
    }

    public function getOnPagination($data){
        error_log("Data: " . json_encode($data));
        
        $sql = "SELECT * FROM users 
        WHERE
        (
            (:isFilter = 0) OR 
                (
                    (:isCreate = 0 OR (created_at BETWEEN :fromDateCreate AND :toDateCreate))
                    AND 
                    (:isUpdate = 0 OR (updated_at BETWEEN :fromDateUpdate AND :toDateUpdate))
                    AND 
                    (:isStatus = 0 OR (status = :status))
                    AND 
                    (:isRole = 0 OR (roleID = :roleID))
                )
            )
            AND
            (
                (:isSearch = 0 OR (email LIKE :search))
        )
        
        {$data['sortOrderString']} 
        {$data['limitString']}";


        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'fromDateCreate' => $data['fromDateCreate'] ?? 0,
            'toDateCreate' => $data['toDateCreate'] ?? 0,
            'fromDateUpdate' => $data['fromDateUpdate'] ?? 0,
            'toDateUpdate' => $data['toDateUpdate'] ?? 0,
            'isCreate' => $data['isCreate'] ?? 0,
            'isUpdate' => $data['isUpdate'] ?? 0,
            'isFilter' => $data['isFilter'],
            'isSearch' => $data['isSearch'],
            'search' => $data['search'] ?? 0,
            'isStatus' => $data['isStatus'],
            'status' => $data['status'] ?? 0,
            'isRole' => $data['isRole'],
            'roleID' => $data['roleID'] ?? 0,
        ]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    function getTotalRecord($data){
        // var_dump($data);
        $sql = 'SELECT COUNT(*) FROM users 
        WHERE
        (
            (:isFilter = 0) OR 
                (
                    (:isCreate = 0 OR (created_at BETWEEN :fromDateCreate AND :toDateCreate))
                    AND 
                    (:isUpdate = 0 OR (updated_at BETWEEN :fromDateUpdate AND :toDateUpdate))
                    AND 
                    (:isStatus = 0 OR (status = :status))
                    AND 
                    (:isRole = 0 OR (roleID = :roleID))
                )
            )
            AND
            (
                (:isSearch = 0 OR (email LIKE :search))
        )';
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'fromDateCreate' => $data['fromDateCreate'] ?? 0,
            'toDateCreate' => $data['toDateCreate'] ?? 0,
            'fromDateUpdate' => $data['fromDateUpdate'] ?? 0,
            'toDateUpdate' => $data['toDateUpdate'] ?? 0,
            'isCreate' => $data['isCreate'] ?? 0,
            'isUpdate' => $data['isUpdate'] ?? 0,
            'isFilter' => $data['isFilter'],
            'isSearch' => $data['isSearch'],
            'search' => $data['search'] ?? 0,
            'isStatus' => $data['isStatus'],
            'status' => $data['status'] ?? 0,
            'isRole' => $data['isRole'],
            'roleID' => $data['roleID'] ?? 0,
        ]);
        return $stmt->fetchColumn();
    }

    public function getByEmail($data){
        $sql = "SELECT * FROM users WHERE email = :email";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['email' => $data['email']]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function updateInformation($data){
        $sql = "UPDATE users SET 
        phone = :phone, fullName = :fullName, updated_at = NOW(), position = :position, 
        isFirstLogin = :isFirstLogin  
        WHERE email = :email";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'phone' => $data['phone'],
            'email' => $data['email'],
            'fullName' => $data['fullName'],
            'position' => $data['position'],
            'isFirstLogin' => $data['isFirstLogin'],
        ]);
        return $stmt->rowCount() === 1;
    }


    /**
     * Kiểm tra email đã tồn tại trong database chưa
     * @param string $email Email cần kiểm tra
     * @return bool True nếu email đã tồn tại, False nếu chưa
     */
    public function checkEmailExists($email)
    {
        $sql = 'SELECT COUNT(*) FROM users WHERE email = :email';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['email' => $email]);
        return $stmt->fetchColumn() > 0;
    }
}