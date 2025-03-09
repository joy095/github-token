const express = require("express");
const repoController = require("../controllers/repoController");

const router = express.Router();

// GET /github/{repo-name} - Repository details
router.get("/:repoName", repoController.getRepositoryDetails);

// GET /github/{repo-name}/commits - Repository commits
router.get("/:repoName/commits", repoController.getRepositoryCommits);

// GET /github/{repo-name}/branches - Repository branches
router.get("/:repoName/branches", repoController.getRepositoryBranches);

module.exports = router;
