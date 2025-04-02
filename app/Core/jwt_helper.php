<?php
namespace Core;
require 'vendor/autoload.php';

use Exception;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class jwt_helper
{
    function createJWT($data, $secret, $expTime) {
        $payload = array_merge($data, ["exp" => time() + $expTime]);
        return JWT::encode($payload, $secret, 'HS256');
    }

    function verifyJWT($token, $secret) {
        try {
            return JWT::decode($token, new Key($secret, 'HS256'));
        } catch (Exception $e) {
            return null;
        }
    }
    function createPageJWT($permission, $secret) {
        $payload = [
            "permission" => $permission,
            "exp" => time() + 5 //seconds
        ];
        return JWT::encode($payload, $secret, 'HS256');
    }
}
