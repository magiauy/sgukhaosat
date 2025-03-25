<?php

namespace Core;

class Request
{
    private array $body;

    public function __construct()
    {
        $this->body = json_decode(file_get_contents("php://input"), true) ?? [];
    }

    public function getBody(): array
    {
        return $this->body;
    }

    public function getParam(string $key, $default = null)
    {
        return $_GET[$key] ?? $default;
    }

    public function getPost(string $key, $default = null)
    {
        return $_POST[$key] ?? $default;
    }
}
