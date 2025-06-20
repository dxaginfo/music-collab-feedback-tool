const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  versionNumber: {
    type: Number,
    required: true,
    default: 1
  },
  versionName: {
    type: String,
    trim: true,
    maxlength: [50, 'Version name cannot be more than 50 characters']
  },
  audioFile: {
    url: {
      type: String,
      required: [true, 'Please add an audio file URL']
    },
    fileId: {
      type: String,
      required: [true, 'File ID is required']
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required']
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required']
    },
    format: {
      type: String,
      required: [true, 'Format is required']
    },
    sampleRate: {
      type: Number
    },
    bitDepth: {
      type: Number
    }
  },
  waveformData: {
    type: String,
    required: [true, 'Waveform data is required']
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  metadata: {
    bpm: {
      type: Number
    },
    key: {
      type: String
    },
    genre: {
      type: String
    },
    instruments: [String],
    customFields: {
      type: Map,
      of: String
    }
  },
  previousVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track'
  }
});

// Virtual for comments associated with this track
TrackSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'track',
  justOne: false
});

// Virtual for getting the next version
TrackSchema.virtual('nextVersion', {
  ref: 'Track',
  localField: '_id',
  foreignField: 'previousVersion',
  justOne: true
});

// Method to find the latest version in a track's lineage
TrackSchema.methods.findLatestVersion = async function() {
  // Start with this track
  let currentTrack = this;
  let nextTrack = await mongoose.model('Track').findOne({ previousVersion: currentTrack._id });
  
  // Traverse through versions until we find the latest
  while (nextTrack) {
    currentTrack = nextTrack;
    nextTrack = await mongoose.model('Track').findOne({ previousVersion: currentTrack._id });
  }
  
  return currentTrack;
};

// Method to find all versions in a track's lineage
TrackSchema.methods.findAllVersions = async function() {
  // Find the original version (the one with no previous version)
  let originalTrack = this;
  let prevTrack = await mongoose.model('Track').findById(this.previousVersion);
  
  while (prevTrack) {
    originalTrack = prevTrack;
    prevTrack = await mongoose.model('Track').findById(originalTrack.previousVersion);
  }
  
  // Now find all versions starting from the original
  const versions = [originalTrack];
  let currentTrack = originalTrack;
  
  // Build the version chain
  let nextTrack = await mongoose.model('Track').findOne({ previousVersion: currentTrack._id });
  while (nextTrack) {
    versions.push(nextTrack);
    currentTrack = nextTrack;
    nextTrack = await mongoose.model('Track').findOne({ previousVersion: currentTrack._id });
  }
  
  return versions;
};

// Include virtuals when converting to JSON
TrackSchema.set('toJSON', { virtuals: true });
TrackSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Track', TrackSchema);