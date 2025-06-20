import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  IconButton, 
  Menu, 
  MenuItem,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Collapse
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  AccessTime as AccessTimeIcon,
  Reply as ReplyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { updateComment, deleteComment, addCommentReply } from '../../services/commentService';

const statusColors = {
  open: 'primary',
  in_progress: 'warning',
  resolved: 'success',
  wont_fix: 'error'
};

const statusLabels = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  wont_fix: 'Won\'t Fix'
};

const CommentItem = ({ 
  comment, 
  trackId, 
  waveformRef,
  onUpdateComment, 
  onDeleteComment,
  onAddReply 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedText, setEditedText] = useState(comment.text || comment.content);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  
  const currentUser = useSelector(selectCurrentUser);
  const isCommentOwner = currentUser?.id === comment.user?._id;
  const hasReplies = comment.replies && comment.replies.length > 0;
  
  const formatTimestamp = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleEditClick = () => {
    setIsEditing(true);
    handleMenuClose();
  };
  
  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
    handleMenuClose();
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedText(comment.text || comment.content);
  };
  
  const handleSaveEdit = async () => {
    try {
      const updatedComment = await updateComment(comment._id, {
        text: editedText
      });
      
      onUpdateComment(updatedComment.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };
  
  const handleConfirmDelete = async () => {
    try {
      await deleteComment(comment._id);
      onDeleteComment(comment._id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };
  
  const handleReplyClick = () => {
    setIsReplying(true);
  };
  
  const handleCancelReply = () => {
    setIsReplying(false);
    setReplyText('');
  };
  
  const handleSubmitReply = async () => {
    try {
      const reply = await addCommentReply(comment._id, {
        text: replyText,
        track: trackId
      });
      
      onAddReply(comment._id, reply.data);
      setIsReplying(false);
      setReplyText('');
      setShowReplies(true);
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };
  
  const handleTimestampClick = () => {
    if (waveformRef && waveformRef.current) {
      waveformRef.current.seekTo(comment.timestamp);
    }
  };
  
  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };
  
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={comment.user?.avatar}
              alt={comment.user?.name}
              sx={{ width: 32, height: 32, mr: 1 }}
            />
            <Typography variant="subtitle1" fontWeight="bold">
              {comment.user?.name}
            </Typography>
            <Chip 
              size="small" 
              color={statusColors[comment.status]} 
              label={statusLabels[comment.status]} 
              sx={{ ml: 1 }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              size="small" 
              startIcon={<AccessTimeIcon />}
              onClick={handleTimestampClick}
              sx={{ mr: 1 }}
            >
              {formatTimestamp(comment.timestamp)}
            </Button>
            
            {isCommentOwner && (
              <>
                <IconButton size="small" onClick={handleMenuOpen}>
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleEditClick}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} />
                    Edit
                  </MenuItem>
                  <MenuItem onClick={handleDeleteClick}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Delete
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Box>
        
        <Box sx={{ pl: 5 }}>
          {isEditing ? (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                variant="outlined"
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button 
                  variant="text" 
                  onClick={handleCancelEdit}
                  sx={{ mr: 1 }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleSaveEdit}
                >
                  Save
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {comment.text || comment.content}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </Typography>
            
            <Button
              size="small"
              startIcon={<ReplyIcon />}
              onClick={handleReplyClick}
            >
              Reply
            </Button>
          </Box>
          
          {isReplying && (
            <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid #eee' }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                variant="outlined"
                size="small"
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button 
                  variant="text" 
                  onClick={handleCancelReply}
                  sx={{ mr: 1 }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim()}
                >
                  Reply
                </Button>
              </Box>
            </Box>
          )}
          
          {hasReplies && (
            <Box sx={{ mt: 1 }}>
              <Button
                size="small"
                startIcon={showReplies ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={toggleReplies}
              >
                {showReplies ? 'Hide' : 'Show'} Replies ({comment.replies.length})
              </Button>
              
              <Collapse in={showReplies}>
                <Box sx={{ pl: 2, mt: 1, borderLeft: '2px solid #eee' }}>
                  {comment.replies.map(reply => (
                    <Box key={reply._id} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Avatar
                          src={reply.user?.avatar}
                          alt={reply.user?.name}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />
                        <Typography variant="subtitle2">
                          {reply.user?.name}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" sx={{ pl: 4 }}>
                        {reply.text || reply.content}
                      </Typography>
                      
                      <Typography variant="caption" color="text.secondary" sx={{ pl: 4, display: 'block', mt: 0.5 }}>
                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>
          )}
        </Box>
      </CardContent>
      
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this comment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default CommentItem;