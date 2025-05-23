<?php

namespace Controllers;

use Controllers\Interface\IAuthController;
use Core\AuthHelper;
use Core\Request;
use Core\Response;
use Core\jwt_helper;
// use Middlewares\JwtMiddleware;
use http\Params;
use Middlewares\JwtMiddleware;
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
             // Kiểm tra email tồn tại (tùy chọn)
            if ($this->userService->isEmailExists($data['email'])) {
                $response->json([
                    'success' => false,
                    'message' => 'Email đã tồn tại trong hệ thống'
                ], 200);
                return;
            }

            $user = $this->userService->create($data);

            if ($user) {
                $response->json([
                    'message' => 'Tạo tài khoảng thành công',
                    'status' => true,
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
            $data = $request->getBody();
            $email = $data['email'];

            if (!$email) {
                $response->json(['error' => 'Email is required'], 400);
                return;
            }

            $result = $this->userService->update($email, $data);
            if ($result) {
                $response->json([
                    'message' => 'User updated successfully',
                    'status' => true
                    ]);
            } else {
                $response->json(['error' => 'Failed to update user','status' => false], 500);
            }
        } catch (\Exception $e) {
            $response->json(['error' => $e->getMessage()], $e->getCode());
        }
    }

    public function delete(Response $response, Request $request)
    {
        try {
            $emails = $request->getBody();

            $sessionEmails = JwtMiddleware::getUserSession();

            // Duyệt qua $email nếu có thông tin của mail session thì trả về lỗi không thể tự xoá
            foreach ($emails as $email) {
                if (in_array($email, $sessionEmails)) {
                    $response->json(['message' => 'Không thể tự xoá chỉnh mình ' , 'status'=>false]);
                    return;
                }
            }

            $this->userService->delete($emails);
            $response->json(['message' => 'User deleted successfully',
                'status' => true
                ]);
        } catch (\Exception $e) {
            $response->json(['error' => $e->getMessage()], $e->getCode());
        }
    }

    public function getById(Response $response, Request $request)
    {
        try {
            $email = $request->getParam("email");
            error_log($email);
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

    public function resetPassword(Response $response, Request $request)
    {
        try {
            $data = $request->getBody();
            $email = $data['email'] ?? null;
            if (!$email) {
                $response->json(['status' => false, 'message' => 'Email is required'], 400);
            }

            // Let service handle the business logic
            $this->userService->resetPassword($data);
            $response->json([
                'status' => true,
                'message' => 'Password reset successfully'
            ]);
            
        } catch (\Exception $e) {
             $response->json([
                'status' => false,
                'message' => 'Error resetting password: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getOnPagination(Response $response, Request $request)
    {
        try {
            $data = $request->getBody();
            $users = $this->userService->getOnPagination($data);
            $response->json([
                'message' => 'Get user on pagination successfully',
                'data' => $users]);
        } catch (\Throwable $e) {
            $response->json(['error' => $e->getMessage()]);
        }
    }

    public function getByEmail(Response $response, Request $request)
    {
        try {
            $data = $request->getBody();
            $user = $this->userService->getByEmail($data);
            $response->json([
                'message' => 'Get user by email successfully',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            $response->json(['error' => $e->getMessage()]);
        }
    }
    
    public function updateInformation(Response $response, Request $request)
    {
        try {
            $data = $request->getBody();
            $data['user'] = JwtMiddleware::getUserSession();
            $this->userService->updateInformation($data);
            $response->json([
                'message' => 'Update user information successfully',
                'status' => true
            ]);
        } catch (\Exception $e) {
            $response->json(['error' => $e->getMessage(), 'status' => false]);
        }
    }
}