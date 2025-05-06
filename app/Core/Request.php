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

    public function getHeader(string $key, $default = null)
    {
        $headers = getallheaders();
        return $headers[$key] ?? $default;
    }
    public function getParam(string $key, $default = null)
    {
        return $_GET[$key] ?? $default;
    }

    public function getPost(string $key, $default = null)
    {
        return $_POST[$key] ?? $default;
    }

    public function setBody(array $body): void
    {
        $this->body = $body;
    }

    public function addBody(array $body): void
    {
        $this->body = array_merge($this->body, $body);
    }

    public function getFiles()
    {
        return $_FILES;
    }

//    public function getPathParam(string $string)
//    {
//        $path = explode('/', $_SERVER['REQUEST_URI']);
//        $path = array_filter($path);
//        $key = array_search($string, $path);
//        error_log("Key: " . $key);
//        error_log("Path: " . json_encode($path));
//        if ($key !== false && isset($path[$key + 1])) {
//            return $path[$key + 1];
//        }
//        return null;
//    }

}
