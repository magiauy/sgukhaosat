<?php
namespace Core;

require_once __DIR__ . '/../../vendor/autoload.php';

use PDO;
use Repositories\Database;
use Repositories\RoleRepository;
use Repositories\Role_PermRepository;
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
                $db = Database::getInstance();
                $conn = $db->getConnection();
                $roleID = is_object($user) ? $user->roleID : $user['roleID'];


// Get role data
                $roleStmt = $conn->prepare("SELECT * FROM roles WHERE roleID = ?");
                $roleStmt->execute([$roleID]);
                $role = $roleStmt->fetch(PDO::FETCH_ASSOC);

// Get permissions for this role
                $permStmt = $conn->prepare("SELECT permID FROM role_permission WHERE roleID = ?");
                $permStmt->execute([$roleID]);
                $permissions = $permStmt->fetchAll(PDO::FETCH_ASSOC);
                $stdClassPermissions = [];
                foreach ($permissions as $permission) {
                    $stdClassPermissions[] = (object) $permission;
                }
                $data['user'] = $user;
                $data['role'] = $role['roleID'] ?? null;
                $data['permissions'] = $stdClassPermissions;


                if ($data) {
                    // Create new access token
                    $newAccessToken = jwt_helper::createJWT($data, $jwtConfig['access_secret'], 600);

                    // Set new access token in cookie
                    setcookie('access_token', $newAccessToken, time() + 600, '/', '', false, true);
                    // Return user data
                    error_log( "User data: " . json_encode($data));
                    return [
                        'user' => $data['user'] ?? null,
                        'role' => $data['role'] ?? null,
                        'permissions' => $data['permissions'] ?? null
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
                $db = Database::getInstance();
                $conn = $db->getConnection();

// Get role data
                $roleStmt = $conn->prepare("SELECT * FROM roles WHERE roleID = ?");
                $roleStmt->execute([$user->roleID]);
                $role = $roleStmt->fetch(PDO::FETCH_ASSOC);
                error_log("Role: " . json_encode($role));

// Get permissions for this role
                $permStmt = $conn->prepare("SELECT permID FROM role_permission WHERE roleID = ?");
                $permStmt->execute([$user->roleID]);
                $permissions = $permStmt->fetchAll(PDO::FETCH_ASSOC);
                $stdClassPermissions = [];
                foreach ($permissions as $permission) {
                    $stdClassPermissions[] = (object) $permission;
                }
                $data['user'] = $user;
                $data['role'] = $role['roleID'] ?? null;
                $data['permissions'] = $stdClassPermissions;


                if ($user) {
                    // Create new access token
                    $newAccessToken = jwt_helper::createJWT($data, $jwtConfig['access_secret'], 600);
                    setcookie('access_token', $newAccessToken, time() + 600, '/', '', false, true);
                    return [
                        'user' => $data['user'] ?? null,
                        'role' => $data['role'] ?? null,
                        'permissions' => $data['permissions'] ?? null
                    ];
                }
            }
        }

        return null;
    }

    public static function verifyLoginUrlToken($token)
    {
        if (!$token) {
            return null;
        }

        try {
            // Decode the token (assuming it might be base64 encoded or similar)
            $decodedToken = base64_decode($token);
            error_log("Decoded token: " . $decodedToken);

            // Connect to database
            $db = Database::getInstance();
            $conn = $db->getConnection();

            // Query the database for this token
            $stmt = $conn->prepare("SELECT * FROM login_tokens WHERE token = ? AND expires_at > NOW() AND is_used = 0 LIMIT 1");
            $stmt->execute([$decodedToken]);
            $loginToken = $stmt->fetch(PDO::FETCH_ASSOC);
            error_log("Checking token Pass ");

            if (!$loginToken) {
                // Token not found, expired, or already used
                return null;
            }

            // Mark token as used to prevent reuse
            $stmt = $conn->prepare("UPDATE login_tokens SET is_used = 1, used_at = NOW() WHERE id = ?");
            $stmt->execute([$loginToken['id']]);

            // Get all user data except password
            $stmt = $conn->prepare("SELECT u.email, u.fullName, u.email, u.phone, u.created_at, u.updated_at, u.roleID, 
                                    r.roleName as role_name
                                   FROM users u
                                   JOIN roles r ON u.roleID = r.roleID
                                   WHERE u.email = ?");
            $stmt->execute([$loginToken['user_id']]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$userData) {
                return null;
            }

            error_log("User Pass ");
            // Get permissions from role_perm table
            $stmt = $conn->prepare("SELECT permID FROM role_permission WHERE roleID = ?");
            $stmt->execute([$userData['roleID']]);
            $permissionRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Create session data with all user fields except password
            $data = [
                'user' => $userData,
                'role' => $userData['role_name'],
                'permissions' => $permissionRows
            ];

            // Create new access and refresh tokens
            $jwtConfig = require __DIR__ . '/../../config/JwtConfig.php';
            $accessToken = jwt_helper::createJWT($data, $jwtConfig['access_secret'], 600); // 10 minutes
            $refreshToken = jwt_helper::createJWT($data, $jwtConfig['refresh_secret'], 604800); // 1 week

            // Set cookies
            setcookie('access_token', $accessToken, time() + 600, '/', '', false, true);
            setcookie('refresh_token', $refreshToken, time() + 604800, '/', '', false, true);

            return $data;
        } catch (\Exception $e) {
            error_log("Error verifying URL login token: " . $e->getMessage());
            return null;
        }
    }

    public static function generateLoginToken($email): ?string
    {
        try {
            // Connect to database
            $db = Database::getInstance();
            $conn = $db->getConnection();

            // Generate a unique token
            $token = bin2hex(random_bytes(16));

            // Insert the token into the database with an expiration time
            $stmt = $conn->prepare("INSERT INTO login_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 3 DAY))");
            $stmt->execute([$email, $token]);

            return base64_encode($token);
        } catch (\Exception $e) {
            error_log("Error generating login token: " . $e->getMessage());
            return null;
        }
    }

}