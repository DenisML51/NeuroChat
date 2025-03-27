import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, Container, Avatar, CircularProgress, Slide } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import axios from 'axios';
import { styled, keyframes } from '@mui/material/styles';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import SessionSidebar from '../components/SessionSidebar';
import AnimatedBackground from '../components/AnimatedBackground';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const GradientText = styled(Typography)({
  background: 'linear-gradient(45deg, #00ff88 0%, #61dafb 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-block',
  fontWeight: 900,
});

// GlassContainer без абсолютного позиционирования – будет растягиваться на всю ширину родительского фиксированного контейнера.
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
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const accessToken = localStorage.getItem('access_token');

  useEffect(() => {
    if (sessionId) {
      setIsLoading(true);
      axios
        .get(`http://localhost:8000/api/chat/session/${sessionId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((res) => setMessages(res.data.messages))
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [sessionId, accessToken]);

  const handleSend = async (prompt) => {
    const newUserMessage = { role: 'user', content: prompt };
    setMessages((prev) => [...prev, newUserMessage]);

    const placeholderMessage = { role: 'bot', content: 'Бот печатает...', isPlaceholder: true };
    setMessages((prev) => [...prev, placeholderMessage]);
    setIsLoading(true);

    try {
      const payload = { role: 'user', content: prompt, session_id: sessionId };
      const response = await axios.post('http://localhost:8000/api/chat/message', payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!sessionId && response.data.session_id) {
        setSessionId(response.data.session_id);
      }
      setMessages((prev) =>
        prev.map((msg) =>
          msg.isPlaceholder
            ? { role: 'bot', content: response.data.bot_content || 'Ответ не получен' }
            : msg
        )
      );
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.isPlaceholder ? { role: 'bot', content: 'Ошибка при получении ответа' } : msg
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
          <Avatar sx={{ bgcolor: 'rgba(0, 255, 136, 0.3)' }}>
            <Typography variant="body1" color="#00ff88">
              AI
            </Typography>
          </Avatar>
        </Toolbar>
      </AppBar>

      {/* Фиксированный контейнер для области контента */}
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
        {/* Сайдбар */}
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
              onSessionSelect={(id) => {
                setSessionId(id);
                setSidebarOpen(false);
              }}
            />
          </Box>
        </Slide>

        {/* Окно чата, правый край фиксирован, ширина изменяется */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            // Окно чата занимает всю ширину контейнера за вычетом области сайдбара (если открыта)
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
              ml: 'auto', // правый край зафиксирован
            }}
          >
            {isLoading && messages.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress sx={{ color: '#00ff88' }} />
              </Box>
            ) : (
              <>
                <ChatWindow messages={messages} />
                <Box sx={{ position: 'relative', mt: 2 }}>
                  <ChatInput onSend={handleSend} />
                  {isLoading && (
                    <CircularProgress
                      size={24}
                      sx={{
                        position: 'absolute',
                        right: 60,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#00ff88',
                      }}
                    />
                  )}
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
