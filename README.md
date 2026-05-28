Dev-Detective-
Dev-Detective is a client-side GitHub profile finder built with HTML, CSS, and JavaScript. It uses the official GitHub REST API to search users, render profile data, display latest repositories, and compare two developers in Battle Mode.

Features-
- Search a GitHub user by username.
- Fetch profile data from `https://api.github.com/users/{username}`.
- Display avatar, name, bio, join date, portfolio URL, and total repository stars.
- Fetch repositories from `repos_url`.
- Show the top 5 latest repositories as clickable links.
- Format ISO dates into readable dates like `25 Jan 2023`.
- Show a loading state while API requests are running.
- Show a clean `User Not Found` message for invalid usernames.
- Battle Mode compares two GitHub users with `Promise.all()`.
- Winner and loser cards are shown based on total repository stars.

Tech Stack-
- HTML
- CSS
- JavaScript
- GitHub REST API

How to Run-
Open Git CMD or Command Prompt and run:

```cmd
cd /d "%USERPROFILE%\Desktop\Dev Detective"
python -m http.server 5175
```
Then open this URL in your browser:
```txt
http://127.0.0.1:5175/index.html
```
Demo Checklist-
- Search a valid username like `octocat`.
- Show the loading state.
- Confirm profile details and latest repositories render.
- Search an invalid username to show the `User Not Found` state.
- Open Battle Mode and compare two users, for example `octocat` and `torvalds`.
  
Project Files-
- `index.html`
- `style.css`
- `script.js`
- `Prompts.md`
- `README.md`
