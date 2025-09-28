<?php
declare(strict_types=1);
require __DIR__ . '/db.php';
@ini_set('display_errors', '1');
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Invalid method'], 405);
}

$username = trim((string)($_POST['username'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$password = (string)($_POST['password'] ?? '');

if ($username === '' || $password === '') {
    json_response(['success' => false, 'error' => 'Missing credentials'], 400);
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(['success' => false, 'error' => 'Invalid email'], 400);
}

$pdo = db();
try {
    $stmt = $pdo->prepare('INSERT INTO users (username, email, password_hash, created_at) VALUES (:u, :e, :p, :t)');
    $stmt->execute([
        ':u' => $username,
        ':e' => $email !== '' ? $email : null,
        ':p' => password_hash($password, PASSWORD_DEFAULT),
        ':t' => gmdate('c'),
    ]);
} catch (PDOException $e) {
    $msg = $e->getMessage();
    if (stripos($msg, 'UNIQUE') !== false) {
        $err = stripos($msg, 'email') !== false ? 'Email already in use' : 'Username already taken';
        json_response(['success' => false, 'error' => $err], 200);
    }
    json_response(['success' => false, 'error' => 'Server error: ' . $msg], 500);
}

$_SESSION['user_id'] = (int)$pdo->lastInsertId();
$_SESSION['username'] = $username;
json_response(['success' => true, 'username' => $username]);


