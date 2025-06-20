const Project = require('../models/project.model');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    // Find projects where user is owner or a collaborator
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { 'collaborators.user': req.user.id }
      ]
    }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('collaborators.user', 'name email avatar role');

    if (!project) {
      return next(new ErrorResponse(`Project not found with id of ${req.params.id}`, 404));
    }

    // Check if user is owner or collaborator
    const isOwner = project.owner._id.toString() === req.user.id;
    const isCollaborator = project.collaborators.some(
      collab => collab.user._id.toString() === req.user.id
    );

    if (!isOwner && !isCollaborator && project.isPrivate) {
      return next(
        new ErrorResponse(`Not authorized to access this project`, 403)
      );
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
  try {
    // Add owner to project
    req.body.owner = req.user.id;

    const project = await Project.create(req.body);

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return next(
        new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if user is project owner or admin collaborator
    const isOwner = project.owner.toString() === req.user.id;
    const collaborator = project.collaborators.find(
      collab => collab.user.toString() === req.user.id
    );
    const hasAdminPermission = collaborator && 
      collaborator.permissions.includes('admin');

    if (!isOwner && !hasAdminPermission) {
      return next(
        new ErrorResponse(`Not authorized to update this project`, 403)
      );
    }

    // Don't allow owner to be changed
    if (req.body.owner && req.body.owner !== project.owner.toString()) {
      return next(
        new ErrorResponse(`Cannot change project owner`, 400)
      );
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(
        new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if user is project owner
    if (project.owner.toString() !== req.user.id) {
      return next(
        new ErrorResponse(`Not authorized to delete this project`, 403)
      );
    }

    await project.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add collaborator to project
// @route   POST /api/projects/:id/collaborators
// @access  Private
exports.addCollaborator = async (req, res, next) => {
  try {
    const { userId, role, permissions } = req.body;

    if (!userId) {
      return next(new ErrorResponse('Please provide a user ID', 400));
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(
        new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if user is project owner or admin collaborator
    const isOwner = project.owner.toString() === req.user.id;
    const collaborator = project.collaborators.find(
      collab => collab.user.toString() === req.user.id
    );
    const hasAdminPermission = collaborator && 
      collaborator.permissions.includes('admin');

    if (!isOwner && !hasAdminPermission) {
      return next(
        new ErrorResponse(`Not authorized to add collaborators to this project`, 403)
      );
    }

    // Check if user is already a collaborator
    const existingCollaborator = project.collaborators.find(
      collab => collab.user.toString() === userId
    );

    if (existingCollaborator) {
      return next(
        new ErrorResponse(`User is already a collaborator on this project`, 400)
      );
    }

    // Add new collaborator
    project.collaborators.push({
      user: userId,
      role: role || 'artist',
      permissions: permissions || ['view', 'comment'],
      addedAt: Date.now()
    });

    await project.save();

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove collaborator from project
// @route   DELETE /api/projects/:id/collaborators/:userId
// @access  Private
exports.removeCollaborator = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(
        new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if user is project owner or admin collaborator
    const isOwner = project.owner.toString() === req.user.id;
    const collaborator = project.collaborators.find(
      collab => collab.user.toString() === req.user.id
    );
    const hasAdminPermission = collaborator && 
      collaborator.permissions.includes('admin');

    if (!isOwner && !hasAdminPermission) {
      return next(
        new ErrorResponse(`Not authorized to remove collaborators from this project`, 403)
      );
    }

    // Cannot remove the owner
    if (req.params.userId === project.owner.toString()) {
      return next(
        new ErrorResponse(`Cannot remove project owner as collaborator`, 400)
      );
    }

    // Remove collaborator
    project.collaborators = project.collaborators.filter(
      collab => collab.user.toString() !== req.params.userId
    );

    await project.save();

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update collaborator permissions
// @route   PUT /api/projects/:id/collaborators/:userId
// @access  Private
exports.updateCollaborator = async (req, res, next) => {
  try {
    const { role, permissions } = req.body;
    
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(
        new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if user is project owner or admin collaborator
    const isOwner = project.owner.toString() === req.user.id;
    const userCollaborator = project.collaborators.find(
      collab => collab.user.toString() === req.user.id
    );
    const hasAdminPermission = userCollaborator && 
      userCollaborator.permissions.includes('admin');

    if (!isOwner && !hasAdminPermission) {
      return next(
        new ErrorResponse(`Not authorized to update collaborators in this project`, 403)
      );
    }

    // Cannot change owner's permissions
    if (req.params.userId === project.owner.toString()) {
      return next(
        new ErrorResponse(`Cannot modify project owner's permissions`, 400)
      );
    }

    // Find collaborator
    const collaboratorIndex = project.collaborators.findIndex(
      collab => collab.user.toString() === req.params.userId
    );

    if (collaboratorIndex === -1) {
      return next(
        new ErrorResponse(`Collaborator not found with id of ${req.params.userId}`, 404)
      );
    }

    // Update collaborator
    if (role) {
      project.collaborators[collaboratorIndex].role = role;
    }
    
    if (permissions) {
      project.collaborators[collaboratorIndex].permissions = permissions;
    }

    await project.save();

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};