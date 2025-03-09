const express = require("express");
const issueController = require("../controllers/issueController");

const router = express.Router();

// GET /github/{repo-name}/issues - List all issues for a repo
router.get("/:repoName/issues", issueController.getRepositoryIssues);

// GET /github/{repo-name}/issues/{issue-number} - Get a specific issue
router.get("/:repoName/issues/:issueNumber", issueController.getIssueDetails);

// POST /github/{repo-name}/issues - Create a new issue
router.post("/:repoName/issues", issueController.createIssue);

// PATCH /github/{repo-name}/issues/{issue-number} - Update an issue
router.patch("/:repoName/issues/:issueNumber", issueController.updateIssue);

// POST /github/{repo-name}/issues/{issue-number}/comments - Add a comment to an issue
router.post(
  "/:repoName/issues/:issueNumber/comments",
  issueController.createIssueComment
);

module.exports = router;
