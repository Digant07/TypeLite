<?php
declare(strict_types=1);
require __DIR__ . '/db.php';

$user = current_user();
if ($user) {
    json_response([
        'authenticated' => true, 
        'username' => $user['username'],
        'email' => $user['email'] ?? null,
        'is_premium' => (bool)($user['is_premium'] ?? false),
        'premium_activated_at' => $user['premium_activated_at'] ?? null
    ]);
}
json_response(['authenticated' => false]);






