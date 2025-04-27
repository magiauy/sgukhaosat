<?php
namespace Core;

class Router {
    private array $routes = [];

    public function get(string $path, callable $callback, array $params = []): void {
        $this->addRoute('GET', $path, $callback, $params);
    }

    public function post(string $path, callable $callback, array $params = []): void {
        $this->addRoute('POST', $path, $callback, $params);
    }

    public function put(string $path, callable $callback, array $params = []): void {
        $this->addRoute('PUT', $path, $callback, $params);
    }

    public function delete(string $path, callable $callback, array $params = []): void {
        $this->addRoute('DELETE', $path, $callback, $params);
    }

    private function addRoute(string $method, string $path, callable $callback, array $params): void {
        $this->routes[$method][] = [
            'path' => $path,
            'callback' => $callback,
            'params' => $params
        ];
    }

    public function resolve(string $method, string $uri): void {
        $path = parse_url($uri, PHP_URL_PATH);
        $query = parse_url($uri, PHP_URL_QUERY);
        parse_str($query ?? '', $queryParams);

        if (!isset($this->routes[$method])) {
            $this->handleNotFound();
            return;
        }

        foreach ($this->routes[$method] as $route) {
            $routePath = $route['path'];
            $paramValues = [];

            // Replace route parameters with regex patterns
            $pattern = preg_replace('/{([a-zA-Z0-9_]+)}/', '(?P<$1>[^/]+)', $routePath);
            $pattern = "#^$pattern$#";

            if (preg_match($pattern, $path, $matches)) {
                // Extract captured parameters
                foreach ($matches as $key => $value) {
                    if (is_string($key)) {
                        $paramValues[$key] = $value;
                    }
                }

                // Check if required query parameters exist
                foreach ($route['params'] as $param) {
                    if (!isset($queryParams[$param])) {
                        continue 2;
                    }
                }

                // Execute the route callback
                call_user_func($route['callback'], $paramValues);
                return;
            }
        }

        $this->handleNotFound();
    }

// Proposed Router class enhancement
        public function setNotFoundHandler(callable $handler): void {
            $this->notFoundHandler = $handler;
        }

        private function handleNotFound(): void {
            if (isset($this->notFoundHandler)) {
                call_user_func($this->notFoundHandler);
            } else {
                $response = new Response();
                $response->json('Not found', 404);
            }
        }
}