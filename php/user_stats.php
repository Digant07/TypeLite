<?php
declare(strict_types=1);
require __DIR__ . '/db.php';

try {
    $user = current_user();
    if (!$user) {
        json_response(['authenticated' => false]);
        exit;
    }

    $pdo = db();
    
    // Get basic stats
    $stmt = $pdo->prepare('SELECT COUNT(*) as tests_taken, MAX(wpm) as best_wpm, AVG(accuracy) as avg_accuracy FROM results WHERE user_id = :uid');
    $stmt->execute([':uid' => $user['id']]);
    $stats = $stmt->fetch();
    
    // Get recent test count (last 7 days)
    $stmt = $pdo->prepare('SELECT COUNT(*) as recent_tests FROM results WHERE user_id = :uid AND created_at >= datetime("now", "-7 days")');
    $stmt->execute([':uid' => $user['id']]);
    $recent = $stmt->fetch();

    // Calculate total typing time (sum of all test durations)
    $stmt = $pdo->prepare('SELECT SUM(duration) as total_time FROM results WHERE user_id = :uid AND duration > 0');
    $stmt->execute([':uid' => $user['id']]);
    $timeData = $stmt->fetch();
    $totalSeconds = (int)$timeData['total_time'] ?: 0;

    json_response([
        'authenticated' => true,
        'username' => $user['username'],
        'user_id' => $user['id'],
        'stats' => [
            'tests_taken' => (int)$stats['tests_taken'],
            'best_wpm' => round((float)$stats['best_wpm'], 1),
            'avg_accuracy' => round((float)$stats['avg_accuracy'], 1),
            'recent_tests' => (int)$recent['recent_tests'],
            'total_typing_time' => $totalSeconds
        ]
    ]);
} catch (Exception $e) {
    json_response(['authenticated' => false, 'error' => $e->getMessage()], 500);
}