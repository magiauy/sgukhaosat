<?php

namespace Repositories;
class UserRepository implements IBaseRepository{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function create($data): bool{

        $sql = "INSERT INTO users (email, password, roleId,fullName,phone) VALUES ( :email, :password, :roleId, :fullName, :phone)";
        $stmt = $this->pdo->prepare($sql);
        $options = [
            'cost' => 9,
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

    public function update($id,$data): bool{
        $sql = "UPDATE users SET  roleId = :roleId, fullName = :fullName, phone = :phone WHERE email = :email";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(
            [
                'email' => $id,
                'roleId' => $data['roleId'],
                'fullName' => $data['fullName'],
                'phone' => $data['phone']
            ]
        );
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



}