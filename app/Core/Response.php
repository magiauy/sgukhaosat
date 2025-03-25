<?php

namespace Core;

class Response
{
    public function json($data, int $status = 200)
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
    }

    public function sendMessage($message, int $status = 200)
    {
        http_response_code($status);
        echo $message;
    }
}
