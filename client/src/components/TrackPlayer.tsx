import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Slider, Typography, Stack, Paper, Tooltip } from '@mui/material';
import { PlayArrow, Pause, VolumeUp, VolumeOff, Comment, CommentBank } from '@mui/icons-material';
import WaveSurfer from 'wavesurfer.js';

interface TrackPlayerProps {
  trackUrl: string;
  waveformData?: string;
  trackTitle: string;
  onTimeUpdate?: (time: number) => void;
  onAddComment?: (time: number) => void;
  comments?: Array<{
    id: string;
    timestamp: number;
    text: string;
    author: string;
  }>;
}

const TrackPlayer: React.FC<TrackPlayerProps> = ({
  trackUrl,
  waveformData,
  trackTitle,
  onTimeUpdate,
  onAddComment,
  comments = []
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize WaveSurfer
  useEffect(() => {
    if (containerRef.current && !wavesurferRef.current) {
      const wavesurfer = WaveSurfer.create({
        container: containerRef.current,
        waveColor: '#5383EC',
        progressColor: '#2250C1',
        cursorColor: '#FF5500',
        height: 100,
        responsive: true,
        barWidth: 2,
        barGap: 1,
        barRadius: 2
      });

      wavesurfer.on('ready', () => {
        wavesurferRef.current = wavesurfer;
        setDuration(wavesurfer.getDuration());
        wavesurfer.setVolume(volume / 100);
        setIsLoaded(true);
      });

      wavesurfer.on('audioprocess', () => {
        if (wavesurferRef.current) {
          const time = wavesurferRef.current.getCurrentTime();
          setCurrentTime(time);
          onTimeUpdate && onTimeUpdate(time);
        }
      });

      wavesurfer.on('play', () => setIsPlaying(true));
      wavesurfer.on('pause', () => setIsPlaying(false));
      wavesurfer.on('finish', () => setIsPlaying(false));

      // Load audio file
      wavesurfer.load(trackUrl);

      // Clean up on unmount
      return () => {
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
          wavesurferRef.current = null;
        }
      };
    }
  }, [trackUrl, onTimeUpdate, volume]);

  // Render comment markers on the waveform
  useEffect(() => {
    if (isLoaded && wavesurferRef.current && comments.length > 0) {
      // Clear existing markers
      const existingMarkers = document.querySelectorAll('.comment-marker');
      existingMarkers.forEach(marker => marker.remove());

      // Add comment markers
      comments.forEach(comment => {
        if (wavesurferRef.current) {
          const percent = comment.timestamp / duration;
          const wrapper = containerRef.current as HTMLDivElement;
          
          // Create marker element
          const marker = document.createElement('div');
          marker.className = 'comment-marker';
          marker.style.position = 'absolute';
          marker.style.left = `${percent * 100}%`;
          marker.style.top = '0';
          marker.style.height = '100%';
          marker.style.width = '2px';
          marker.style.backgroundColor = '#FF5500';
          marker.style.zIndex = '5';
          marker.setAttribute('data-comment-id', comment.id);
          
          // Add tooltip with comment title
          marker.title = `${comment.author}: ${comment.text.substring(0, 50)}${comment.text.length > 50 ? '...' : ''}`;
          
          wrapper.appendChild(marker);
        }
      });
    }
  }, [isLoaded, comments, duration]);

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.pause();
      } else {
        wavesurferRef.current.play();
      }
    }
  };

  const handleTimeChange = (_event: Event, newValue: number | number[]) => {
    const time = typeof newValue === 'number' ? newValue : newValue[0];
    if (wavesurferRef.current) {
      wavesurferRef.current.seekTo(time / duration);
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    const volumeValue = typeof newValue === 'number' ? newValue : newValue[0];
    setVolume(volumeValue);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(volumeValue / 100);
    }
    if (volumeValue === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    if (wavesurferRef.current) {
      if (isMuted) {
        wavesurferRef.current.setVolume(volume / 100);
        setIsMuted(false);
      } else {
        wavesurferRef.current.setVolume(0);
        setIsMuted(true);
      }
    }
  };

  const handleAddComment = () => {
    if (onAddComment) {
      onAddComment(currentTime);
    }
  };

  // Format time as mm:ss
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        {trackTitle}
      </Typography>
      
      <Box ref={containerRef} sx={{ my: 2 }} />
      
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
        <IconButton onClick={handlePlayPause} disabled={!isLoaded}>
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
        
        <Typography variant="body2" sx={{ minWidth: 40 }}>
          {formatTime(currentTime)}
        </Typography>
        
        <Slider
          value={currentTime}
          max={duration}
          onChange={handleTimeChange}
          disabled={!isLoaded}
          sx={{ flexGrow: 1 }}
        />
        
        <Typography variant="body2" sx={{ minWidth: 40 }}>
          {formatTime(duration)}
        </Typography>
        
        <Tooltip title="Add comment at current position">
          <IconButton onClick={handleAddComment} disabled={!isLoaded}>
            <Comment />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="View all comments">
          <IconButton>
            <CommentBank />
          </IconButton>
        </Tooltip>
        
        <IconButton onClick={handleToggleMute}>
          {isMuted ? <VolumeOff /> : <VolumeUp />}
        </IconButton>
        
        <Slider
          value={volume}
          onChange={handleVolumeChange}
          disabled={!isLoaded}
          sx={{ width: 100 }}
        />
      </Stack>
    </Paper>
  );
};

export default TrackPlayer;