import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { getTrackComments, addTrackComment } from '../../services/commentService';

const CommentList = ({ trackId, waveformRef }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addingComment, setAddingComment] = useState(false);
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    if (trackId) {
      fetchComments();
    }
  }, [trackId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTrackComments(trackId);
      
      // Sort comments by timestamp
      const sortedComments = response.data.sort((a, b) => a.timestamp - b.timestamp);
      setComments(sortedComments);
    } catch (err) {
      setError('Failed to load comments. Please try again later.');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (commentData) => {
    try {
      setAddingComment(true);
      setError(null);
      
      const newComment = await addTrackComment(trackId, {
        ...commentData,
        user: currentUser.id
      });
      
      // Add the new comment to the list
      setComments([...comments, newComment.data]);
      
      return true;
    } catch (err) {
      setError('Failed to add comment. Please try again.');
      console.error('Error adding comment:', err);
      return false;
    } finally {
      setAddingComment(false);
    }
  };

  const handleUpdateComment = (updatedComment) => {
    const updatedComments = comments.map(comment => 
      comment._id === updatedComment._id ? updatedComment : comment
    );
    setComments(updatedComments);
  };

  const handleDeleteComment = (commentId) => {
    setComments(comments.filter(comment => comment._id !== commentId));
  };

  const handleAddReply = (parentId, reply) => {
    const updatedComments = comments.map(comment => {
      if (comment._id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        };
      }
      return comment;
    });
    setComments(updatedComments);
  };

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Comments
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <CommentForm 
        trackId={trackId}
        waveformRef={waveformRef}
        onAddComment={handleAddComment}
        disabled={addingComment}
      />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress />
        </Box>
      ) : comments.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ my: 2, textAlign: 'center' }}>
          No comments yet. Be the first to add feedback!
        </Typography>
      ) : (
        <Box sx={{ mt: 3 }}>
          {comments.map(comment => (
            <CommentItem
              key={comment._id}
              comment={comment}
              trackId={trackId}
              waveformRef={waveformRef}
              onUpdateComment={handleUpdateComment}
              onDeleteComment={handleDeleteComment}
              onAddReply={handleAddReply}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CommentList;