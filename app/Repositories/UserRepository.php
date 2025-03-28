<?php

namespace Repositories;
class UserRepository implements IAuthRepository {
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function create($data): bool{

        $sql = "INSERT INTO users (email, password, roleId,fullName,phone) VALUES ( :email, :password, :roleId, :fullName, :phone)";
        $stmt = $this->pdo->prepare($sql);
        $options = [
            'cost' => 10,
        ];
        $stmt->execute(
            [
                'email' => $data['email'],
                'password' => password_hash($data['password'],PASSWORD_BCRYPT,$options),
                'roleId' => $data['roleId'],
                'fullName' => $data['fullName'],
                'phone' => $data['phone']
            ]
        );
        return $stmt->rowCount() === 1;
    }

    public function update($id, $data): bool { 
        $sql = "UPDATE users SET email = :newEmail, roleID = :roleID, phone = :phone, 
                password = :password, department = :department, status = :status 
                WHERE email = :oldEmail";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'oldEmail' => $id,
            'roleID' => $data['roleID'],
            'phone' => $data['phone'],
            'newEmail' => $data['email'],
            'status' => $data['status'],
            'password' => $data['password'],
            'department' => $data['department']
        ]);
        return $stmt->rowCount() === 1;
    }
    

    public function delete($id): bool{
        $sql = "DELETE FROM users WHERE email = :email";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['email' => $id]);
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

    public function login($data){
        $sql = "SELECT * FROM users WHERE email = :email";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['email' => $data['email']]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);
        if($user && password_verify($data['password'],$user['password'])){
            return $user;
        }
        return null;
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

    public function getListUsers(): array{
        $sql = "SELECT *
                FROM users, roles
                WHERE users.roleID = roles.roleID;";
        $statement = $this->pdo->prepare($sql);
        $statement->execute();
        // print_r($statement->fetchAll(\PDO::FETCH_ASSOC));
        return $statement->fetchAll(\PDO::FETCH_ASSOC);
    }

}