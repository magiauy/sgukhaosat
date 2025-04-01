<?php

namespace Middlewares;
require 'vendor/autoload.php';

use Cassandra\Map;
use Core\Response;
use Core\Request;
use Core\jwt_helper;

class JwtMiddleware
{
    /**
     * @throws \Exception
     */
    public static function authenticate(Request $request, Response $response, $permission , $next)
    {
        try {

            $token = $request->getHeader('Authorization');
            if ($token) {
                $token = str_replace('Bearer ', '', $token);
            }
            if (!$token) {
                $response->json([
                    'error' => 'Authorization token not provided'
                ], 401);
                return $response;
            }// Assuming you have a method to verify the token
            $jwtHelper = new jwt_helper();
            $secret = require __DIR__ . '/../../config/JwtConfig.php';
            $decoded = $jwtHelper->verifyJWT($token,$secret);
            if (!$decoded) {
                $response->json([
                    'error' => 'Invalid or expired token'
                ], 401);
                return $response;
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
                    return $response;
                }

            }// Store user data in request for later use
            $request->setBody((array)$decoded);
            return $next($request, $response);
        } catch (\Exception $e) {
            throw new \Exception("Error in JWT Middleware: " . $e->getMessage());
        }
    }

    /**
     * @throws \Exception
     */
    public static function verifyAccess(Request $request, Response $response)
    {
        try {
            // Lấy token từ header Authorization
            $token = $request->getHeader('Authorization');
            if ($token) {
                $token = str_replace('Bearer ', '', $token);
            }
            // Kiểm tra xem có token không
            if (!$token) {
                $response->json([
                    'error' => 'Authorization token not provided'
                ], 401);
                return $response;
            }
            // Kiểm tra token
            $jwtHelper = new jwt_helper();
            $secret = require __DIR__ . '/../../config/JwtConfig.php';
            $decoded = $jwtHelper->verifyJWT($token,$secret);
            $decoded_permission = $jwtHelper->verifyJWT($request->getBody()['permission'],$secret);

            // Token không hợp lệ hoặc đã hết hạn
            if (!$decoded) {
                $response->json([
                    'error' => 'Invalid or expired token'
                ], 401);
                return $response;
            }
            // Token permission không hợp lệ hoặc đã hết hạn
            if (!$decoded_permission) {
                $response->json([
                    'error' => 'Invalid or expired token'
                ], 401);
                return $response;
            }


                // Lấy quyền truy cập từ token`
            $hasPermission = false;
            $permissions = $decoded->permissions;
            $requiredPermission = $decoded_permission->permission; // Access first permission
            foreach ($permissions as $perm) {
                if ($perm->permID === $requiredPermission) {
                    print_r($permissions===$perm->permID);
                    $hasPermission = true;
                    break;
                }
            }
                if (!$hasPermission) {
                    $response->json([
                        'error' => 'Permission denied'
                    ], 403);
                    return $response;
                }
            $response ->json([
                'message' => 'Access granted'
            ]);

        } catch (\Exception $e) {
            $response->json([
                'error' => 'An error occurred while verifying access: ' . $e->getMessage()
            ], 500);
        }
    }

}