import React, { useRef, useEffect } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import styled from '@emotion/styled';

const MessageBubble = styled(motion.div)(({ role }) => ({
  maxWidth: '100%',
  padding: '16px 24px',
  borderRadius: role === 'user' ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
  background: role === 'user'
    ? 'linear-gradient(45deg, #00ff88 0%, #61dafb 100%)'
    : 'rgba(255, 255, 255, 0.15)',
  color: role === 'user' ? '#000' : '#fff',
  backdropFilter: 'blur(8px)',
  marginBottom: 16,
  alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
}));

const ChatWindow = ({ messages }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  return (
    <Box ref={containerRef} sx={{
      flexGrow: 1,
      overflowY: 'auto',
      p: 2,
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'rgba(0,0,0,0.1)',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '4px',
      },
    }}>
      <AnimatePresence initial={false}>
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            role={msg.role}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: msg.role === 'user' ? 100 : -100 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{
                width: 28,
                height: 28,
                bgcolor: msg.role === 'user' ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.2)',
                mr: 1.5,
                fontSize: '0.8rem'
              }}>
                {msg.role === 'user' ? '👤' : '🤖'}
              </Avatar>
              <Typography variant="subtitle2">
                {msg.role === 'user' ? 'Вы' : 'НейроБот'}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {msg.content}
            </Typography>
          </MessageBubble>
        ))}
      </AnimatePresence>
    </Box>
  );
};

export default ChatWindow;