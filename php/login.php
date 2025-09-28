<?php
declare(strict_types=1);
require __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Invalid method'], 405);
}

$username = trim((string)($_POST['username'] ?? ''));
$password = (string)($_POST['password'] ?? '');

if ($username === '' || $password === '') {
    json_response(['success' => false, 'error' => 'Missing credentials'], 400);
}

$pdo = db();
$stmt = $pdo->prepare('SELECT id, password_hash FROM users WHERE username = :u LIMIT 1');
$stmt->execute([':u' => $username]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    json_response(['success' => false, 'error' => 'Invalid username or password'], 200);
}

$_SESSION['user_id'] = (int)$user['id'];
$_SESSION['username'] = $username;

json_response(['success' => true, 'username' => $username]);






