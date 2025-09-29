<?php
declare(strict_types=1);


session_start();


define('DB_HOST', 'localhost');
define('DB_NAME', 'typing_test');
define('DB_USER', 'root');
define('DB_PASS', ''); 

function db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

   
    if (!in_array('mysql', PDO::getAvailableDrivers(), true)) {
        json_response([
            'success' => false,
            'error' => 'PDO MySQL driver not installed/enabled. Enable pdo_mysql in php.ini.'
        ], 500);
    }

    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ]);

       
        bootstrap($pdo);

    } catch (PDOException $e) {
        json_response([
            'success' => false,
            'error' => 'Database connection failed: ' . $e->getMessage()
        ], 500);
    }

    return $pdo;
}

function bootstrap(PDO $pdo): void {
   
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(255) NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        is_premium BOOLEAN DEFAULT FALSE,
        premium_activated_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

   
    $pdo->exec("CREATE TABLE IF NOT EXISTS results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        wpm INT NOT NULL DEFAULT 0,
        accuracy FLOAT NOT NULL DEFAULT 0,
        raw_wpm INT DEFAULT 0,
        consistency INT DEFAULT 0,
        errors_per_sec FLOAT DEFAULT 0,
        duration INT DEFAULT 0,
        test_time INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_wpm (wpm),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    
    try {
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_results_user_wpm ON results(user_id, wpm DESC)");
    } catch (PDOException $e) {
       
    }
}

function current_user(): ?array {
    if (!isset($_SESSION['user_id'])) {
        return null;
    }
    
    static $user = null;
    if ($user !== null) {
        return $user;
    }
    
    $pdo = db();
    $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch() ?: null;
    
    return $user;
}

function json_response($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function validate_email(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function hash_password(string $password): string {
    return password_hash($password, PASSWORD_DEFAULT);
}

function verify_password(string $password, string $hash): bool {
    return password_verify($password, $hash);
}