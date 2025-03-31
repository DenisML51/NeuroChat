// Chat.js
import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, Container, Avatar, CircularProgress, Slide } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import SessionSidebar from '../components/SessionSidebar';
import AnimatedBackground from '../components/AnimatedBackground';
import { useLocation, useNavigate } from 'react-router-dom';

const GradientText = styled(Typography)({
  background: 'linear-gradient(45deg, #00ff88 0%, #61dafb 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-block',
  fontWeight: 900,
});

const GlassContainer = styled(Container)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(12px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  padding: '32px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'width 0.3s ease',
}));

const Chat = () => {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const accessToken = localStorage.getItem('access_token');
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.newSession) {
      setSessionId(location.state.newSession);
      if (location.state.initialMessage) {
        setMessages([{ 
          role: 'user', 
          content: location.state.initialMessage,
          isNew: false
        }]);
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (accessToken) {
      axios
        .get('http://localhost:8000/api/auth/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((res) => setUserInfo(res.data))
        .catch((err) => console.error(err));
    }
  }, [accessToken]);

  useEffect(() => {
    if (sessionId) {
      setIsLoading(true);
      axios
        .get(`http://localhost:8000/api/chat/session/${sessionId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((res) => {
          const historicMessages = res.data.messages.map(msg => ({
            ...msg,
            isNew: false
          }));
          setMessages(historicMessages);
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [sessionId, accessToken]);

  const handleSend = async (prompt) => {
    const newUserMessage = { 
      role: 'user', 
      content: prompt,
      isNew: false,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    setMessages((prev) => [...prev, newUserMessage]);
  
    const typingMessage = { 
      role: 'bot', 
      content: '', 
      isTyping: true,
      isNew: false,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, typingMessage]);
    setIsLoading(true);
  
    try {
      const payload = { role: 'user', content: prompt, session_id: sessionId };
      const response = await axios.post('http://localhost:8000/api/chat/message', payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      setMessages((prev) =>
        prev.map(msg => 
          msg.isTyping 
            ? { 
                ...msg, 
                role: 'bot', 
                content: response.data.bot_content || 'Ответ не получен', 
                isTyping: false,
                isNew: true,
                timestamp: new Date().toISOString()
              }
            : msg
        )
      );
  
      if (!sessionId && response.data.session_id) {
        setSessionId(response.data.session_id);
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      setMessages((prev) =>
        prev.map(msg =>
          msg.isTyping 
            ? { 
                role: 'bot', 
                content: 'Ошибка при получении ответа', 
                isTyping: false,
                isNew: true,
                timestamp: new Date().toISOString()
              } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <AnimatedBackground />

      <AppBar
        position="static"
        sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <MenuIcon sx={{ color: '#00ff88' }} />
          </IconButton>
          <GradientText variant="h6" sx={{ flexGrow: 1 }}>
            NeuroChat
          </GradientText>
          <IconButton onClick={() => navigate('/')}>
            <Avatar sx={{ bgcolor: 'rgba(0, 255, 136, 0.3)' }}>
              <Typography variant="body1" color="#00ff88">
                AI
              </Typography>
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          position: 'absolute',
          top: '90px',
          bottom: '20px',
          left: '20px',
          right: '20px',
          overflow: 'hidden',
        }}
      >
        <Slide direction="right" in={sidebarOpen} mountOnEnter unmountOnExit>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: '320px',
              zIndex: 1200,
            }}
          >
            <SessionSidebar
              activeSessionId={sessionId}
              onSessionSelect={(id) => setSessionId(id)}
            />
          </Box>
        </Slide>

        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: sidebarOpen ? 'calc(100% - 340px)' : '100%',
            transition: 'width 0.3s ease',
            overflow: 'hidden',
          }}
        >
          <GlassContainer
            maxWidth="xl"
            sx={{
              height: '100%',
              width: '100%',
              ml: 'auto',
            }}
          >
            {isLoading && messages.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress sx={{ color: '#00ff88' }} />
              </Box>
            ) : (
              <>
                <ChatWindow messages={messages} username={userInfo.username || 'User'} />
                <Box sx={{ position: 'relative', mt: 2 }}>
                  <ChatInput onSend={handleSend} isLoading={isLoading} />
                </Box>
              </>
            )}
          </GlassContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;