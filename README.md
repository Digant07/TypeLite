# TypeLite
# Live Link : https://typelite.ct.ws/

A modern, responsive typing test web application with user accounts, leaderboards, and premium features.

# Features
- Time-based and word-based typing tests
- Real-time WPM and accuracy tracking
- User registration and login (no email verification required)
- Personal profile with stats and test history
- Global leaderboard (top 10, no guest accounts)
- Premium features: expert difficulty, music, etc.
- Fully responsive for desktop and mobile

## Tech Stack
- Frontend: HTML5, CSS3, JavaScript (vanilla)
- Backend: PHP (procedural, REST-like API)
- Database: MySQL (with PDO)
- Session: PHP sessions for authentication

# Project Workflow
1. User Registration & Login
   - Users sign up with username, email, and password.
   - Login creates a session for authenticated actions.
2. Typing Test
   - Users select mode, difficulty, and start typing.
   - Frontend tracks input and stats in real time.
   - On completion, results are sent to the backend and saved.
3. Profile & History
   - Users view their stats and test history (last 50 results).
   - Data is fetched via AJAX from PHP endpoints.
4. Leaderboard
   - Shows top 10 results (excluding guests) for each mode/duration.
   - Data is fetched from the backend.
5. Premium Features
   - Premium users unlock expert mode and music.
   - Premium status is checked on the backend and reflected in the UI.

# Setup Instructions
1. Clone the repository
   ```
   git clone https://github.com/yourusername/TypeLite.git
   cd TypeLite
   ```
2. Configure the Database
   - Create a MySQL database (default: `typing_test`).
   - Update DB credentials in `php/db-mysql.php` if needed.
   - The schema is auto-created on first run.
3. Run Locally
   - Use XAMPP, WAMP, or any PHP+MySQL server.
   - Place the project in your web root (e.g., `htdocs`).
   - Access via `http://localhost/TypeLite/`.

# File Structure
- `index.html` — Main typing test UI
- `profile.html` — User profile and stats
- `leaderboard.html` — Leaderboard page
- `php/` — Backend PHP scripts (API, DB, auth, etc.)
- `assets/` — Static assets (CSS, JS, music)

# Security Notes
- Passwords are hashed using PHP's `password_hash`
- All user actions require a valid session
- No email verification or third-party auth

# TypeLite — Fast, modern, and extensible typing test for everyone!
