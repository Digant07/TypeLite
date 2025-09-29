<?php

require_once __DIR__ . '/../../lib/auth.php';
$user = current_user();
if (!$user) {
    header('Location: /auth/login.php');
    exit;
}

$stats = [
    'level' => 1,
    'xp' => 23,
    'xp_max' => 100,
    'tests_started' => 42,
    'tests_completed' => 39,
    'typing_time' => 3725,
    'best_time' => [15=>72,30=>85,60=>90,120=>88],
    'best_word' => [10=>80,25=>87,50=>89,100=>85],
    'accuracy_time' => [15=>97,30=>98,60=>99,120=>98],
    'accuracy_word' => [10=>96,25=>97,50=>98,100=>97],
];
function format_time($sec) {
    $h = floor($sec/3600); $m = floor(($sec%3600)/60); $s = $sec%60;
    return sprintf('%02d:%02d:%02d', $h, $m, $s);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile – Typing Speed Tester</title>
    <link rel="stylesheet" href="/assets/css/style.css">
    <link rel="stylesheet" href="/assets/css/profile.css">
    <script src="/assets/js/profile.js" defer></script>
</head>
<body class="dark-theme">
    <nav class="profile-nav">
        <div class="nav-logo">Typing Speed Tester</div>
        <ul class="nav-menu">
            <li><a href="/app/leaderboards.php">Leaderboards</a></li>
            <li><a href="/app/profile.php" class="active">Profile</a></li>
            <li><a href="/app/settings.php">Settings</a></li>
            <li><a href="/auth/logout.php" class="logout-btn">Logout</a></li>
        </ul>
    </nav>
    <main class="profile-main">
        <aside class="profile-sidebar compact-sidebar">
            <ul class="sidebar-menu">
                <li><a href="#" class="sidebar-link"><span class="sidebar-icon">📊</span> User stats</a></li>
                <li><a href="/auth/logout.php" class="sidebar-link"><span class="sidebar-icon">↩️</span> Sign out</a></li>
            </ul>
        </aside>
        <section class="profile-dashboard">
            <!--User Identity -->
            <div class="profile-card identity-card">
                <div class="profile-avatar">
                    <img src="/assets/img/avatar_default.png" alt="Avatar" id="avatar-img">
                    <button class="edit-avatar-btn" title="Edit Picture">✏️</button>
                </div>
                <div class="profile-info">
                    <div class="profile-username">
                        <span id="username-display"><?php echo htmlspecialchars($user['username']); ?></span>
                        <button class="edit-username-btn" title="Edit Username">✏️</button>
                    </div>
                    <div class="profile-join-date">Joined: <?php echo date('M Y', strtotime($user['created_at'] ?? 'now')); ?></div>
                    <div class="profile-xp-bar">
                        <div class="xp-label">Level <?php echo $stats['level']; ?> – <?php echo $stats['xp']; ?>/<?php echo $stats['xp_max']; ?> XP</div>
                        <div class="xp-bar-bg">
                            <div class="xp-bar-fill" style="width:<?php echo round(100*$stats['xp']/$stats['xp_max']); ?>%"></div>
                        </div>
                    </div>
                    <div class="profile-quick-stats">
                        <div>Tests Started: <span><?php echo $stats['tests_started']; ?></span></div>
                        <div>Tests Completed: <span><?php echo $stats['tests_completed']; ?></span></div>
                        <div>Total Typing Time: <span><?php echo format_time($stats['typing_time']); ?></span></div>
                    </div>
                </div>
            </div>
            <!-- Performance Overview Cards -->
            <div class="profile-cards performance-cards">
                <div class="perf-card">
                    <div class="perf-title">Best Time-based Results</div>
                    <div class="perf-modes">
                        <?php foreach([15,30,60,120] as $t): ?>
                        <div class="perf-mode">
                            <div class="mode-label"><?php echo $t; ?>s</div>
                            <div class="mode-wpm">WPM: <span><?php echo $stats['best_time'][$t]; ?></span></div>
                            <div class="mode-acc">Accuracy: <span><?php echo $stats['accuracy_time'][$t]; ?>%</span></div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
                <div class="perf-card">
                    <div class="perf-title">Best Word-based Results</div>
                    <div class="perf-modes">
                        <?php foreach([10,25,50,100] as $w): ?>
                        <div class="perf-mode">
                            <div class="mode-label"><?php echo $w; ?> words</div>
                            <div class="mode-wpm">WPM: <span><?php echo $stats['best_word'][$w]; ?></span></div>
                            <div class="mode-acc">Accuracy: <span><?php echo $stats['accuracy_word'][$w]; ?>%</span></div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
            <!-- History & Analytics -->
            <div class="profile-card analytics-card">
                <div class="analytics-header">
                    <div class="analytics-title">History & Progress</div>
                    <div class="analytics-filters">
                        <label>Range:
                            <select id="history-range">
                                <option value="today">Today</option>
                                <option value="week">Weekly</option>
                                <option value="month">Monthly</option>
                                <option value="all">All-time</option>
                            </select>
                        </label>
                    </div>
                </div>
                <div class="analytics-graph">
                    <canvas id="progressChart" height="120"></canvas>
                </div>
                <div class="analytics-history">
                    <table class="history-table">
                        <thead>
                            <tr><th>Date</th><th>WPM</th><th>Accuracy</th><th>Type</th></tr>
                        </thead>
                        <tbody id="historyBody">
                           
                        </tbody>
                    </table>
                </div>
            </div>
          
            <div class="profile-cards achievements-cards">
                <div class="achievements-title">Achievements & Badges</div>
                <div class="badges-list">
                    <div class="badge unlocked" title="50+ WPM">🏅 50+ WPM</div>
                    <div class="badge unlocked" title="100 tests">🏅 100 Tests</div>
                    <div class="badge locked" title="200+ WPM">🔒 200+ WPM</div>
                    <div class="badge locked" title="500 tests">🔒 500 Tests</div>
                </div>
            </div>
        </section>
        
        <div class="profile-float-menu">
            <button class="float-avatar-btn" id="floatAvatarBtn">
                <span class="float-avatar-circle">DI</span>
                <span class="float-avatar-icon">🌙</span>
            </button>
            <div class="float-dropdown" id="floatDropdown" style="display:none; min-width:160px; flex-direction:column;">
                <a href="#user-stats" class="float-menu-item float-userstats" style="margin-bottom:10px;">User stats</a>
                <a href="/auth/logout.php" class="float-menu-item float-logout">Logout</a>
            </div>
        </div>
        <script>
     
        const floatBtn = document.getElementById('floatAvatarBtn');
        const floatDropdown = document.getElementById('floatDropdown');
        floatBtn?.addEventListener('click', function(e){
            e.stopPropagation();
            floatDropdown.style.display = floatDropdown.style.display==='block' ? 'none' : 'block';
        });
        document.addEventListener('click', function(){
            floatDropdown.style.display = 'none';
        });
        </script>
        </main>
</body>
</html>
