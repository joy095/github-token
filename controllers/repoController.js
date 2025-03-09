const githubService = require("../services/githubService");
const logger = require("../config/logger");

// Get repository details
exports.getRepositoryDetails = async (req, res, next) => {
  try {
    const { repoName } = req.params;

    const repo = await githubService.getRepositoryDetails(repoName);
    const languages = await githubService.getRepositoryLanguages(repoName);
    const issues = await githubService.getRepositoryIssues(repoName);
    const contributors = await githubService.getRepositoryContributors(
      repoName
    );

    const repoData = {
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
      language: repo.language,
      size: repo.size,
      stars: repo.stargazers_count,
      watchers: repo.watchers_count,
      forks: repo.forks_count,
      open_issues: repo.open_issues_count,
      default_branch: repo.default_branch,
      languages: languages,
      issues: issues.map((issue) => ({
        number: issue.number,
        title: issue.title,
        html_url: issue.html_url,
        state: issue.state,
        created_at: issue.created_at,
        comments: issue.comments,
      })),
      contributors: contributors.map((contributor) => ({
        login: contributor.login,
        contributions: contributor.contributions,
        avatar_url: contributor.avatar_url,
        html_url: contributor.html_url,
      })),
    };

    res.json(repoData);
  } catch (error) {
    logger.error(
      `Error in getRepositoryDetails controller for ${req.params.repoName}:`,
      error
    );
    next(error);
  }
};

// Get repository commits
exports.getRepositoryCommits = async (req, res, next) => {
  try {
    const { repoName } = req.params;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 20;

    const commits = await githubService.getRepositoryCommits(
      repoName,
      page,
      perPage
    );

    const formattedCommits = commits.map((commit) => ({
      sha: commit.sha,
      html_url: commit.html_url,
      message: commit.commit.message,
      author: {
        name: commit.commit.author.name,
        email: commit.commit.author.email,
        date: commit.commit.author.date,
      },
      committer: commit.commit.committer
        ? {
            name: commit.commit.committer.name,
            email: commit.commit.committer.email,
            date: commit.commit.committer.date,
          }
        : null,
      github_user: commit.author
        ? {
            login: commit.author.login,
            avatar_url: commit.author.avatar_url,
            html_url: commit.author.html_url,
          }
        : null,
    }));

    res.json({
      repository: repoName,
      page: page,
      per_page: perPage,
      commits: formattedCommits,
    });
  } catch (error) {
    logger.error(
      `Error in getRepositoryCommits controller for ${req.params.repoName}:`,
      error
    );
    next(error);
  }
};

// Get repository branches
exports.getRepositoryBranches = async (req, res, next) => {
  try {
    const { repoName } = req.params;

    const branches = await githubService.getRepositoryBranches(repoName);

    const formattedBranches = branches.map((branch) => ({
      name: branch.name,
      commit: {
        sha: branch.commit.sha,
        url: branch.commit.url,
      },
      protected: branch.protected,
    }));

    res.json({
      repository: repoName,
      total_count: formattedBranches.length,
      branches: formattedBranches,
    });
  } catch (error) {
    logger.error(
      `Error in getRepositoryBranches controller for ${req.params.repoName}:`,
      error
    );
    next(error);
  }
};

// Get repository pull requests
exports.getRepositoryPullRequests = async (req, res, next) => {
  try {
    const { repoName } = req.params;
    const state = req.query.state || "all";
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 20;

    const pulls = await githubService.getRepositoryPullRequests(
      repoName,
      state,
      page,
      perPage
    );

    const formattedPulls = pulls.map((pr) => ({
      number: pr.number,
      title: pr.title,
      html_url: pr.html_url,
      state: pr.state,
      created_at: pr.created_at,
      updated_at: pr.updated_at,
      closed_at: pr.closed_at,
      merged_at: pr.merged_at,
      user: {
        login: pr.user.login,
        avatar_url: pr.user.avatar_url,
        html_url: pr.user.html_url,
      },
      head: {
        ref: pr.head.ref,
        sha: pr.head.sha,
      },
      base: {
        ref: pr.base.ref,
        sha: pr.base.sha,
      },
      merged: pr.merged,
      mergeable: pr.mergeable,
      comments: pr.comments,
      commits: pr.commits,
      additions: pr.additions,
      deletions: pr.deletions,
      changed_files: pr.changed_files,
    }));

    res.json({
      repository: repoName,
      state: state,
      page: page,
      per_page: perPage,
      total_count: formattedPulls.length,
      pull_requests: formattedPulls,
    });
  } catch (error) {
    logger.error(
      `Error in getRepositoryPullRequests controller for ${req.params.repoName}:`,
      error
    );
    next(error);
  }
};
