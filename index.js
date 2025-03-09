const express = require("express");
const logger = require("./config/logger");
const issueRoutes = require("./routes/issueRoutes");
const repoRoutes = require("./routes/repoRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(express.json());

// Middleware to log route hits
app.use((req, res, next) => {
  logger.info(`Route hit: ${req.method} ${req.url}`);
  next();
});

// Use the issueRoutes for issue-related routes
app.use("/github", [issueRoutes, repoRoutes, userRoutes]);

// Error handling for invalid routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`GitHub API server running on port ${PORT}`);
});

module.exports = app;
