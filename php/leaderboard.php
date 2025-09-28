<?php
declare(strict_types=1);
require __DIR__ . '/db.php';

try {
    $pdo = db();
    $allowedDurations = [30,60,120];
    $duration = null;
    if(isset($_GET['duration'])){
        $d = (int)$_GET['duration'];
        if(in_array($d, $allowedDurations, true)) $duration = $d;
    }

    $base = 'SELECT r.wpm, r.accuracy, r.raw_wpm, r.errors_per_sec, r.created_at, r.duration, r.user_id, u.username
             FROM results r
             LEFT JOIN users u ON u.id = r.user_id';
    $where = [];
    $params = [];
    if($duration !== null){
        $where[] = 'r.duration = :dur';
        $params[':dur'] = $duration;
    }
    // Personal filter
    if(isset($_GET['personal']) && $_GET['personal']=='1'){
        $user = current_user();
        if(!$user){
            json_response([]); // no data if not logged in
        }
        $where[] = 'r.user_id = :uid';
        $params[':uid'] = $user['id'];
    }
    $sql = $base . (count($where)? ' WHERE '.implode(' AND ',$where):'') . ' ORDER BY r.wpm DESC, r.accuracy DESC, r.created_at DESC LIMIT 50';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    // Maintain original contract: return an array for frontend JS
    json_response($rows);
} catch (Throwable $e) {
    json_response([
        'error'=>'Leaderboard query failed',
        'message'=>$e->getMessage()
    ], 500);
}






