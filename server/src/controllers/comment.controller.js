const Comment = require('../models/comment.model');
const Track = require('../models/track.model');
const Project = require('../models/project.model');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all comments for a track
// @route   GET /api/tracks/:trackId/comments
// @access  Private
exports.getCommentsForTrack = async (req, res, next) => {
  try {
    const { trackId } = req.params;

    // Check if track exists
    const track = await Track.findById(trackId);
    if (!track) {
      return next(new ErrorResponse(`Track not found with id of ${trackId}`, 404));
    }

    // Check if user has access to the track's project
    const project = await Project.findById(track.project);
    if (!project) {
      return next(new ErrorResponse(`Project not found for this track`, 404));
    }

    // Check if user is owner or collaborator
    const isOwner = project.owner.toString() === req.user.id;
    const isCollaborator = project.collaborators.some(
      collab => collab.user.toString() === req.user.id
    );

    if (!isOwner && !isCollaborator && project.isPrivate) {
      return next(
        new ErrorResponse(`Not authorized to access comments for this track`, 403)
      );
    }

    // Get comments that are top-level (not replies)
    const comments = await Comment.find({ 
      track: trackId,
      parentComment: null 
    }).sort({ timestamp: 1 });

    // For each comment, get its replies
    const commentsWithReplies = await Promise.all(
      comments.map(async comment => {
        const replies = await Comment.find({ parentComment: comment._id })
          .sort({ createdAt: 1 });
        
        // Convert to plain objects to allow adding the replies property
        const commentObj = comment.toObject();
        commentObj.replies = replies;
        
        return commentObj;
      })
    );

    res.status(200).json({
      success: true,
      count: commentsWithReplies.length,
      data: commentsWithReplies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a comment to a track
// @route   POST /api/tracks/:trackId/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { trackId } = req.params;
    
    // Check if track exists
    const track = await Track.findById(trackId);
    if (!track) {
      return next(new ErrorResponse(`Track not found with id of ${trackId}`, 404));
    }

    // Check if user has access to the track's project
    const project = await Project.findById(track.project);
    if (!project) {
      return next(new ErrorResponse(`Project not found for this track`, 404));
    }

    // Check if user is owner or collaborator
    const isOwner = project.owner.toString() === req.user.id;
    const isCollaborator = project.collaborators.some(
      collab => collab.user.toString() === req.user.id
    );

    if (!isOwner && !isCollaborator) {
      return next(
        new ErrorResponse(`Not authorized to add comments to this track`, 403)
      );
    }

    // Create the comment
    const comment = await Comment.create({
      ...req.body,
      user: req.user.id,
      track: trackId
    });

    // Return the created comment with user populated
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name email avatar');

    res.status(201).json({
      success: true,
      data: populatedComment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a reply to a comment
// @route   POST /api/comments/:commentId/replies
// @access  Private
exports.addReply = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    
    // Check if parent comment exists
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return next(new ErrorResponse(`Comment not found with id of ${commentId}`, 404));
    }

    // Check if user has access to the track's project
    const track = await Track.findById(parentComment.track);
    if (!track) {
      return next(new ErrorResponse(`Track not found for this comment`, 404));
    }

    const project = await Project.findById(track.project);
    if (!project) {
      return next(new ErrorResponse(`Project not found for this track`, 404));
    }

    // Check if user is owner or collaborator
    const isOwner = project.owner.toString() === req.user.id;
    const isCollaborator = project.collaborators.some(
      collab => collab.user.toString() === req.user.id
    );

    if (!isOwner && !isCollaborator) {
      return next(
        new ErrorResponse(`Not authorized to reply to comments on this track`, 403)
      );
    }

    // Create the reply comment
    const reply = await Comment.create({
      ...req.body,
      user: req.user.id,
      track: parentComment.track,
      parentComment: commentId,
      // Use the same timestamp as the parent comment
      timestamp: parentComment.timestamp
    });

    // Return the created reply with user populated
    const populatedReply = await Comment.findById(reply._id)
      .populate('user', 'name email avatar');

    res.status(201).json({
      success: true,
      data: populatedReply
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res, next) => {
  try {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404));
    }

    // Check if user is the comment author
    if (comment.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`Not authorized to update this comment`, 403));
    }

    // Update the comment
    comment = await Comment.findByIdAndUpdate(
      req.params.id, 
      { 
        text: req.body.text,
        status: req.body.status,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('user', 'name email avatar');

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404));
    }

    // Check if user is the comment author
    if (comment.user.toString() !== req.user.id) {
      // Check if user is the project owner
      const track = await Track.findById(comment.track);
      if (!track) {
        return next(new ErrorResponse(`Track not found for this comment`, 404));
      }

      const project = await Project.findById(track.project);
      if (!project) {
        return next(new ErrorResponse(`Project not found for this track`, 404));
      }

      const isProjectOwner = project.owner.toString() === req.user.id;
      
      if (!isProjectOwner) {
        return next(new ErrorResponse(`Not authorized to delete this comment`, 403));
      }
    }

    // Delete all replies to this comment if it's a parent comment
    if (!comment.parentComment) {
      await Comment.deleteMany({ parentComment: comment._id });
    }

    // Delete the comment itself
    await comment.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a reaction to a comment
// @route   POST /api/comments/:id/reactions
// @access  Private
exports.addReaction = async (req, res, next) => {
  try {
    const { type } = req.body;
    
    if (!type) {
      return next(new ErrorResponse('Please provide a reaction type', 400));
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404));
    }

    // Check if user has already reacted with this type
    const existingReaction = comment.reactions.find(
      reaction => 
        reaction.user.toString() === req.user.id && 
        reaction.type === type
    );

    if (existingReaction) {
      // Remove the existing reaction (toggle behavior)
      comment.reactions = comment.reactions.filter(
        reaction => !(
          reaction.user.toString() === req.user.id && 
          reaction.type === type
        )
      );
    } else {
      // Add the new reaction
      comment.reactions.push({
        user: req.user.id,
        type,
        createdAt: Date.now()
      });
    }

    await comment.save();

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change comment status
// @route   PUT /api/comments/:id/status
// @access  Private
exports.changeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return next(new ErrorResponse('Please provide a status', 400));
    }

    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404));
    }

    // Check if user has permission to change status
    // Only comment author, track owner, or project owner should be able to change status
    const isCommentAuthor = comment.user.toString() === req.user.id;
    
    if (!isCommentAuthor) {
      const track = await Track.findById(comment.track);
      if (!track) {
        return next(new ErrorResponse(`Track not found for this comment`, 404));
      }

      const isTrackOwner = track.owner.toString() === req.user.id;
      
      if (!isTrackOwner) {
        const project = await Project.findById(track.project);
        if (!project) {
          return next(new ErrorResponse(`Project not found for this track`, 404));
        }

        const isProjectOwner = project.owner.toString() === req.user.id;
        
        if (!isProjectOwner) {
          return next(
            new ErrorResponse(`Not authorized to change the status of this comment`, 403)
          );
        }
      }
    }

    // Update the comment status
    comment = await Comment.findByIdAndUpdate(
      req.params.id, 
      { 
        status,
        updatedAt: Date.now() 
      },
      { new: true, runValidators: true }
    ).populate('user', 'name email avatar');

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};