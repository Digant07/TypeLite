<?php
declare(strict_types=1);
require __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Invalid method'], 405);
}

$wpm = (int)($_POST['wpm'] ?? 0);
$accuracy = (int)($_POST['accuracy'] ?? 0);
$duration = (int)($_POST['duration'] ?? 0); // seconds, 0 for words mode or unknown
if ($duration < 0) { $duration = 0; }
// Optional extended metrics
$raw = (int)($_POST['raw_wpm'] ?? $_POST['rawWpm'] ?? 0);
$consistency = (int)($_POST['consistency'] ?? 0); if($consistency < 0) $consistency = 0; if($consistency > 100) $consistency = 100;
$errorsPerSec = (float)($_POST['errors_per_sec'] ?? $_POST['errorsPerSec'] ?? 0);
if ($wpm < 0 || $accuracy < 0 || $accuracy > 100) {
    json_response(['success' => false, 'error' => 'Invalid data'], 400);
}

$user = current_user();
$pdo = db();
$stmt = $pdo->prepare('INSERT INTO results (user_id, wpm, accuracy, duration, raw_wpm, consistency, errors_per_sec, created_at) VALUES (:uid, :wpm, :acc, :dur, :raw, :cons, :eps, :t)');
$stmt->execute([
    ':uid' => $user['id'] ?? null,
    ':wpm' => $wpm,
    ':acc' => $accuracy,
    ':dur' => $duration,
    ':raw' => $raw,
    ':cons' => $consistency,
    ':eps' => $errorsPerSec,
    ':t' => gmdate('c'),
]);

json_response(['success' => true]);






