<?php
require __DIR__ . '/db.php';
$pdo = db();
// create a dummy anonymous result
$stmt = $pdo->prepare('INSERT INTO results (user_id, wpm, accuracy, created_at) VALUES (NULL, :wpm, :accuracy, :created_at)');
for($i=0;$i<5;$i++){
    $stmt->execute([
        ':wpm' => rand(40,110),
        ':accuracy' => rand(85,100),
        ':created_at' => date('c', time()-$i*3600)
    ]);
}
echo "Seeded sample results.\n";