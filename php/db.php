<?php
declare(strict_types=1);


session_start();

function db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    if (!in_array('sqlite', PDO::getAvailableDrivers(), true)) {
        json_response([
            'success' => false,
            'error' => 'PDO SQLite driver not installed/enabled. Enable pdo_sqlite and sqlite3 in php.ini.'
        ], 500);
    }

    $dbPath = __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'data.sqlite';
    $pdo = new PDO('sqlite:' . $dbPath, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    bootstrap($pdo);
    migrate($pdo);

    return $pdo;
}

function bootstrap(PDO $pdo): void {
    $pdo->exec('PRAGMA journal_mode = WAL');
    $pdo->exec('PRAGMA foreign_keys = ON');

    $pdo->exec('CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
    )');

    $pdo->exec('CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NULL,
        wpm INTEGER NOT NULL,
        accuracy INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
    )');
}

function migrate(PDO $pdo): void {
    $cols = $pdo->query('PRAGMA table_info(users)')->fetchAll();
    $hasEmail = false;
    $hasPremium = false;
    $hasPremiumDate = false;
    foreach ($cols as $c) {
        $colName = $c['name'] ?? ($c[1] ?? null); // SQLite may return both assoc and numeric keys
        if ($colName === 'email') { $hasEmail = true; }
        if ($colName === 'is_premium') { $hasPremium = true; }
        if ($colName === 'premium_activated_at') { $hasPremiumDate = true; }
    }
    if (!$hasEmail) {
        $pdo->exec('ALTER TABLE users ADD COLUMN email TEXT NULL');
        try { $pdo->exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)'); } catch (Throwable $e) {}
    }
    if (!$hasPremium) {
        $pdo->exec('ALTER TABLE users ADD COLUMN is_premium INTEGER NOT NULL DEFAULT 0');
    }
    if (!$hasPremiumDate) {
        $pdo->exec('ALTER TABLE users ADD COLUMN premium_activated_at TEXT NULL');
    }

    $rCols = $pdo->query('PRAGMA table_info(results)')->fetchAll();
    $hasDuration = false; $hasRaw=false; $hasConsistency=false; $hasErrorsPerSec=false;
    foreach($rCols as $c){
        $colName = $c['name'] ?? ($c[1] ?? null);
        if($colName === 'duration') $hasDuration = true;
        if($colName === 'raw_wpm') $hasRaw = true;
        if($colName === 'consistency') $hasConsistency = true;
        if($colName === 'errors_per_sec') $hasErrorsPerSec = true;
    }
    try {
        if(!$hasDuration){ $pdo->exec('ALTER TABLE results ADD COLUMN duration INTEGER NOT NULL DEFAULT 0'); }
        if(!$hasRaw){ $pdo->exec('ALTER TABLE results ADD COLUMN raw_wpm INTEGER NOT NULL DEFAULT 0'); }
        if(!$hasConsistency){ $pdo->exec('ALTER TABLE results ADD COLUMN consistency INTEGER NOT NULL DEFAULT 0'); }
        if(!$hasErrorsPerSec){ $pdo->exec('ALTER TABLE results ADD COLUMN errors_per_sec REAL NOT NULL DEFAULT 0'); }
    } catch (Throwable $e) {}
    try { $pdo->exec('CREATE INDEX IF NOT EXISTS idx_results_duration ON results(duration)'); } catch (Throwable $e) {}
    try { $pdo->exec('CREATE INDEX IF NOT EXISTS idx_results_wpm ON results(wpm)'); } catch (Throwable $e) {}
}

function current_user(): ?array {
    if (!isset($_SESSION['user_id'], $_SESSION['username'])) {
        return null;
    }
    
    $pdo = db();
    $stmt = $pdo->prepare('SELECT id, username, email, is_premium, premium_activated_at FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        return null;
    }
    
    return [
        'id' => (int)$user['id'],
        'username' => (string)$user['username'],
        'email' => $user['email'],
        'is_premium' => (bool)$user['is_premium'],
        'premium_activated_at' => $user['premium_activated_at'],
    ];
}

function json_response($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}


