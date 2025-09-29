<?php
declare(strict_types=1);
require __DIR__ . '/db.php';


$user = current_user();
if (!$user) {
    json_response(['success' => false, 'error' => 'Not authenticated'], 401);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $pdo = db();
        $stmt = $pdo->prepare('UPDATE users SET is_premium = 0, premium_activated_at = NULL WHERE id = ?');
        $result = $stmt->execute([$user['id']]);
        
        if ($result) {
            json_response([
                'success' => true,
                'message' => 'Premium subscription cancelled successfully'
            ]);
        } else {
            json_response(['success' => false, 'error' => 'Failed to cancel subscription'], 500);
        }
    } catch (Exception $e) {
        json_response(['success' => false, 'error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

json_response(['success' => false, 'error' => 'Invalid method'], 405);