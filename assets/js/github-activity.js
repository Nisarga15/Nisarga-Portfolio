// GitHub Activity Feed (Public)
const GITHUB_USERNAME = 'Poorna-Chandra-D';
const GITHUB_API_BASE = 'https://api.github.com';
const CACHE_TTL = 10 * 60 * 1000;

const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  TypeScript: '#3178c6',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Go: '#00ADD8',
  Rust: '#dea584',
  C: '#555555',
  'C++': '#f34b7d',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  'C#': '#178600',
  Vue: '#41b883',
  React: '#61dafb',
  default: '#8b949e'
};

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  return Math.floor(seconds) + ' seconds ago';
}

function animateCounter(element, target) {
  const duration = 2000;
  const increment = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

function getCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // ignore cache errors
  }
}

async function fetchJson(url, cacheKey) {
  const cached = getCache(cacheKey);
  if (cached) return { data: cached, rateLimited: false };

  const response = await fetch(url);
  const data = await response.json();

  if (data && data.message && data.message.includes('rate limit')) {
    return { data, rateLimited: true };
  }

  setCache(cacheKey, data);
  return { data, rateLimited: false };
}

async function fetchUserStats() {
  try {
    const { data, rateLimited } = await fetchJson(
      `${GITHUB_API_BASE}/users/${GITHUB_USERNAME}`,
      `gh_user_${GITHUB_USERNAME}`
    );

    if (rateLimited) {
      return;
    }

    const reposValue = document.querySelector('#total-repos .stat-value');
    const followersValue = document.querySelector('#total-followers .stat-value');

    if (reposValue) {
      reposValue.setAttribute('data-target', data.public_repos);
      animateCounter(reposValue, data.public_repos);
    }
    if (followersValue) {
      followersValue.setAttribute('data-target', data.followers);
      animateCounter(followersValue, data.followers);
    }

    fetchTotalStarsAndForks();
  } catch (error) {
    console.error('Error fetching user stats:', error);
  }
}

async function fetchTotalStarsAndForks() {
  try {
    const { data: repos, rateLimited } = await fetchJson(
      `${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos?per_page=100`,
      `gh_repos_${GITHUB_USERNAME}`
    );
    if (rateLimited || !Array.isArray(repos)) return;

    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

    const starsValue = document.querySelector('#total-stars .stat-value');
    const forksValue = document.querySelector('#total-forks .stat-value');

    if (starsValue) {
      starsValue.setAttribute('data-target', totalStars);
      animateCounter(starsValue, totalStars);
    }
    if (forksValue) {
      forksValue.setAttribute('data-target', totalForks);
      animateCounter(forksValue, totalForks);
    }
  } catch (error) {
    console.error('Error fetching stars/forks:', error);
  }
}

async function renderContributionGraph() {
  const graphContainer = document.getElementById('contribution-graph');
  if (!graphContainer) return;

  try {
    // Use GitHub's official contribution chart
    const chartUrl = `https://ghchart.rshah.org/39d353/${GITHUB_USERNAME}`;
    
    graphContainer.innerHTML = `
      <div style="width: 100%; text-align: center; padding: 1rem 0; overflow-x: auto;">
        <img 
          src="${chartUrl}" 
          alt="GitHub contributions chart for ${GITHUB_USERNAME}"
          style="display: inline-block; max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2); cursor: help; transform: scale(1.2); transform-origin: center top; min-width: fit-content;"
          title="Click on any date in your GitHub profile to see contribution details"
        />
        <p style="color: #8b949e; font-size: 12px; margin-top: 1rem; margin-bottom: 0;">
          💡 Tip: Click any contribution square in your <a href="https://github.com/${GITHUB_USERNAME}?tab=contributions" target="_blank" style="color: #0d9488; text-decoration: none;">GitHub profile</a> to see details
        </p>
      </div>
    `;

  } catch (error) {
    console.error('Error rendering contribution graph:', error);
    graphContainer.innerHTML = '<p style="text-align: center; color: #8b949e; padding: 2rem;">Unable to load contribution graph</p>';
  }
}

