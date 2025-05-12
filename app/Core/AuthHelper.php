<?php
namespace Core;

require_once __DIR__ . '/../../vendor/autoload.php';

class AuthHelper
{
    public static function verifyUserToken()
    {
        $accessToken = $_COOKIE['access_token'] ?? null;
        $refreshToken = $_COOKIE['refresh_token'] ?? null;
        $jwtConfig = require __DIR__ . '/../../config/JwtConfig.php';

        // Redirect if no token at all
        if (!$accessToken && !$refreshToken) {
            header('Location: /login');
            exit();
        }

        // Try to use access token first
        if ($accessToken) {
            $decode = jwt_helper::verifyJWT($accessToken, $jwtConfig['access_secret']);
            if ($decode) {
                return [
                    'user' => $decode->user ?? null,
                    'role' => $decode->role ?? null,
                    'permissions' => $decode->permissions ?? null
                ];
            }
            // Access token invalid, try refresh token
            error_log('Access token invalid, attempting to verify refresh token.');
        }

        // Access token invalid or missing, try refresh token
        if ($refreshToken) {
            error_log('Refresh token found, attempting to verify.');
            $decoded = jwt_helper::verifyJWT($refreshToken, $jwtConfig['refresh_secret']);
            if ($decoded) {
                // Valid refresh token, generate new access token
                $user = $decoded->user ?? null;
                $data['user'] = $user;
                $data['role'] = $decoded->role ?? null;
                $data['permissions'] = $decoded->permissions ?? null;

                if ($data) {
                    // Create new access token
                    $newAccessToken = jwt_helper::createJWT($data, $jwtConfig['access_secret'], 600);

                    // Set new access token in cookie
                    setcookie('access_token', $newAccessToken, time() + 600, '/', '', false, true);
                    error_log("Permissions: " . json_encode($data['permissions']));
                    // Return user data

                    return [
                        'user' => $decoded->user ?? null,
                        'role' => $decoded->role ?? null,
                        'permissions' => $decoded->permissions ?? null
                    ];
                }
            }
        }

        // Both tokens invalid or refresh failed
        if (isset($_COOKIE['access_token'])) setcookie('access_token', '', time() - 3600, '/');
        if (isset($_COOKIE['refresh_token'])) setcookie('refresh_token', '', time() - 604800, '/');

        http_response_code(401);
        header('Location: /login');
        exit();
    }
    public static function verifyUserTokenWithoutRedirect()
    {
        $accessToken = $_COOKIE['access_token'] ?? null;
        $refreshToken = $_COOKIE['refresh_token'] ?? null;

        $jwtConfig = require __DIR__ . '/../../config/JwtConfig.php';

        // No tokens available
        if (!$accessToken && !$refreshToken) {
            return null;
        }

        // Try access token first
        if ($accessToken) {
            $decode = jwt_helper::verifyJWT($accessToken, $jwtConfig['access_secret']);
            if ($decode) {
                return [
                    'user' => $decode->user ?? null,
                    'role' => $decode->role ?? null,
                    'permissions' => $decode->permissions ?? null
                ];
            }
        }
        // Try refresh token
        if ($refreshToken) {
            $decoded = jwt_helper::verifyJWT($refreshToken, $jwtConfig['refresh_secret']);
            if ($decoded) {
                $user = $decoded->user ?? null;
                $data['user'] = $user;
                $data['role'] = $decoded->role ?? null;
                $data['permissions'] = $decoded->permissions ?? null;
                if ($user) {
                    // Create new access token
                    $newAccessToken = jwt_helper::createJWT($data, $jwtConfig['access_secret'], 600);
                    setcookie('access_token', $newAccessToken, time() + 600, '/', '', false, true);
                    return [
                        'user' => $decoded->user ?? null,
                        'role' => $decoded->role ?? null,
                        'permissions' => $decoded->permissions ?? null
                    ];
                }
            }
        }

        return null;
    }
}