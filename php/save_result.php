<?php
declare(strict_types=1);
require __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Invalid method'], 405);
}

$wpm = (int)($_POST['wpm'] ?? 0);
$accuracy = (int)($_POST['accuracy'] ?? 0);
$duration = (int)($_POST['duration'] ?? 0); 
if ($duration < 0) { $duration = 0; }

$raw = (int)($_POST['raw_wpm'] ?? $_POST['rawWpm'] ?? 0);
$consistency = (int)($_POST['consistency'] ?? 0); if($consistency < 0) $consistency = 0; if($consistency > 100) $consistency = 100;
$errorsPerSec = (float)($_POST['errors_per_sec'] ?? $_POST['errorsPerSec'] ?? 0);
$wordCount = (int)($_POST['word_count'] ?? 0);
$testType = $_POST['test_type'] ?? ($duration > 0 ? 'time' : 'word');

if ($wpm < 0 || $accuracy < 0 || $accuracy > 100) {
    json_response(['success' => false, 'error' => 'Invalid data'], 400);
}

$user = current_user();
$pdo = db();


try {
  
    $columnQuery = $pdo->prepare("SHOW COLUMNS FROM results LIKE 'test_type'");
    $columnQuery->execute();
    $hasTestTypeColumn = $columnQuery->rowCount() > 0;
    
    $columnQuery = $pdo->prepare("SHOW COLUMNS FROM results LIKE 'word_count'");
    $columnQuery->execute();
    $hasWordCountColumn = $columnQuery->rowCount() > 0;
    
   
    if (!$hasTestTypeColumn) {
        $pdo->exec("ALTER TABLE results ADD COLUMN test_type VARCHAR(10) DEFAULT 'time' AFTER test_time");
    }
    
    if (!$hasWordCountColumn) {
        $pdo->exec("ALTER TABLE results ADD COLUMN word_count INT DEFAULT 0 AFTER test_type");
    }
    
} catch (PDOException $e) {

    error_log("Error checking/adding columns: " . $e->getMessage());
}


$stmt = $pdo->prepare('INSERT INTO results (user_id, wpm, accuracy, test_time, test_type, word_count, raw_wpm, consistency, errors_per_sec) 
                       VALUES (:uid, :wpm, :acc, :test_time, :test_type, :word_count, :raw_wpm, :consistency, :errors_per_sec)');
$stmt->execute([
    ':uid' => $user['id'] ?? null,
    ':wpm' => $wpm,
    ':acc' => $accuracy,
    ':test_time' => $duration,
    ':test_type' => $testType,
    ':word_count' => $wordCount,
    ':raw_wpm' => $raw,
    ':consistency' => $consistency,
    ':errors_per_sec' => $errorsPerSec
]);

json_response(['success' => true]);






