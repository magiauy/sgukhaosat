<?php

namespace Middlewares;
require 'vendor/autoload.php';

use Core\Response;
use Core\Request;
use Core\jwt_helper;
use Controllers\FormController;
use http\Message\Body;

class JwtMiddleware
{
    private static FormController $formController ;

    public function __construct()
    {
        self::$formController = new FormController();
    }

    public static function authenticate(Request $request, Response $response, $permission , $next): void
    {
        try {
            $token = $_COOKIE['access_token'] ?? null;            
            if ($token) {
                $token = str_replace('Bearer ', '', $token);
            }
            if (!$token) {
                $response->json([
                    'error' => 'Authorization token not provided'
                ], 401);
            }// Assuming you have a method to verify the token
            $jwtHelper = new jwt_helper();
            $secret = require __DIR__ . '/../../config/JwtConfig.php';
            $decoded = $jwtHelper->verifyJWT($token,$secret);
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
            $decoded = $jwtHelper->verifyJWT($token, $secret);

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
            $decoded = $jwtHelper->verifyJWT($token,$secret);
            if (!$decoded) {
                return 401;
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
                    return 403;
                }

            }// Store user data in request for later use
            return 200;
        } catch (\Exception $e) {
//            require_once __DIR__ . '/../../public/views/pages/home.php';
            return 500;
        }
    }

}