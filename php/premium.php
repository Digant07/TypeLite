<?php
declare(strict_types=1);
require __DIR__ . '/db.php';

$user = current_user();
if (!$user) {
    json_response(['success' => false, 'error' => 'Not authenticated'], 401);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (isset($input['action']) && $input['action'] === 'cancel') {
        $pdo = db();
        $stmt = $pdo->prepare('UPDATE users SET is_premium = 0, premium_activated_at = NULL WHERE id = ?');
        $stmt->execute([$user['id']]);
        
        json_response([
            'success' => true,
            'message' => 'Premium subscription cancelled successfully',
            'is_premium' => false
        ]);
        
    } else {
        if (!isset($input['payment_confirmed']) || $input['payment_confirmed'] !== true) {
            json_response(['success' => false, 'error' => 'Payment not confirmed'], 400);
        }
        
        $pdo = db();
        $stmt = $pdo->prepare('UPDATE users SET is_premium = 1, premium_activated_at = ? WHERE id = ?');
        $stmt->execute([date('Y-m-d H:i:s'), $user['id']]);
        
        json_response([
            'success' => true,
            'message' => 'Premium activated successfully',
            'is_premium' => true
        ]);
    }
    
} elseif ($method === 'GET') {
    json_response([
        'success' => true,
        'is_premium' => $user['is_premium'],
        'premium_activated_at' => $user['premium_activated_at']
    ]);
    
} else {
    json_response(['success' => false, 'error' => 'Method not allowed'], 405);
}
