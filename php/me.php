<?php
declare(strict_types=1);
require __DIR__ . '/db.php';

$user = current_user();
if ($user) {
    json_response([
        'authenticated' => true, 
        'username' => $user['username'],
        'email' => $user['email'],
        'is_premium' => $user['is_premium'],
        'premium_activated_at' => $user['premium_activated_at']
    ]);
}
json_response(['authenticated' => false]);






