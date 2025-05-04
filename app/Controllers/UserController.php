<?php

namespace Controllers;

use Controllers\Interface\IAuthController;
use Core\Request;
use Core\Response;
use Core\jwt_helper;
// use Middlewares\JwtMiddleware;
use http\Params;
use Services\Interface\IAuthService;
use Services\Interface\IBaseService;
use Services\RoleService;
use Services\UserService;


class UserController implements IAuthController
{
    private IAuthService $userService;

    public function __construct()
    {
        $this->userService = new UserService();
    }

    public function create(Response $response, Request $request)
    {
        try {
            $data = $request->getBody();
            $user = $this->userService->create($data);

            if ($user) {
                $response->json([
                    'message' => 'User created successfully',
                    'data' => $data
                ], 201);
            } else {
                $response->json(['error' => 'Failed to create user'], 500);
            }
        } catch (\Exception $e) {
            $response->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Response $response, Request $request)
    {
        try {
            $email = $request->getParam("email");
            if (!$email) {
                $response->json(['error' => 'Email is required'], 400);
                return;
            }

            $result = $this->userService->update($email, $request->getBody());
            if ($result) {
                $response->json(['message' => 'User updated successfully']);
            } else {
                $response->json(['error' => 'Failed to update user'], 500);
            }
        } catch (\Exception $e) {
            $response->json(['error' => $e->getMessage()], $e->getCode());
        }
    }

    public function delete(Response $response, Request $request)
    {
        try {
            $email = $request->getParam("email");
            if (!$email) {
                $response->json(['error' => 'Email is required'], 400);
                return;
            }

            $result = $this->userService->delete($email);
            if ($result) {
                $response->json(['message' => 'User deleted successfully']);
            } else {
                $response->json(['error' => 'Failed to delete user'], 500);
            }
        } catch (\Exception $e) {
            $response->json(['error' => $e->getMessage()], $e->getCode());
        }
    }

    public function getById(Response $response, Request $request)
    {
        try {
            $email = $request->getParam("email");
            if (!$email) {
                $response->json(['error' => 'Email is required'], 400);
                return;
            }

            $user = $this->userService->getById($email);
            if ($user) {
                $response->json(['data' => $user]);
            } else {
                $response->json(['error' => 'User not found'], 404);
            }
        } catch (\Exception $e) {
            $response->json(['error' => $e->getMessage()], $e->getCode());
        }
    }

    public function getAll(Response $response, Request $request)
    {
        try {
            $users = $this->userService->getAll();
            $response->json(['data' => $users]);
        } catch (\Exception $e) {
            $response->json(['error' => $e->getMessage()], $e->getCode());
        }
    }

    public function login(Response $response, Request $request) {
        try {
            $data = $request->getBody();
            $user = $this->userService->login($data);

            $response->json([
                'status' => true,
                'message' => 'Đăng nhập thành công',
                'data' => $user
            ]);

        } catch (\Exception $e) {
            // Trả về lỗi HTTP từ exception và thông báo lỗi chi tiết
            $response->json(['error' => $e->getMessage()], $e->getCode());
        }
    }


    public function register(Response $response, Request $request){
    }

    public function logout(Response $response, Request $request){
        $response->json(['error' => 'Not implemented'], 501);
    }

    public function me(Response $response, Request $request) {
        try{
            $data = $request->getBody();
            unset($data['role']);
            unset($data['permissions']);
            $response->json([
                'message' => 'User information',
                'data' => $data
            ]);
        }catch (\Exception $e){
            $response->json(['error' => $e->getMessage()], $e->getCode());
        }
    }

    public function getAllWithoutWhitelist(Response $response, Request $request, $id)
    {
        try {
            $users = $this->userService->getAllWithoutWhitelist($id);
            $response->json(['data' => $users]);
        } catch (\Exception $e) {
            $response->json(['error' => $e->getMessage()], $e->getCode());
        }
    }

public function parseEmails(Response $response, Request $request)
{
    try {
        $file = $request->getFiles()['excelFile'] ?? null;
        if (!$file) {
             $response->json(['status' => false, 'message' => 'No file uploaded'], 400);
        }

        // Pass to service layer to process the Excel file
        $result = $this->userService->parseEmailsFromExcel($file);

        $response->json([
            'status' => true,
            'data' => $result
        ]);

    } catch (\Exception $e) {
         $response->json([
            'status' => false,
            'message' => 'Error processing file: ' . $e->getMessage()
        ], 500);
    }
}

public function bulkCreate(Response $response, Request $request)
{
    try {
        $data = $request->getBody();
        $emails = $data['emails'] ?? [];
        $role = $data['position'] ?? 'student';
        if (empty($emails)) {
            $response->json(['status' => false, 'message' => 'No emails provided'], 400);
        }

        // Let service handle the business logic
        $createdUsers = $this->userService->createUsersInBulk($emails, $role);

         $response->json([
            'status' => true,
            'data' => [
                'createdUsers' => $createdUsers
            ]
        ]);

    } catch (\Exception $e) {
         $response->json([
            'status' => false,
            'message' => 'Error creating users: ' . $e->getMessage()
        ], 500);
    }
}
}