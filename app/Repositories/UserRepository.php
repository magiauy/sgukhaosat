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
        // var_dump($data);
        $this->pdo->beginTransaction();
        try {
            $placeholders = implode(", ", array_fill(0, count($data), "(?, ?, ?, ? ,?)"));
            $sql = "INSERT INTO users (email, password, dateCreate, status , roleID) VALUES $placeholders";
            $stmt = $this->pdo->prepare($sql);
            $expectedOrder = ['email', 'password', 'dateCreate', 'status', 'roleID'];
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
        $sql = "UPDATE users SET  roleId = :roleId, phone = :phone, 
                password = :password, status = :status 
                WHERE email = :email";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'roleId' => $data['roleId'],
            'phone' => $data['phone'],
            'email' => $id,
            'status' => $data['status'],
            'password' => $data['password'],
        ]);
        return $stmt->rowCount() === 1;
    }
    
    public function delete($emails): bool {
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
        $sql = "SELECT * FROM users WHERE email = :email";
        $stmt = $this->pdo->prepare($sql);
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

}