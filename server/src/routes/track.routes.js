const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const trackController = require('../controllers/track.controller');
const commentRoutes = require('./comment.routes');

// Re-route into comment routes
router.use('/:trackId/comments', commentRoutes);

// All routes require authentication
router.use(authMiddleware);

// Track routes
router.route('/')
  .get(trackController.getAllTracks)
  .post(trackController.createTrack);

router.route('/:id')
  .get(trackController.getTrack)
  .put(trackController.updateTrack)
  .delete(trackController.deleteTrack);

router.route('/:id/waveform')
  .get(trackController.getTrackWaveform)
  .put(trackController.updateTrackWaveform);

router.route('/:id/upload')
  .post(trackController.uploadTrackAudio);

router.route('/:id/download')
  .get(trackController.downloadTrackAudio);

module.exports = router;