async function fetchRecentCommits() {
  const commitsList = document.getElementById('commits-list');
  if (!commitsList) return;

  try {
    const { data: events, rateLimited } = await fetchJson(
      `${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/events/public?per_page=50`,
      `gh_events_${GITHUB_USERNAME}`
    );

    if (rateLimited || !Array.isArray(events)) {
      commitsList.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 2rem;">GitHub rate limit reached. Try again later.</p>';
      return;
    }

    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const pushEvents = events.filter(event => {
      if (event.type !== 'PushEvent') return false;
      return new Date(event.created_at).getTime() >= dayAgo;
    });
    const recentCommits = [];

    pushEvents.forEach(event => {
      const repoName = event.repo?.name?.split('/')[1] || event.repo?.name || 'repo';
      (event.payload?.commits || []).forEach(commit => {
        recentCommits.push({
          repo: repoName,
          message: commit.message,
          sha: commit.sha.substring(0, 7),
          date: event.created_at,
          url: `https://github.com/${event.repo?.name}/commit/${commit.sha}`
        });
      });
    });

    if (recentCommits.length === 0) {
      const { data: repos, rateLimited: repoRateLimited } = await fetchJson(
        `${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`,
        `gh_recent_repos_${GITHUB_USERNAME}`
      );

      if (repoRateLimited || !Array.isArray(repos)) {
        commitsList.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 2rem;">No public push events yet. Make a public commit to show activity.</p>';
        return;
      }

      const recentRepos = repos.filter(repo => new Date(repo.updated_at).getTime() >= dayAgo);
      if (recentRepos.length === 0) {
        commitsList.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 2rem;">No public activity in the last 24 hours.</p>';
        return;
      }

      commitsList.innerHTML = recentRepos.map(repo => `
        <div class="commit-item">
          <div class="commit-header">
            <div class="commit-repo"><i class="fas fa-folder"></i>${repo.name}</div>
            <div class="commit-time">Updated ${timeAgo(repo.updated_at)}</div>
          </div>
          <div class="commit-message">${repo.description || 'Recent update on this repository.'}</div>
          <div class="commit-meta">
            <span class="commit-sha">${repo.visibility || 'public'}</span>
            <a href="${repo.html_url}" target="_blank" rel="noopener" style="color: var(--accent); text-decoration: none;">
              <i class="fas fa-external-link-alt"></i> View
            </a>
          </div>
        </div>
      `).join('');
      return;
    }

    commitsList.innerHTML = recentCommits.map(commit => `
      <div class="commit-item">
        <div class="commit-header">
          <div class="commit-repo"><i class="fas fa-code-branch"></i>${commit.repo}</div>
          <div class="commit-time">${timeAgo(commit.date)}</div>
        </div>
        <div class="commit-message">${commit.message.split('\n')[0]}</div>
        <div class="commit-meta">
          <span class="commit-sha">${commit.sha}</span>
          <a href="${commit.url}" target="_blank" rel="noopener" style="color: var(--accent); text-decoration: none;">
            <i class="fas fa-external-link-alt"></i> View
          </a>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error fetching commits:', error);
    commitsList.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 2rem;">Unable to load commits</p>';
  }
}

async function fetchLanguageStats() {
  const languagesContainer = document.getElementById('languages-container');
  if (!languagesContainer) return;

  try {
    const { data: repos, rateLimited } = await fetchJson(
      `${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos?per_page=100`,
      `gh_repos_${GITHUB_USERNAME}`
    );
    if (rateLimited || !Array.isArray(repos)) {
      languagesContainer.innerHTML = '<p style="text-align: center; color: var(--muted);">GitHub rate limit reached. Try later.</p>';
      return;
    }

    const languageCounts = {};
    let total = 0;

    repos.forEach(repo => {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
        total += 1;
      }
    });

    const languages = Object.entries(languageCounts)
      .map(([name, count]) => ({
        name,
        percentage: ((count / total) * 100).toFixed(1),
        color: LANGUAGE_COLORS[name] || LANGUAGE_COLORS.default
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);

    if (languages.length === 0) {
      languagesContainer.innerHTML = '<p style="text-align: center; color: var(--muted);">No language data available</p>';
      return;
    }

    languagesContainer.innerHTML = languages.map(lang => `
      <div class="language-item">
        <div class="language-header">
          <div class="language-name">
            <span class="language-color" style="background: ${lang.color}"></span>
            ${lang.name}
          </div>
          <div class="language-percentage">${lang.percentage}%</div>
        </div>
        <div class="language-bar">
          <div class="language-progress" style="width: ${lang.percentage}%"></div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error fetching language stats:', error);
    languagesContainer.innerHTML = '<p style="text-align: center; color: var(--muted);">Unable to load language stats</p>';
  }
}

async function fetchTopRepositories() {
  const reposGrid = document.getElementById('repos-grid');
  if (!reposGrid) return;

  try {
    const { data: repos, rateLimited } = await fetchJson(
      `${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos?sort=stars&per_page=6`,
      `gh_top_${GITHUB_USERNAME}`
    );
    if (rateLimited || !Array.isArray(repos)) {
      reposGrid.innerHTML = '<p style="text-align: center; color: var(--muted); grid-column: 1/-1;">GitHub rate limit reached. Try later.</p>';
      return;
    }

    if (repos.length === 0) {
      reposGrid.innerHTML = '<p style="text-align: center; color: var(--muted); grid-column: 1/-1;">No repositories found</p>';
      return;
    }

    reposGrid.innerHTML = repos.map(repo => `
      <div class="repo-card">
        <div class="repo-header">
          <div class="repo-name">
            <i class="fas fa-folder"></i>
            <a href="${repo.html_url}" target="_blank" rel="noopener" style="color: var(--heading); text-decoration: none;">${repo.name}</a>
          </div>
          <span class="repo-visibility">${repo.private ? 'Private' : 'Public'}</span>
        </div>
        <div class="repo-description">${repo.description || 'No description provided'}</div>
        <div class="repo-stats">
          <div class="repo-stat"><i class="fas fa-star"></i>${repo.stargazers_count}</div>
          <div class="repo-stat"><i class="fas fa-code-branch"></i>${repo.forks_count}</div>
          ${repo.language ? `
            <div class="repo-language">
              <span class="repo-lang-dot" style="background: ${LANGUAGE_COLORS[repo.language] || LANGUAGE_COLORS.default}"></span>
              <span>${repo.language}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error fetching repositories:', error);
    reposGrid.innerHTML = '<p style="text-align: center; color: var(--muted); grid-column: 1/-1;">Unable to load repositories</p>';
  }
}

async function initGitHubActivity() {
  const githubSection = document.getElementById('github-activity');
  if (!githubSection) return;

  fetchUserStats();
  await renderContributionGraph();
  fetchRecentCommits();
  fetchLanguageStats();
  fetchTopRepositories();

  setInterval(fetchRecentCommits, 300000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGitHubActivity);
} else {
  initGitHubActivity();
}
