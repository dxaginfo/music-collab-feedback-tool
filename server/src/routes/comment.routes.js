const express = require('express');
const {
  getCommentsForTrack,
  addComment,
  addReply,
  updateComment,
  deleteComment,
  addReaction,
  changeStatus
} = require('../controllers/comment.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(authMiddleware);

// Routes that are nested inside track routes (api/tracks/:trackId/comments)
router.route('/')
  .get(getCommentsForTrack)
  .post(addComment);

// Routes with comment ID
router.route('/:id')
  .put(updateComment)
  .delete(deleteComment);

// Comment reply routes
router.route('/:commentId/replies')
  .post(addReply);

// Comment reaction routes
router.route('/:id/reactions')
  .post(addReaction);

// Comment status routes
router.route('/:id/status')
  .put(changeStatus);

module.exports = router;