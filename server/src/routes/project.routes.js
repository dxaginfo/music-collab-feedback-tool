const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addCollaborator,
  removeCollaborator,
  updateCollaborator
} = require('../controllers/project.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Project routes
router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

// Collaborator routes
router.route('/:id/collaborators')
  .post(addCollaborator);

router.route('/:id/collaborators/:userId')
  .put(updateCollaborator)
  .delete(removeCollaborator);

module.exports = router;