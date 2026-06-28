# TypeLite

> A modern, responsive typing test web application with user accounts, leaderboards, and premium features.

**[Live Demo](https://typelite.pulse.jo3.org/)** | **[Backup Link](https://typelite.ct.ws/)**

---

## Features

- Time-based and word-based typing tests — Choose your preferred test mode
- Real-time WPM and accuracy tracking — Instant feedback as you type
- User registration and login — No email verification required for quick signup
- Personal profile with stats and test history — Track your progress over time
- Global leaderboard — Compete with others (top 10, no guest accounts)
- Premium features — Expert difficulty, background music, and more
- Fully responsive design — Works seamlessly on desktop and mobile devices

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Backend** | PHP (Procedural, REST-like API) |
| **Database** | MySQL (with PDO) |
| **Authentication** | PHP Sessions |

---

## Project Workflow

### 1. User Registration & Login
- Users create an account with username, email, and password
- Login creates a secure session for authenticated actions
- Password hashing using PHP's `password_hash` for security

### 2. Typing Test
- Select test mode (time/word-based) and difficulty level
- Real-time frontend tracking of input, WPM, and accuracy
- Results are automatically saved to the backend upon completion

### 3. Profile & History
- View personal statistics and performance metrics
- Access test history (last 50 results with detailed breakdowns)
- Data is fetched dynamically via AJAX from PHP endpoints

### 4. Leaderboard
- Global rankings showing top 10 performers
- Filtered by test mode and duration
- Guest accounts excluded for fair competition

### 5. Premium Features
- Premium users unlock expert difficulty mode
- Access to background music during tests
- Premium status verified server-side and reflected in UI

---

## Setup Instructions

### Prerequisites
- PHP 7.4+ with MySQL support
- MySQL 5.7+
- A local development server (XAMPP, WAMP, etc.)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Digant07/TypeLite.git
cd TypeLite
```

### Step 2: Configure the Database
- Create a MySQL database: `typing_test` (or your preferred name)
- Update database credentials in `php/db-mysql.php` if using custom database name
- The database schema is auto-created on first run

### Step 3: Run Locally
1. Place the project folder in your web server's root directory (e.g., `htdocs` for XAMPP)
2. Start your PHP and MySQL services
3. Open your browser and navigate to: `http://localhost/TypeLite/`

---

## File Structure

```
TypeLite/
├── index.html              # Main typing test UI
├── profile.html            # User profile and statistics
├── leaderboard.html        # Global leaderboard page
├── php/                    # Backend API and logic
│   ├── db-mysql.php       # Database configuration
│   ├── auth.php           # Authentication logic
│   └── api/               # REST-like API endpoints
├── assets/                # Static resources
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   └── music/             # Background music for premium users
└── README.md              # This file
```

---

## Security Features

- Password Hashing — All passwords hashed using PHP's `password_hash` function
- Session-based Authentication — All user actions require a valid session
- SQL Injection Prevention — PDO prepared statements used throughout
- Input Validation — Server-side validation for all user inputs

Note: Email verification and third-party authentication (OAuth) are not currently implemented.

---

## How to Use

1. **Sign Up** — Create an account with your username and email
2. **Practice** — Start a typing test and improve your WPM
3. **Track Progress** — View your stats and history in your profile
4. **Compete** — Check the leaderboard to see how you rank
5. **Go Premium** — Unlock expert mode and music features

---

## Performance Tips

- Clear your browser cache if you experience stale content
- Use a modern browser (Chrome, Firefox, Safari, Edge) for best experience
- Ensure JavaScript is enabled for real-time typing test features

---

## Known Limitations

- Email verification is not required (users can use fake emails)
- No OAuth/SSO integration
- Guest leaderboard entries are excluded

---

## Contributing

Contributions are welcome! Feel free to:
- Report bugs and issues
- Suggest new features
- Submit pull requests

---

## License

This project is open source and available under the MIT License.

---

## Support

For issues, questions, or feedback, please open an issue on the [GitHub repository](https://github.com/Digant07/TypeLite/issues).

---

**TypeLite — Fast, modern, and extensible typing test for everyone!**
