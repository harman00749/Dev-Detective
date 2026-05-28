const API_ROOT = "https://api.github.com/users/";
const singleForm = document.querySelector("#single-form");
const battleForm = document.querySelector("#battle-form");
const modeButtons = document.querySelectorAll(".mode-btn");
const stateRegion = document.querySelector("#state-region");
const battleSummary = document.querySelector("#battle-summary");
const results = document.querySelector("#results");
const profileTemplate = document.querySelector("#profile-template");

let currentMode = "single";

function formatDate(isoDate) {
  const date = new Date(isoDate);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${day} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showLoading(message) {
  stateRegion.innerHTML = `
    <div class="state-card">
      <div class="spinner" aria-hidden="true"></div>
      <div>
        <strong>Loading...</strong>
        <p>${escapeHtml(message)}</p>
      </div>
    </div>
  `;
}

function showError(title, message) {
  stateRegion.innerHTML = `
    <div class="state-card">
      <div class="state-icon error" aria-hidden="true">!</div>
      <div>
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(message)}</p>
      </div>
    </div>
  `;
}

function clearState() {
  stateRegion.innerHTML = "";
}

function clearBattleSummary() {
  battleSummary.innerHTML = "";
  battleSummary.classList.add("hidden");
}

function setFormsDisabled(isDisabled) {
  document.querySelectorAll("input, button[type='submit'], .mode-btn").forEach((element) => {
    element.disabled = isDisabled;
  });
}

async function fetchJson(url, notFoundLabel) {
  const response = await fetch(url);

  if (response.status === 404) {
    throw new Error(`${notFoundLabel} not found`);
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

async function getDeveloper(username) {
  const cleanUsername = username.trim();
  const user = await fetchJson(`${API_ROOT}${encodeURIComponent(cleanUsername)}`, cleanUsername);
  const repos = await fetchJson(`${user.repos_url}?sort=updated&per_page=100`, `${cleanUsername} repos`);
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

  return {
    user,
    repos: repos.slice(0, 5),
    totalStars
  };
}

function createRepoItem(repo) {
  const item = document.createElement("li");
  const link = document.createElement("a");
  const date = document.createElement("span");

  item.className = "repo-item";

  link.className = "repo-link";
  link.href = repo.html_url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = repo.name;

  date.className = "repo-date";
  date.textContent = formatDate(repo.updated_at);

  item.append(link, date);
  return item;
}

function renderProfile(data, status = "Profile", statusClass = "") {
  const card = profileTemplate.content.firstElementChild.cloneNode(true);
  const { user, repos, totalStars } = data;
  const displayName = user.name || user.login;
  const portfolioUrl = user.blog ? normalizeUrl(user.blog) : "";

  card.querySelector(".avatar").src = user.avatar_url;
  card.querySelector(".avatar").alt = `${displayName} avatar`;
  card.querySelector(".status-pill").textContent = status;
  card.querySelector(".status-pill").classList.toggle("winner", statusClass === "winner");
  card.querySelector(".status-pill").classList.toggle("loser", statusClass === "loser");
  card.querySelector(".profile-name").textContent = displayName;
  card.querySelector(".profile-login").textContent = `@${user.login}`;
  card.querySelector(".profile-login").href = user.html_url;
  card.querySelector(".bio").textContent = user.bio || "No bio added yet.";
  card.querySelector(".joined-date").textContent = formatDate(user.created_at);
  card.querySelector(".stars-count").textContent = totalStars.toLocaleString();

  const portfolioLink = card.querySelector(".portfolio-link");

  if (portfolioUrl) {
    portfolioLink.textContent = user.blog;
    portfolioLink.href = portfolioUrl;
  } else {
    portfolioLink.textContent = "Not available";
    portfolioLink.removeAttribute("href");
  }

  const repoList = card.querySelector(".repo-list");
  card.querySelector(".repo-count").textContent = `${repos.length} shown`;

  if (repos.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "repo-item";
    emptyItem.textContent = "No public repositories found.";
    repoList.append(emptyItem);
  } else {
    repos.forEach((repo) => repoList.append(createRepoItem(repo)));
  }

  return card;
}

function normalizeUrl(url) {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `https://${url}`;
}

function renderSingleProfile(data) {
  clearBattleSummary();
  results.innerHTML = "";
  results.append(renderProfile(data));
}

function renderBattleProfiles(first, second) {
  results.innerHTML = "";

  let firstStatus = "Draw";
  let secondStatus = "Draw";
  let firstClass = "";
  let secondClass = "";

  if (first.totalStars > second.totalStars) {
    firstStatus = "Winner";
    secondStatus = "Loser";
    firstClass = "winner";
    secondClass = "loser";
  } else if (second.totalStars > first.totalStars) {
    firstStatus = "Loser";
    secondStatus = "Winner";
    firstClass = "loser";
    secondClass = "winner";
  }

  renderBattleSummary(first, second, firstStatus, secondStatus);
  results.append(renderProfile(first, firstStatus, firstClass));
  results.append(renderProfile(second, secondStatus, secondClass));
}

function renderBattleSummary(first, second, firstStatus, secondStatus) {
  const difference = Math.abs(first.totalStars - second.totalStars);

  const winnerName = firstStatus === "Winner"
    ? first.user.login
    : secondStatus === "Winner"
      ? second.user.login
      : "Both users";

  const message = firstStatus === "Draw"
    ? "It is a draw. Both users have the same total stars."
    : `${winnerName} wins by ${difference.toLocaleString()} stars.`;

  battleSummary.classList.remove("hidden");

  battleSummary.innerHTML = `
    <div class="battle-summary-card">
      <div>
        <span class="summary-label">Battle Result</span>
        <h2>${escapeHtml(message)}</h2>
      </div>

      <div class="score-board">
        <div>
          <span>${escapeHtml(first.user.login)}</span>
          <strong>${first.totalStars.toLocaleString()}</strong>
        </div>

        <div>
          <span>${escapeHtml(second.user.login)}</span>
          <strong>${second.totalStars.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  `;
}

function switchMode(mode) {
  currentMode = mode;
  clearState();
  clearBattleSummary();
  results.innerHTML = "";

  modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });

  singleForm.classList.toggle("hidden", mode !== "single");
  battleForm.classList.toggle("hidden", mode !== "battle");
}

singleForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = new FormData(singleForm).get("username");

  if (!username.trim()) {
    showError("Username required", "Please enter a GitHub username.");
    return;
  }

  results.innerHTML = "";
  clearBattleSummary();
  showLoading(`Fetching ${username.trim()}'s GitHub profile and repositories.`);
  setFormsDisabled(true);

  try {
    const data = await getDeveloper(username);
    clearState();
    renderSingleProfile(data);
  } catch (error) {
    results.innerHTML = "";
    clearBattleSummary();
    showError(
      "User Not Found",
      error.message.includes("not found")
        ? "No GitHub profile exists for that username."
        : error.message
    );
  } finally {
    setFormsDisabled(false);
  }
});

battleForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(battleForm);
  const usernameOne = formData.get("usernameOne").trim();
  const usernameTwo = formData.get("usernameTwo").trim();

  if (!usernameOne || !usernameTwo) {
    showError("Two usernames required", "Enter both GitHub usernames before starting Battle Mode.");
    return;
  }

  results.innerHTML = "";
  clearBattleSummary();
  showLoading(`Comparing ${usernameOne} and ${usernameTwo} with Promise.all().`);
  setFormsDisabled(true);

  try {
    const [first, second] = await Promise.all([
      getDeveloper(usernameOne),
      getDeveloper(usernameTwo)
    ]);

    clearState();
    renderBattleProfiles(first, second);
  } catch (error) {
    results.innerHTML = "";
    clearBattleSummary();
    showError(
      "User Not Found",
      error.message.includes("not found")
        ? "One of these GitHub usernames does not exist."
        : error.message
    );
  } finally {
    setFormsDisabled(false);
  }
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => switchMode(button.dataset.mode));
});