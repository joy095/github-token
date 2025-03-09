const githubService = require("../services/githubService");
const logger = require("../config/logger");

// Get user profile, repositories, followers, and following
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await githubService.getUserInfo();
    const repositories = await githubService.getUserRepositories();
    const followers = await githubService.getUserFollowers();
    const following = await githubService.getUserFollowing();

    const userData = {
      user: {
        name: user.name,
        login: user.login,
        avatar_url: user.avatar_url,
        html_url: user.html_url,
        bio: user.bio,
        public_repos: user.public_repos,
        followers: user.followers,
        following: user.following,
        created_at: user.created_at,
      },
      repositories: repositories.map((repo) => ({
        name: repo.name,
        description: repo.description,
        html_url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        updated_at: repo.updated_at,
      })),
      followers: followers.map((follower) => ({
        login: follower.login,
        avatar_url: follower.avatar_url,
        html_url: follower.html_url,
      })),
      following: following.map((following) => ({
        login: following.login,
        avatar_url: following.avatar_url,
        html_url: following.html_url,
      })),
    };

    res.json(userData);
  } catch (error) {
    logger.error("Error in getUserProfile controller:", error);
    next(error);
  }
};
