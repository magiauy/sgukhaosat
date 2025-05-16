<?php

namespace Middlewares;
require_once __DIR__ . '/../../vendor/autoload.php';

use Core\Response;
use Core\Request;
use Core\jwt_helper;
use Controllers\FormController;
use http\Cookie;
use http\Message\Body;

class JwtMiddleware
{
    private static FormController $formController ;

    public function __construct()
    {
        self::$formController = new FormController();
    }    public static function authenticate(Request $request, Response $response, $permission , $next): void
    {
        try {
            $token = $_COOKIE['access_token'] ?? null;            
            if ($token) {
                $token = str_replace('Bearer ', '', $token);
            }
            if (!$token) {
                $response->json([
                    'status' => false,
                    'message' => 'Authorization token not provided'
                ], 401);
            }// Assuming you have a method to verify the token
            $jwtHelper = new jwt_helper();
            $secret = require __DIR__ . '/../../config/JwtConfig.php';
            $decoded = $jwtHelper->verifyJWT($token,$secret['access_secret']);
            if (!$decoded) {
                $response->json([
                    'error' => 'Invalid or expired token'
                ], 401);
            }//Don't have
            if ($permission) {
                $permissions = $decoded->permissions;
                $hasPermission = false;

                foreach ($permissions as $perm) {
                    if ($perm->permID === $permission) {
                        $hasPermission = true;
                        break;
                    }
                }
                if (!$hasPermission) {
                    $response->json([
                        'error' => 'Permission denied'
                    ], 403);
                }

            }// Store user data in request for later use
            error_log("Checking successfully");
            $request->addBody((array)$decoded);
            $next($request, $response);
        } catch (\Exception $e) {
            $response ->json([
                'error' => 'An error occurred while authenticating: ' . $e->getMessage()
            ], 500);
        }
    }

    public static function authenticateFormPage(string $token, string $permission, string $formId): int
    {
        try {
            if (!self::$formController) {
                self::$formController = new FormController();
            }

            if (!$token) {
                return 401;
            }

            $token = str_replace('Bearer ', '', $token);
            $jwtHelper = new jwt_helper();
            $secret = require __DIR__ . '/../../config/JwtConfig.php';
            $decoded = $jwtHelper->verifyJWT($token, $secret['access_secret']);

            if (!$decoded || !isset($decoded->user)) {
                return 401;
            }

            $user = $decoded->user;

            // Check permission if required
            if ($permission) {
                $permissions = $decoded->permissions ?? [];
                $hasPermission = array_filter($permissions, fn($perm) => $perm->permID === $permission);
                if (empty($hasPermission)) {
                    return 403;
                }
            }

            // Check form permission
            $formHasAccess = self::$formController->checkPermission($formId, $user->email);
            return $formHasAccess ? 200 : 403;

        } catch (\Throwable $e) {
            return 500;
        }
    }


    public static function authenticatePage($token, $permission ):int
    {
        try {
            if ($token) {
                $token = str_replace('Bearer ', '', $token);
            }
            if (!$token) {
                return 401;
            }// Assuming you have a method to verify the token
            $jwtHelper = new jwt_helper();
            $secret = require __DIR__ . '/../../config/JwtConfig.php';
            $decoded = $jwtHelper->verifyJWT($token,$secret['access_secret']);
            if (!$decoded) {
                return 401;
            }//Don't have
            error_log("Decoded token: " . json_encode($decoded));
            if ($permission) {
                $permissions = $decoded->permissions;
                $hasPermission = false;

                foreach ($permissions as $perm) {
                    if ($perm->permID === $permission) {
                        $hasPermission = true;
                        break;
                    }
                }
                if (!$hasPermission) {
                    return 403;
                }

            }// Store user data in request for later use
            return 200;
        } catch (\Exception $e) {
//            require_once __DIR__ . '/../../public/views/pages/home.php';
            return 500;
        }
    }
    /**
     * Handles refresh token validation and generates a new access token
     *
     * @param Request $request The request object containing the refresh token
     * @param Response $response The response object
     * @return void
     */
    public static function refresh(Request $request, Response $response): void
    {
        try {
            // Get refresh token from cookie
            $refreshToken = $_COOKIE['refresh_token'] ?? null;

            if (!$refreshToken) {
                $response->json([
                    'error' => 'Refresh token not provided'
                ], 401);
                return;
            }

            // Verify the refresh token
            $jwtHelper = new jwt_helper();
            $secret = require __DIR__ . '/../../config/JwtConfig.php';
            $decoded = $jwtHelper->verifyJWT($refreshToken, $secret['refresh_secret']);

            if (!$decoded) {
                $response->json([
                    'error' => 'Invalid or expired refresh token'
                ], 401);
                return;
            }

            // Generate a new access token using data from refresh token
            $userData = (array)$decoded;
            $accessToken = jwt_helper::createJWT($userData, $secret['access_secret'], 600); // 10 minutes expiry

            // Return the new access token in the response
            setcookie('access_token', $accessToken, time() + 600, '/', '', false, true);

            $response->json([
                'access_token' => $accessToken,
                'status' => true,
                ], 200);

        } catch (\Exception $e) {
            $response->json([
                'error' => 'An error occurred while refreshing token: ' . $e->getMessage()
            ], 500);
        }
    }



    public static function getDecodedToken(string $token): ?object
    {
        try {
            if (!$token) {
                return null;
            }
            
            $token = str_replace('Bearer ', '', $token);
            $jwtHelper = new jwt_helper();
            $secret = require __DIR__ . '/../../config/JwtConfig.php';
            return $jwtHelper->verifyJWT($token, $secret['access_secret']);
        } catch (\Exception $e) {
            error_log("Error decoding token: " . $e->getMessage());
            return null;
        }
    }

    public static function logout(Request $request, Response $response)
    {
        try {
            // Clear the access token and refresh token cookies
            setcookie('access_token', '', time() - 3600, '/', '', false, true);
            setcookie('refresh_token', '', time() - 3600, '/', '', false, true);

            // Optionally, you can also invalidate the tokens on the server side if you have a token store

            $response->json([
                'message' => 'Logged out successfully'
            ], 200);
        } catch (\Exception $e) {
            $response->json([
                'error' => 'An error occurred while logging out: ' . $e->getMessage()
            ], 500);
        }
    }
}