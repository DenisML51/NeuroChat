// ChatWindow.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Avatar, IconButton, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import styled from '@emotion/styled';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const TypingIndicator = () => (
  <Box sx={{ display: 'flex', gap: '4px', padding: '8px 0' }}>
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
        style={{
          width: '6px',
          height: '6px',
          background: '#fff',
          borderRadius: '50%'
        }}
      />
    ))}
  </Box>
);

const AnimatedText = ({ text, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    const timer = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(cursorInterval);
        setShowCursor(false);
        clearInterval(timer);
        onComplete?.();
      }
    }, 30);
    
    return () => {
      clearInterval(timer);
      clearInterval(cursorInterval);
    };
  }, [text, onComplete]);

  return (
    <Box sx={{ position: 'relative' }}>
      <Typography variant="body1" sx={{ 
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        lineHeight: '1.5',
      }}>
        {displayText}
        <motion.span
          animate={{ opacity: showCursor ? 1 : 0 }}
          style={{ marginLeft: '2px' }}
        >
          ▌
        </motion.span>
      </Typography>
    </Box>
  );
};

const MessageBubble = styled(motion.div)(({ role, istyping }) => ({
  maxWidth: 'min(75%, 800px)',
  minWidth: '120px',
  padding: istyping ? '12px 16px' : '14px 18px',
  borderRadius: role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
  background: role === 'user' 
    ? 'linear-gradient(135deg, #00FF88 0%, #00CCFF 100%)' 
    : 'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
  color: role === 'user' ? '#0A2E24' : '#FFFFFF',
  backdropFilter: 'blur(12px)',
  margin: role === 'user' ? '0 0 12px auto' : '0 auto 12px 0',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)'
  }
}));

const MessageContent = ({ msg }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  if (msg.role === 'user' || !msg.isNew) {
    return (
      <>
        <Typography variant="body1" sx={{ 
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          lineHeight: '1.5',
          fontSize: '1.225rem',
          pb: 1
        }}>
          {msg.content}
        </Typography>
        
        <Box sx={{ 
          display: 'flex',
          gap: '6px',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="caption" sx={{
            color: msg.role === 'user' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)',
            fontSize: '0.9rem',
            lineHeight: '1.2'
          }}>
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <Tooltip title={isCopied ? 'Copied!' : 'Copy'} arrow>
              <IconButton 
                onClick={handleCopy}
                sx={{ 
                  padding: '4px',
                  color: msg.role === 'user' 
                    ? isCopied ? '#000' : 'rgba(0,0,0,0.4)' 
                    : isCopied ? '#00FF88' : 'rgba(255,255,255,0.4)',
                  transition: 'color 0.2s',
                  '&:hover': { 
                    color: msg.role === 'user' ? '#000' : '#FFF'
                  }
                }}
              >
                {isCopied ? <CheckCircleOutlineIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </>
    );
  }

  return <AnimatedText text={msg.content} />;
};

const ChatWindow = ({ messages, username }) => {
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
      '&::-webkit-scrollbar': { width: '6px' },
      '&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.1)' },
      '&::-webkit-scrollbar-thumb': { 
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '3px',
      },
    }}>
      <AnimatePresence initial={false}>
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            role={msg.role}
            istyping={msg.isTyping}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: msg.role === 'user' ? 100 : -100 }}
            transition={{ duration: 0.25 }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 1,
              gap: '8px'
            }}>
              <Avatar sx={{
                width: 28,
                height: 28,
                bgcolor: msg.role === 'user' ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.2)',
                fontSize: '0.8rem',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                {msg.role === 'user' ? '👤' : '💻'}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ 
                  fontWeight: 600,
                  color: msg.role === 'user' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
                  lineHeight: '1.2'
                }}>
                  {msg.role === 'user' ? username : 'NeuroChat'}
                </Typography>
              </Box>
            </Box>
            
            {msg.isTyping ? (
              <TypingIndicator />
            ) : (
              <MessageContent msg={msg} />
            )}
          </MessageBubble>
        ))}
      </AnimatePresence>
    </Box>
  );
};

export default ChatWindow;