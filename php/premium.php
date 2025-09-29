<?php
require __DIR__ . '/db.php';


$user = current_user();
if (!$user) {
    json_response(['success' => false, 'error' => 'Not authenticated'], 401);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    error_log("Premium POST request - Input: " . json_encode($input));
    error_log("Premium POST request - User ID: " . $user['id']);
    
    if (isset($input['action']) && $input['action'] === 'cancel') {

        try {
            $pdo = db();
            $stmt = $pdo->prepare('UPDATE users SET is_premium = FALSE, premium_activated_at = NULL WHERE id = ?');
            $result = $stmt->execute([$user['id']]);
            
            if ($result && $stmt->rowCount() > 0) {
                json_response([
                    'success' => true,
                    'message' => 'Premium subscription cancelled successfully',
                    'is_premium' => false
                ]);
            } else {
                json_response([
                    'success' => false, 
                    'error' => 'Failed to update user record'
                ]);
            }
        } catch (PDOException $e) {
            error_log("Premium cancellation error: " . $e->getMessage());
            json_response([
                'success' => false,
                'error' => 'Database error occurred'
            ]);
        }
        
    } else {
        
        if (!isset($input['payment_confirmed']) || $input['payment_confirmed'] !== true) {
            json_response(['success' => false, 'error' => 'Payment not confirmed'], 400);
        }
        
        $pdo = db();
        $stmt = $pdo->prepare('UPDATE users SET is_premium = TRUE, premium_activated_at = NOW() WHERE id = ?');
        $stmt->execute([$user['id']]);
        
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