# Dev-Detective Project Prompts

# Sprint Scope
Build a client-side GitHub profile finder using HTML, CSS, and JavaScript. The app fetches GitHub user data with the Fetch API, parses JSON, renders profile details to the DOM, and handles asynchronous loading and error states.

# Implemented Requirements
- Search input for a GitHub username.
- GET request to `https://api.github.com/users/{username}`.
- Profile card rendering avatar, name, bio, join date, and portfolio URL.
- Loading UI while promises resolve.
- Clean `User Not Found` state for 404 responses.
- Second fetch using `repos_url`.
- Top 5 latest repositories rendered as links that open in a new tab.
- `formatDate()` utility that converts ISO timestamps into readable dates such as `25 Jan 2023`.
- Battle Mode with two inputs, `Promise.all()`, total star calculation, and winner/loser UI indicators.

# QA Demo Checklist
- Search a valid username such as `octocat`.
- Show the loading state immediately after submitting.
- Confirm profile details and latest repositories render.
- Search an invalid username to demonstrate the 404 fallback.
- Toggle Battle Mode and compare two users such as `octocat` and `torvalds`.
