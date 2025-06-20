const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  track: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Number,
    required: [true, 'Please provide a timestamp in seconds'],
    min: 0
  },
  duration: {
    type: Number,
    min: 0,
    default: 0
  },
  text: {
    type: String,
    required: [true, 'Please add a comment'],
    trim: true,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  type: {
    type: String,
    enum: ['general', 'technical', 'creative', 'question'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['open', 'addressed', 'rejected', 'completed'],
    default: 'open'
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  attachments: [
    {
      type: {
        type: String,
        enum: ['image', 'audio', 'video', 'link'],
        required: true
      },
      url: {
        type: String,
        required: true
      },
      thumbnail: {
        type: String
      },
      metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
      }
    }
  ],
  reactions: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      type: {
        type: String,
        enum: ['like', 'dislike', 'agree', 'disagree'],
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
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
CommentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for replies to this comment
CommentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
  justOne: false
});

// Method to count replies
CommentSchema.methods.countReplies = async function() {
  return await mongoose.model('Comment').countDocuments({ parentComment: this._id });
};

// Middleware to populate user information
CommentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name avatar role'
  });
  next();
});

// Middleware to check for mentions in the comment text
CommentSchema.pre('save', async function(next) {
  // Only process if text is modified
  if (!this.isModified('text')) {
    return next();
  }
  
  // Check for mentions (@username)
  const mentionRegex = /@(\w+)/g;
  const mentions = this.text.match(mentionRegex);
  
  if (mentions && mentions.length > 0) {
    // Notify mentioned users (implementation depends on notification system)
    // This would typically be handled by an external notification service
    // Here we just log the mentions for demonstration
    console.log(`Mentions found in comment ${this._id}:`, mentions);
  }
  
  next();
});

// Include virtuals when converting to JSON
CommentSchema.set('toJSON', { virtuals: true });
CommentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Comment', CommentSchema);