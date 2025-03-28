import React, { useState } from 'react';
import { Box, TextField, IconButton, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import styled from '@emotion/styled';

const GlassInput = styled(Box)({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(12px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '8px 16px',
  display: 'flex',
  alignItems: 'center',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
});

const ChatInput = ({ onSend, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSend = () => {
    if (!prompt.trim() || isLoading) return;
    onSend(prompt);
    setPrompt('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <GlassInput>
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder="Напишите сообщение..."
        variant="standard"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        InputProps={{
          disableUnderline: true,
          sx: {
            color: '#fff',
            fontSize: '1.1rem',
            '&::placeholder': { color: 'rgba(255,255,255,0.5)' }
          }
        }}
      />
      <IconButton
        onClick={handleSend}
        disabled={isLoading}
        sx={{
          background: 'linear-gradient(45deg, #00ff88 30%, #61dafb 90%)',
          color: '#000',
          ml: 1,
          '&:hover': { transform: 'scale(1.1)' },
          '&:disabled': { opacity: 0.5 }
        }}
      >
        {isLoading ? (
          <CircularProgress size={24} sx={{ color: '#000' }} />
        ) : (
          <SendIcon />
        )}
      </IconButton>
    </GlassInput>
  );
};

export default ChatInput;
