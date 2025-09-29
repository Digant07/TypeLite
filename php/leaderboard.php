<?php
declare(strict_types=1);
require __DIR__ . '/db.php';

try {
    $pdo = db();
    $allowedDurations = [15, 30, 60, 120];
    $allowedWordCounts = [10, 25, 50, 100];
    $duration = null;
    $type = isset($_GET['type']) ? $_GET['type'] : null;
    
    
    if(isset($_GET['duration'])){
        $d = (int)$_GET['duration'];
        if(in_array($d, $allowedDurations, true)) $duration = $d;
    }

    $base = 'SELECT r.wpm, r.accuracy, r.created_at, r.test_time, r.word_count, r.test_type, r.user_id, u.username
             FROM results r
             LEFT JOIN users u ON u.id = r.user_id';
    $where = [];
    $params = [];
    
    // Default to time-based tests if type is not specified
    if($type === 'time' || $type === null) {
        $where[] = '(r.test_type = "time" OR (r.test_type IS NULL AND r.test_time > 0))';
    } elseif($type === 'word') {
        $where[] = '(r.test_type = "word" OR (r.test_type IS NULL AND r.test_time = 0))';
    }
    
    
    if($duration !== null && ($type === 'time' || $type === null)){
        $where[] = 'r.test_time = :dur';
        $params[':dur'] = $duration;
    }
    
    if(isset($_GET['word_count']) && $type === 'word'){
        $wc = (int)$_GET['word_count'];
        if(in_array($wc, $allowedWordCounts, true)) {
            $where[] = 'r.word_count = :wc';
            $params[':wc'] = $wc;
        }
    }
    
    
    if(isset($_GET['personal']) && $_GET['personal']=='1'){
        $user = current_user();
        if(!$user){
            json_response([]); 
            exit;
        }
        $where[] = 'r.user_id = :uid';
        $params[':uid'] = $user['id'];
    }
    
    $orderBy = $type === 'word' ? 'r.wpm DESC, r.accuracy DESC, r.created_at DESC' : 
                                  'r.wpm DESC, r.accuracy DESC, r.created_at DESC';
                                  
    $sql = $base . (count($where) ? ' WHERE '.implode(' AND ',$where):'') . 
           ' ORDER BY ' . $orderBy . ' LIMIT 100';
           
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    
    json_response($rows);
} catch (Throwable $e) {
    json_response([
        'error'=>'Leaderboard query failed',
        'message'=>$e->getMessage()
    ], 500);
}






