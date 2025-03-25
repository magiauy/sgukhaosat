<?php

        namespace Controllers;

        use Core\Request;
        use Core\Response;
        use Services\IAuthService;
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
                    $response->json(['error' => $e->getMessage()], 500);
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
                    $response->json(['error' => $e->getMessage()], 500);
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
                    $response->json(['error' => $e->getMessage()], 500);
                }
            }

            public function getAll(Response $response, Request $request)
            {
                try {
                    $users = $this->userService->getAll();
                    $response->json(['data' => $users]);
                } catch (\Exception $e) {
                    $response->json(['error' => $e->getMessage()], 500);
                }
            }

            public function login(Response $response, Request $request){
                try {
                    $data = $request->getBody();
                    $user = $this->userService->login($data);
                    if ($user!=null) {
                        $response->json([
                            'message' => 'Đăng nhập thành công',
                            'data' => $user
                        ]);
                            session_start();
                            $_SESSION['email'] = $user['email'];
                            $_SESSION['roleId'] = $user['roleId'];
                            $_SESSION['fullName'] = $user['fullName'];
                            $_SESSION['phone'] = $user['phone'];
                    } else {
                        $response->json(['error' => 'Đăng nhập thất bại', 'data' => $user

                        ], 401);
                    }
                }catch (\Exception $e){
                    $response->json(['error' => $e->getMessage()], 500);
                }
            }

            public function register(Response $response, Request $request){
                session_destroy();
            }

            public function logout(Response $response, Request $request){
                $response->json(['error' => 'Not implemented'], 501);
            }

            public function me(Response $response, Request $request) {
                session_start();
                if (isset($_SESSION['email'])) {
                    $response->json([
                        'email' => $_SESSION['email'],
                        'roleId' => $_SESSION['roleId'],
                        'fullName' => $_SESSION['fullName'],
                        'phone' => $_SESSION['phone']
                    ]);
                } else {
                    $response->json(['error' => 'Not logged in'], 401);
                }
            }



        }