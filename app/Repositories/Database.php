<?php
namespace Repositories;

use PDO;
use PDOException;

class Database
{
    private static $instance = null;
    private $pdo;

    private function __construct()
    {
        $config = require __DIR__ . '/../../config/Database.php';
    
        try {
            error_log("Attempting database connection to {$config['host']}:{$config['port']}, database: {$config['dbname']}, user: {$config['username']}");
            
            $this->pdo = new PDO(
                "mysql:host={$config['host']};port={$config['port']};dbname={$config['dbname']}",
                $config['username'],
                $config['password']
            );
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
 
            error_log("Database connection established successfully");
        } catch (PDOException $e) {
          
            error_log("DATABASE CONNECTION ERROR: " . $e->getMessage() . " (Code: " . $e->getCode() . ")");
            
       
            $errorMessage = $this->getReadableErrorMessage($e);
            
          
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode([
                'status' => false,
                'message' => 'Database Connection Error',
                'details' => $errorMessage,
                'code' => $e->getCode()
            ]);
            exit;
        }
    }

    /**
     * Convert technical PDO error messages to more readable ones
     */
    private function getReadableErrorMessage(PDOException $e): string
    {
        $errorCode = $e->getCode();
        $errorMessage = $e->getMessage();  
      // Check for common MySQL/MariaDB error codesl  aDB error codesl
        switch ($errorCode) {
            case 1044:
                return "Access denied to the database. Please check your database user permissions.";
            case 1045:
                return "Database login failed. Please check your username and password.";
            case 1046:
                return "No database selected. Please check your database name.";
            case 1049:
                return "Unknown database. The specified database does not exist.";
            case 2002:
                return "Cannot connect to database server. Please check if the server is running and your host settings.";
            case 2003:
                return "Database server refused the connection. Please check your host and port settings.";
            case 2005:
                return "Unknown host. Please check your database host setting.";
            case 2006:
                return "Database server has gone away. Please check your server status.";
            default:
                if (strpos($errorMessage, 'Access denied') !== false) {
                    return "Access denied to database. Please verify your database credentials.";
                }
                
         
                return "Database connection failed (Error code: $errorCode). Please contact system administrator.";
        }
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection()
    {
        return $this->pdo;
    }
}
