<?php
require __DIR__ . '/../../lib/session.php';
require __DIR__ . '/../../lib/csrf.php';
require __DIR__ . '/../../lib/database.php';
require __DIR__ . '/../../lib/utils.php';

csrf_require();
start_session();

$uid = $_SESSION['uid'] ?? null;
if ($uid) {
    
    if (!empty($_COOKIE['remember'])) {
        $pdo = db();
        $stmt = $pdo->prepare('DELETE FROM sessions WHERE user_id = ? AND token = ?');
        $stmt->execute([(int)$uid, $_COOKIE['remember']]);
        setcookie('remember', '', time()-3600, '/');
    }
    session_destroy();
}

json_response(200, 'Logged out');

