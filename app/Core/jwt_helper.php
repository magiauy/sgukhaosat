<?php
namespace Core;
require_once __DIR__ . '/../../vendor/autoload.php';

use Exception;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class jwt_helper
{
    static function createJWT($data, $secret, $expTime) {
        $payload = array_merge($data, ["exp" => time() + $expTime]);
        return JWT::encode($payload, $secret, 'HS256');
    }

    static function verifyJWT($token, $secret) {
        try {
            return JWT::decode($token, new Key($secret, 'HS256'));
        } catch (Exception $e) {
            return null;
        }
    }
    static function createRefreshToken($user, $secret, $expTime)
    {
        // Refresh token chỉ cần thông tin tối thiểu
        $minimalPayload = [
            "user" => $user['user'],
            "exp" => time() + $expTime
        ];
        error_log("Refresh token payload: " . json_encode($minimalPayload));

        return JWT::encode($minimalPayload, $secret, 'HS256');
    }
}
