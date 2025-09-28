<?php
declare(strict_types=1);
require __DIR__ . '/db.php';

session_destroy();
json_response(['success' => true]);






