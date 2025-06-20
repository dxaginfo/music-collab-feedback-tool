const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['artist', 'producer', 'engineer', 'manager', 'listener'],
        default: 'artist'
      },
      permissions: {
        type: [String],
        enum: ['view', 'comment', 'edit', 'admin'],
        default: ['view', 'comment']
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'review', 'completed'],
    default: 'draft'
  },
  tags: [String],
  isPrivate: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps
ProjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure owner has admin permissions
ProjectSchema.pre('save', function(next) {
  // Check if owner exists in collaborators
  const ownerCollaborator = this.collaborators.find(
    collab => collab.user.toString() === this.owner.toString()
  );
  
  // If owner is not in collaborators, add them
  if (!ownerCollaborator) {
    this.collaborators.push({
      user: this.owner,
      role: 'artist', // Default role, can be changed later
      permissions: ['view', 'comment', 'edit', 'admin'],
      addedAt: this.createdAt
    });
  } else {
    // Ensure owner has admin permissions
    if (!ownerCollaborator.permissions.includes('admin')) {
      ownerCollaborator.permissions.push('admin');
    }
  }
  
  next();
});

// Virtual for tracks associated with this project
ProjectSchema.virtual('tracks', {
  ref: 'Track',
  localField: '_id',
  foreignField: 'project',
  justOne: false
});

// Virtual for activities associated with this project
ProjectSchema.virtual('activities', {
  ref: 'Activity',
  localField: '_id',
  foreignField: 'project',
  justOne: false
});

// Include virtuals when converting to JSON
ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', ProjectSchema);