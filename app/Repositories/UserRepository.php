<?php

namespace Repositories;
class UserRepository implements IAuthRepository {
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
    }

     // $sql = "INSERT INTO users (email, password, roleId,fullName,phone,dateCreate,status) VALUES ( :email, :password, :roleId, :fullName, :phone , NOW(), 1)";
        // $stmt = $this->pdo->prepare($sql);
        // $options = [
        //     'cost' => 10,
        // ];
        // $stmt->execute(
        //     [
        //         'email' => $data['email'],
        //         'password' => password_hash($data['password'],PASSWORD_BCRYPT,$options),
        //         'roleId' => $data['roleId'],
        //         'fullName' => $data['fullName'],
        //         'phone' => $data['phone']
        //     ]
        // );
        // return $stmt->rowCount() === 1;

    public function create($data): bool{

        $placeholders = implode(", ", array_fill(0, count($data), "(?, ?, ?, ?)"));
        $sql = "INSERT INTO users (email, password, dateCreate, roleId) VALUES $placeholders";
        $stmt = $this->pdo->prepare($sql);

        $params = [];
        foreach ($data as $row) {
            $params = array_merge($params, array_values($row));
        }

        return $stmt->execute($params);
    }

    public function update($id, $data): bool { 
        $sql = "UPDATE users SET  roleId = :roleId, phone = :phone, 
                password = :password, department = :department, status = :status 
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
                WHERE users.roleId = roles.roleId;";
        $statement = $this->pdo->prepare($sql);
        $statement->execute();
        // print_r($statement->fetchAll(\PDO::FETCH_ASSOC));
        return $statement->fetchAll(\PDO::FETCH_ASSOC);
    }

}