const { Octokit } = require("@octokit/rest");
const logger = require("../config/logger");
require("dotenv").config();

class GithubService {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
    if (!process.env.GITHUB_USERNAME || !process.env.GITHUB_TOKEN) {
      logger.error(
        "Missing required environment variables: GITHUB_USERNAME and/or GITHUB_TOKEN"
      );
      process.exit(1);
    }
    this.username = process.env.GITHUB_USERNAME || "default-username";
  }

  // User related methods
  async getUserInfo() {
    try {
      const userResponse = await this.octokit.users.getByUsername({
        username: this.username,
      });

      return userResponse.data;
    } catch (error) {
      logger.error("Error fetching user info:", error);
      throw error;
    }
  }

  async getUserRepositories(sort = "updated", perPage = 100) {
    try {
      const reposResponse = await this.octokit.repos.listForUser({
        username: this.username,
        sort: sort,
        per_page: perPage,
      });

      return reposResponse.data;
    } catch (error) {
      logger.error("Error fetching user repositories:", error);
      throw error;
    }
  }

  async getUserFollowers() {
    try {
      const followersResponse = await this.octokit.users.listFollowersForUser({
        username: this.username,
      });

      return followersResponse.data;
    } catch (error) {
      logger.error("Error fetching user followers:", error);
      throw error;
    }
  }

  async getUserFollowing() {
    try {
      const followingResponse = await this.octokit.users.listFollowingForUser({
        username: this.username,
      });

      return followingResponse.data;
    } catch (error) {
      logger.error("Error fetching user following:", error);
      throw error;
    }
  }

  async getUserActivity(perPage = 50) {
    try {
      const eventsResponse =
        await this.octokit.activity.listPublicEventsForUser({
          username: this.username,
          per_page: perPage,
        });

      return eventsResponse.data;
    } catch (error) {
      logger.error("Error fetching user activity:", error);
      throw error;
    }
  }

  // Repository related methods
  async getRepositoryDetails(repoName) {
    try {
      const repoResponse = await this.octokit.repos.get({
        owner: this.username,
        repo: repoName,
      });

      return repoResponse.data;
    } catch (error) {
      logger.error(`Error fetching repository details for ${repoName}:`, error);
      throw error;
    }
  }

  async getRepositoryLanguages(repoName) {
    try {
      const languagesResponse = await this.octokit.repos.listLanguages({
        owner: this.username,
        repo: repoName,
      });

      return languagesResponse.data;
    } catch (error) {
      logger.error(
        `Error fetching repository languages for ${repoName}:`,
        error
      );
      throw error;
    }
  }

  async getRepositoryContributors(repoName) {
    try {
      const contributorsResponse = await this.octokit.repos.listContributors({
        owner: this.username,
        repo: repoName,
      });

      return contributorsResponse.data;
    } catch (error) {
      logger.error(
        `Error fetching repository contributors for ${repoName}:`,
        error
      );
      throw error;
    }
  }

  async getRepositoryCommits(repoName, page = 1, perPage = 20) {
    try {
      const commitsResponse = await this.octokit.repos.listCommits({
        owner: this.username,
        repo: repoName,
        per_page: perPage,
        page: page,
      });

      return commitsResponse.data;
    } catch (error) {
      logger.error(`Error fetching repository commits for ${repoName}:`, error);
      throw error;
    }
  }

  async getRepositoryBranches(repoName) {
    try {
      const branchesResponse = await this.octokit.repos.listBranches({
        owner: this.username,
        repo: repoName,
      });

      return branchesResponse.data;
    } catch (error) {
      logger.error(
        `Error fetching repository branches for ${repoName}:`,
        error
      );
      throw error;
    }
  }

  // Issues related methods
  async getRepositoryIssues(repoName, state = "all", page = 1, perPage = 20) {
    try {
      const issuesResponse = await this.octokit.issues.listForRepo({
        owner: this.username,
        repo: repoName,
        state: state,
        per_page: perPage,
        page: page,
      });

      return issuesResponse.data;
    } catch (error) {
      logger.error(`Error fetching repository issues for ${repoName}:`, error);
      throw error;
    }
  }

  async getIssueDetails(repoName, issueNumber) {
    try {
      const issueResponse = await this.octokit.issues.get({
        owner: this.username,
        repo: repoName,
        issue_number: issueNumber,
      });

      return issueResponse.data;
    } catch (error) {
      logger.error(
        `Error fetching issue #${issueNumber} for ${repoName}:`,
        error
      );
      throw error;
    }
  }

  async getIssueComments(repoName, issueNumber) {
    try {
      const commentsResponse = await this.octokit.issues.listComments({
        owner: this.username,
        repo: repoName,
        issue_number: issueNumber,
      });

      return commentsResponse.data;
    } catch (error) {
      logger.error(
        `Error fetching comments for issue #${issueNumber} in ${repoName}:`,
        error
      );
      throw error;
    }
  }

  async createIssue(repoName, issueData) {
    try {
      const { title, body, labels } = issueData;

      const issueResponse = await this.octokit.issues.create({
        owner: this.username,
        repo: repoName,
        title: title,
        body: body || "",
        labels: labels || [],
      });

      return issueResponse.data;
    } catch (error) {
      logger.error(`Error creating issue for ${repoName}:`, error);
      throw error;
    }
  }

  async updateIssue(repoName, issueNumber, updateData) {
    try {
      const { title, body, state, labels } = updateData;

      const params = {
        owner: this.username,
        repo: repoName,
        issue_number: issueNumber,
      };

      if (title !== undefined) params.title = title;
      if (body !== undefined) params.body = body;
      if (state !== undefined) params.state = state;
      if (labels !== undefined) params.labels = labels;

      const issueResponse = await this.octokit.issues.update(params);

      return issueResponse.data;
    } catch (error) {
      logger.error(
        `Error updating issue #${issueNumber} for ${repoName}:`,
        error
      );
      throw error;
    }
  }

  async createIssueComment(repoName, issueNumber, body) {
    try {
      const commentResponse = await this.octokit.issues.createComment({
        owner: this.username,
        repo: repoName,
        issue_number: issueNumber,
        body: body,
      });

      return commentResponse.data;
    } catch (error) {
      logger.error(
        `Error creating comment for issue #${issueNumber} in ${repoName}:`,
        error
      );
      throw error;
    }
  }

  // Pull requests related methods
  async getRepositoryPullRequests(
    repoName,
    state = "all",
    page = 1,
    perPage = 20
  ) {
    try {
      const pullsResponse = await this.octokit.pulls.list({
        owner: this.username,
        repo: repoName,
        state: state,
        per_page: perPage,
        page: page,
      });

      return pullsResponse.data;
    } catch (error) {
      logger.error(`Error fetching pull requests for ${repoName}:`, error);
      throw error;
    }
  }
}

module.exports = new GithubService();
