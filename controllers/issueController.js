const githubService = require("../services/githubService");
const logger = require("../config/logger");

// Get repository issues
exports.getRepositoryIssues = async (req, res, next) => {
  try {
    const { repoName } = req.params;
    const state = req.query.state || "all";
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 20;

    const issues = await githubService.getRepositoryIssues(
      repoName,
      state,
      page,
      perPage
    );

    const formattedIssues = issues.map((issue) => ({
      number: issue.number,
      title: issue.title,
      html_url: issue.html_url,
      state: issue.state,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      closed_at: issue.closed_at,
      body: issue.body,
      user: {
        login: issue.user.login,
        avatar_url: issue.user.avatar_url,
        html_url: issue.user.html_url,
      },
      labels: issue.labels.map((label) => ({
        name: label.name,
        color: label.color,
        description: label.description,
      })),
      comments: issue.comments,
      pull_request: issue.pull_request
        ? {
            url: issue.pull_request.html_url,
          }
        : null,
    }));

    res.json({
      repository: repoName,
      state: state,
      page: page,
      per_page: perPage,
      total_count: formattedIssues.length,
      issues: formattedIssues,
    });
  } catch (error) {
    logger.error(
      `Error in getRepositoryIssues controller for ${req.params.repoName}:`,
      error
    );
    next(error);
  }
};

// Get specific issue details
exports.getIssueDetails = async (req, res, next) => {
  try {
    const { repoName, issueNumber } = req.params;

    const issue = await githubService.getIssueDetails(
      repoName,
      parseInt(issueNumber)
    );
    const comments = await githubService.getIssueComments(
      repoName,
      parseInt(issueNumber)
    );

    const formattedIssue = {
      number: issue.number,
      title: issue.title,
      html_url: issue.html_url,
      state: issue.state,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      closed_at: issue.closed_at,
      body: issue.body,
      user: {
        login: issue.user.login,
        avatar_url: issue.user.avatar_url,
        html_url: issue.user.html_url,
      },
      labels: issue.labels.map((label) => ({
        name: label.name,
        color: label.color,
        description: label.description,
      })),
      comments_count: issue.comments,
      comments: comments.map((comment) => ({
        id: comment.id,
        user: {
          login: comment.user.login,
          avatar_url: comment.user.avatar_url,
          html_url: comment.user.html_url,
        },
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        body: comment.body,
        html_url: comment.html_url,
      })),
      pull_request: issue.pull_request
        ? {
            url: issue.pull_request.html_url,
          }
        : null,
    };

    res.json(formattedIssue);
  } catch (error) {
    logger.error(
      `Error in getIssueDetails controller for issue #${req.params.issueNumber} in ${req.params.repoName}:`,
      error
    );
    next(error);
  }
};

// Create a new issue
exports.createIssue = async (req, res, next) => {
  try {
    const { repoName } = req.params;
    const { title, body, labels } = req.body;

    // Validate request body
    if (!title) {
      return res.status(400).json({ error: "Issue title is required" });
    }

    const issue = await githubService.createIssue(repoName, {
      title,
      body,
      labels,
    });

    res.status(201).json({
      message: "Issue created successfully",
      issue_url: issue.html_url,
      issue_number: issue.number,
      title: issue.title,
      created_at: issue.created_at,
    });
  } catch (error) {
    logger.error(
      `Error in createIssue controller for ${req.params.repoName}:`,
      error
    );
    next(error);
  }
};

// Update an existing issue
exports.updateIssue = async (req, res, next) => {
  try {
    const { repoName, issueNumber } = req.params;
    const { title, body, state, labels } = req.body;

    const issue = await githubService.updateIssue(
      repoName,
      parseInt(issueNumber),
      { title, body, state, labels }
    );

    res.json({
      message: "Issue updated successfully",
      issue_url: issue.html_url,
      issue_number: issue.number,
      title: issue.title,
      state: issue.state,
      updated_at: issue.updated_at,
    });
  } catch (error) {
    logger.error(
      `Error in updateIssue controller for issue #${req.params.issueNumber} in ${req.params.repoName}:`,
      error
    );
    next(error);
  }
};

// Add a comment to an issue
exports.createIssueComment = async (req, res, next) => {
  try {
    const { repoName, issueNumber } = req.params;
    const { body } = req.body;

    // Validate request body
    if (!body) {
      return res.status(400).json({ error: "Comment body is required" });
    }

    const comment = await githubService.createIssueComment(
      repoName,
      parseInt(issueNumber),
      body
    );

    res.status(201).json({
      message: "Comment added successfully",
      comment_url: comment.html_url,
      comment_id: comment.id,
      issue_number: parseInt(issueNumber),
      created_at: comment.created_at,
    });
  } catch (error) {
    logger.error(
      `Error in createIssueComment controller for issue #${req.params.issueNumber} in ${req.params.repoName}:`,
      error
    );
    next(error);
  }
};
