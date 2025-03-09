// app.js
const express = require('express');
const { Octokit } = require('@octokit/rest');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Initialize Octokit with GitHub token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

// Set the GitHub username (replace with your own)
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'your-username';

// GET /github - Show user data and repositories
app.get('/github', async (req, res) => {
  try {
    // Get user information
    const userResponse = await octokit.users.getByUsername({
      username: GITHUB_USERNAME
    });
    
    // Get user repositories
    const reposResponse = await octokit.repos.listForUser({
      username: GITHUB_USERNAME,
      sort: 'updated',
      per_page: 100
    });
    
    // Get followers
    const followersResponse = await octokit.users.listFollowersForUser({
      username: GITHUB_USERNAME
    });
    
    // Get following
    const followingResponse = await octokit.users.listFollowingForUser({
      username: GITHUB_USERNAME
    });
    
    // Format the response
    const userData = {
      user: {
        name: userResponse.data.name,
        login: userResponse.data.login,
        avatar_url: userResponse.data.avatar_url,
        html_url: userResponse.data.html_url,
        bio: userResponse.data.bio,
        public_repos: userResponse.data.public_repos,
        followers: userResponse.data.followers,
        following: userResponse.data.following,
        created_at: userResponse.data.created_at
      },
      repositories: reposResponse.data.map(repo => ({
        name: repo.name,
        description: repo.description,
        html_url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        updated_at: repo.updated_at
      })),
      followers: followersResponse.data.map(follower => ({
        login: follower.login,
        avatar_url: follower.avatar_url,
        html_url: follower.html_url
      })),
      following: followingResponse.data.map(following => ({
        login: following.login,
        avatar_url: following.avatar_url,
        html_url: following.html_url
      }))
    };
    
    res.json(userData);
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub data', details: error.message });
  }
});

// GET /github/{repo-name} - Show data about a specific repository
app.get('/github/:repoName', async (req, res) => {
  try {
    const repoName = req.params.repoName;
    
    // Get repository details
    const repoResponse = await octokit.repos.get({
      owner: GITHUB_USERNAME,
      repo: repoName
    });
    
    // Get repo languages
    const languagesResponse = await octokit.repos.listLanguages({
      owner: GITHUB_USERNAME,
      repo: repoName
    });
    
    // Get issues
    const issuesResponse = await octokit.issues.listForRepo({
      owner: GITHUB_USERNAME,
      repo: repoName,
      state: 'all',
      per_page: 10
    });
    
    // Get contributors
    const contributorsResponse = await octokit.repos.listContributors({
      owner: GITHUB_USERNAME,
      repo: repoName
    });
    
    // Format the response
    const repoData = {
      name: repoResponse.data.name,
      full_name: repoResponse.data.full_name,
      description: repoResponse.data.description,
      html_url: repoResponse.data.html_url,
      created_at: repoResponse.data.created_at,
      updated_at: repoResponse.data.updated_at,
      pushed_at: repoResponse.data.pushed_at,
      language: repoResponse.data.language,
      size: repoResponse.data.size,
      stars: repoResponse.data.stargazers_count,
      watchers: repoResponse.data.watchers_count,
      forks: repoResponse.data.forks_count,
      open_issues: repoResponse.data.open_issues_count,
      default_branch: repoResponse.data.default_branch,
      languages: languagesResponse.data,
      issues: issuesResponse.data.map(issue => ({
        number: issue.number,
        title: issue.title,
        html_url: issue.html_url,
        state: issue.state,
        created_at: issue.created_at,
        comments: issue.comments
      })),
      contributors: contributorsResponse.data.map(contributor => ({
        login: contributor.login,
        contributions: contributor.contributions,
        avatar_url: contributor.avatar_url,
        html_url: contributor.html_url
      }))
    };
    
    res.json(repoData);
  } catch (error) {
    console.error(`Error fetching repository data for ${req.params.repoName}:`, error);
    res.status(error.status || 500).json({ 
      error: `Failed to fetch repository data for ${req.params.repoName}`, 
      details: error.message 
    });
  }
});

// POST /github/{repo-name}/issues - Create a new issue
app.post('/github/:repoName/issues', async (req, res) => {
  try {
    const { title, body } = req.body;
    const repoName = req.params.repoName;
    
    // Validate request body
    if (!title) {
      return res.status(400).json({ error: 'Issue title is required' });
    }
    
    // Create the issue
    const issueResponse = await octokit.issues.create({
      owner: GITHUB_USERNAME,
      repo: repoName,
      title: title,
      body: body || ''
    });
    
    // Return the issue URL and data
    res.status(201).json({
      message: 'Issue created successfully',
      issue_url: issueResponse.data.html_url,
      issue_number: issueResponse.data.number,
      title: issueResponse.data.title,
      created_at: issueResponse.data.created_at
    });
  } catch (error) {
    console.error(`Error creating issue for ${req.params.repoName}:`, error);
    res.status(error.status || 500).json({ 
      error: `Failed to create issue for ${req.params.repoName}`, 
      details: error.message 
    });
  }
});

// Error handling for invalid routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`GitHub API server running on port ${PORT}`);
});

module.exports = app;