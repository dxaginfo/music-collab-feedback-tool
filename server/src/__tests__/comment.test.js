const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const Project = require('../models/project.model');
const Track = require('../models/track.model');
const Comment = require('../models/comment.model');
const jwt = require('jsonwebtoken');

describe('Comment API', () => {
  let authToken;
  let user;
  let project;
  let track;
  let comment;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/music-collab-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    // Clear the database before each test
    await User.deleteMany({});
    await Project.deleteMany({});
    await Track.deleteMany({});
    await Comment.deleteMany({});

    // Create a test user
    user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    // Create auth token
    authToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'supersecretdevkey',
      { expiresIn: '1h' }
    );

    // Create a project
    project = await Project.create({
      title: 'Test Project',
      description: 'A test project for testing',
      owner: user._id,
    });

    // Create a track
    track = await Track.create({
      title: 'Test Track',
      project: project._id,
      owner: user._id,
      versionNumber: 1,
      audioFile: {
        url: 'https://example.com/audio.mp3',
        fileId: 'test-file-id',
        fileSize: 1000,
        duration: 180,
        format: 'mp3'
      },
      waveformData: 'test-waveform-data',
      uploader: user._id
    });

    // Create a comment
    comment = await Comment.create({
      track: track._id,
      user: user._id,
      timestamp: 60,
      text: 'This is a test comment',
      type: 'general',
      status: 'open'
    });
  });

  afterAll(async () => {
    // Disconnect from test database
    await mongoose.connection.close();
  });

  describe('GET /api/tracks/:trackId/comments', () => {
    it('should get all comments for a track', async () => {
      const res = await request(app)
        .get(`/api/tracks/${track._id}/comments`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].text).toEqual('This is a test comment');
    });

    it('should return 404 if track does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/tracks/${fakeId}/comments`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/tracks/:trackId/comments', () => {
    it('should create a new comment', async () => {
      const newComment = {
        timestamp: 120,
        text: 'Another test comment',
        type: 'technical'
      };

      const res = await request(app)
        .post(`/api/tracks/${track._id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(newComment);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.text).toEqual(newComment.text);
      expect(res.body.data.type).toEqual(newComment.type);
      expect(res.body.data.timestamp).toEqual(newComment.timestamp);
      expect(res.body.data.user._id).toEqual(user._id.toString());
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidComment = {
        // Missing timestamp and text
        type: 'technical'
      };

      const res = await request(app)
        .post(`/api/tracks/${track._id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidComment);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/comments/:commentId/replies', () => {
    it('should add a reply to a comment', async () => {
      const reply = {
        text: 'This is a reply',
        track: track._id
      };

      const res = await request(app)
        .post(`/api/comments/${comment._id}/replies`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reply);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.text).toEqual(reply.text);
      expect(res.body.data.parentComment).toEqual(comment._id.toString());
      expect(res.body.data.timestamp).toEqual(comment.timestamp);
    });
  });

  describe('PUT /api/comments/:id', () => {
    it('should update a comment', async () => {
      const update = {
        text: 'Updated comment text',
        status: 'in_progress'
      };

      const res = await request(app)
        .put(`/api/comments/${comment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(update);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.text).toEqual(update.text);
      expect(res.body.data.status).toEqual(update.status);
    });

    it('should return 403 if user is not comment owner', async () => {
      // Create another user
      const anotherUser = await User.create({
        name: 'Another User',
        email: 'another@example.com',
        password: 'password123'
      });

      // Create token for the other user
      const anotherToken = jwt.sign(
        { id: anotherUser._id },
        process.env.JWT_SECRET || 'supersecretdevkey',
        { expiresIn: '1h' }
      );

      const update = {
        text: 'Trying to update someone else\'s comment'
      };

      const res = await request(app)
        .put(`/api/comments/${comment._id}`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .send(update);

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/comments/:id', () => {
    it('should delete a comment', async () => {
      const res = await request(app)
        .delete(`/api/comments/${comment._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);

      // Verify it's gone
      const findComment = await Comment.findById(comment._id);
      expect(findComment).toBeNull();
    });
  });

  describe('POST /api/comments/:id/reactions', () => {
    it('should add a reaction to a comment', async () => {
      const reaction = {
        type: 'like'
      };

      const res = await request(app)
        .post(`/api/comments/${comment._id}/reactions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reaction);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reactions).toBeInstanceOf(Array);
      expect(res.body.data.reactions.length).toEqual(1);
      expect(res.body.data.reactions[0].type).toEqual(reaction.type);
      expect(res.body.data.reactions[0].user.toString()).toEqual(user._id.toString());
    });

    it('should toggle a reaction if user already reacted with the same type', async () => {
      // First add a reaction
      await request(app)
        .post(`/api/comments/${comment._id}/reactions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'like' });

      // Then toggle it off
      const res = await request(app)
        .post(`/api/comments/${comment._id}/reactions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'like' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reactions).toBeInstanceOf(Array);
      expect(res.body.data.reactions.length).toEqual(0);
    });
  });

  describe('PUT /api/comments/:id/status', () => {
    it('should change the status of a comment', async () => {
      const statusUpdate = {
        status: 'resolved'
      };

      const res = await request(app)
        .put(`/api/comments/${comment._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(statusUpdate);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toEqual(statusUpdate.status);
    });
  });
});