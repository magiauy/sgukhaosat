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
                $placeholders = implode(", ", array_fill(0, count($data), "(?, ?, ?, ? ,?,?)"));
                $sql = "INSERT INTO users (email, password, dateCreate, status , roleId, `position`) VALUES $placeholders";
                $stmt = $this->pdo->prepare($sql);
                $expectedOrder = ['email', 'password', 'dateCreate', 'status', 'roleId','position'];
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
    

    public function delete($id): bool{
        $sql = "DELETE FROM users WHERE email = :email";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['email' => $id]);
        return $stmt->rowCount();
    }

    public function deleteByRoleID($id): bool{
        $sql = "DELETE FROM users WHERE roleID = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount();
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

    // public function getListUsers(): array{
    //     $sql = "SELECT *
    //             FROM users, roles
    //             WHERE users.roleId = roles.roleId;";
    //     $statement = $this->pdo->prepare($sql);
    //     $statement->execute();
    //     // print_r($statement->fetchAll(\PDO::FETCH_ASSOC));
    //     return $statement->fetchAll(\PDO::FETCH_ASSOC);
    // }

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
    $query = "SELECT * FROM users WHERE email IN ($placeholdersList)";

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
}