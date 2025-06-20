import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Typography,
  Chip,
  Paper,
  Stack,
  Slider,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  MicNone as MicIcon,
  AddPhotoAlternate as ImageIcon,
  Link as LinkIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

const CommentForm = ({ trackId, waveformRef, onAddComment, disabled }) => {
  const [commentText, setCommentText] = useState('');
  const [commentType, setCommentType] = useState('general');
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [frequencyRange, setFrequencyRange] = useState([20, 20000]);
  const [showFrequencySelector, setShowFrequencySelector] = useState(false);

  // Listen for waveform player updates
  useEffect(() => {
    if (waveformRef && waveformRef.current) {
      const handleTimeUpdate = (time) => {
        setCurrentTimestamp(time);
      };

      const handlePlayPause = (playing) => {
        setIsPlaying(playing);
      };

      // Subscribe to waveform events
      waveformRef.current.on('timeupdate', handleTimeUpdate);
      waveformRef.current.on('play', () => handlePlayPause(true));
      waveformRef.current.on('pause', () => handlePlayPause(false));

      return () => {
        // Cleanup subscriptions
        waveformRef.current.un('timeupdate', handleTimeUpdate);
        waveformRef.current.un('play', () => handlePlayPause(true));
        waveformRef.current.un('pause', () => handlePlayPause(false));
      };
    }
  }, [waveformRef]);

  const formatTimestamp = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const commentData = {
      text: commentText,
      type: commentType,
      timestamp: currentTimestamp,
      status: 'open'
    };

    if (showFrequencySelector) {
      commentData.frequencyRange = {
        low: frequencyRange[0],
        high: frequencyRange[1]
      };
    }

    const success = await onAddComment(commentData);
    if (success) {
      setCommentText('');
      setCommentType('general');
      setShowFrequencySelector(false);
      setFrequencyRange([20, 20000]);
    }
  };

  const handlePlayPause = () => {
    if (waveformRef && waveformRef.current) {
      if (isPlaying) {
        waveformRef.current.pause();
      } else {
        waveformRef.current.play();
      }
    }
  };

  const handleFrequencyChange = (event, newValue) => {
    setFrequencyRange(newValue);
  };

  // Format frequency display
  const formatFrequency = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}kHz`;
    }
    return `${value}Hz`;
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip 
              icon={<TimeIcon />}
              label={formatTimestamp(currentTimestamp)}
              color="primary"
              variant="outlined"
            />
            <IconButton size="small" onClick={handlePlayPause}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              Current position
            </Typography>
          </Stack>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Add your feedback here..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          variant="outlined"
          disabled={disabled}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="comment-type-label">Comment Type</InputLabel>
            <Select
              labelId="comment-type-label"
              value={commentType}
              onChange={(e) => setCommentType(e.target.value)}
              label="Comment Type"
              disabled={disabled}
            >
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="technical">Technical</MenuItem>
              <MenuItem value="creative">Creative</MenuItem>
              <MenuItem value="question">Question</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Toggle frequency range selector">
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowFrequencySelector(!showFrequencySelector)}
                disabled={disabled}
              >
                Frequency
              </Button>
            </Tooltip>

            <Tooltip title="Record audio comment (coming soon)">
              <span>
                <IconButton disabled>
                  <MicIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Add image (coming soon)">
              <span>
                <IconButton disabled>
                  <ImageIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Add link (coming soon)">
              <span>
                <IconButton disabled>
                  <LinkIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Button
              variant="contained"
              type="submit"
              disabled={!commentText.trim() || disabled}
            >
              Add Comment
            </Button>
          </Box>
        </Box>

        {showFrequencySelector && (
          <Box sx={{ mt: 2 }}>
            <Typography id="frequency-range-slider" gutterBottom>
              Frequency Range: {formatFrequency(frequencyRange[0])} - {formatFrequency(frequencyRange[1])}
            </Typography>
            <Slider
              value={frequencyRange}
              onChange={handleFrequencyChange}
              valueLabelDisplay="auto"
              valueLabelFormat={formatFrequency}
              min={20}
              max={20000}
              scale={(x) => x}
              aria-labelledby="frequency-range-slider"
              disabled={disabled}
              sx={{ 
                '& .MuiSlider-valueLabel': { 
                  fontSize: '0.75rem', 
                  padding: '0.2rem 0.5rem' 
                } 
              }}
            />
          </Box>
        )}
      </form>
    </Paper>
  );
};

export default CommentForm;