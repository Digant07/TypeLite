## Typing Test App

Minimal, responsive typing test inspired by Monkeytype. Frontend (HTML/CSS/JS) and PHP backend with SQLite for auth, results, and leaderboard.

### Prerequisites
- PHP 8.1+

### Run locally (PHP built-in server)
```bash
php -S 127.0.0.1:8000 -t "C:\\Users\\digan\\Coding files\\WT Project"
```
Then open `http://127.0.0.1:8000/index.html`.

On first run, SQLite database `data.sqlite` is created automatically in the project root.

### Features
- Timed and word-count modes
- Real-time WPM and accuracy
- Error highlighting, backspace handling
- Dark/light theme toggle (persisted)
- Auth (register/login), save results, leaderboard
- **Music-Synced Typing**: New rhythm-based typing test with beat detection and music integration

### File structure
- `index.html`, `styles.css`, `app.js`
- `php/` server endpoints: `db.php`, `register.php`, `login.php`, `save_result.php`, `leaderboard.php`

### Notes
- Passwords are hashed via `password_hash`.
- Results can be saved anonymously; `username` shows as Guest on leaderboard.





