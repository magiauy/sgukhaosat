<?php

namespace Middlewares;
use Core\Response;
use Core\Request;
use Core\jwt_helper;
class JwtMiddleware
{
    public static function authenticate(Request $request,Response $response,$permission , $next)
    {
        $token = $request->getHeader('Authorization')[0] ?? null;

        if (!$token) {
            $response->json([
                'error' => 'Authorization token not provided'
            ], 401);
            return $response;
        }

        // Assuming you have a method to verify the token
        $jwtHelper = new jwt_helper();
        $decoded = $jwtHelper->verifyJWT($token, 'your_secret_key');

        if (!$decoded) {
            $response->json([
                'error' => 'Invalid or expired token'
            ], 401);
            return $response;
        }

        //Don't have
        if ($permission) {
            $permissions = explode(',', $decoded->permissions);
            if (!in_array($permission, $permissions)) {
                $response->json([
                    'error' => 'Permission denied'
                ], 403);
                return $response;
            }
        }

        // Store user data in request for later use


        $request->user = $decoded;

        return $next($request, $response);
    }
}