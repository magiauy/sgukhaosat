<?php

namespace Core;

class Response
{    public function json($data, int $status = 200)
    {
        http_response_code($status);
        header('Content-Type: application/json');
        
        $json = json_encode($data);
        if ($json === false) {
            // Log the JSON error
            error_log("JSON Encode Error: " . json_last_error_msg());
            // Send a fallback response
            echo json_encode([
                'status' => false, 
                'message' => 'Internal server error: Failed to encode response',
                'debug' => json_last_error_msg()
            ]);
        } else {
            echo $json;
        }
        
        exit(); // Stop script execution after sending response
    }
}
