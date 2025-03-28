import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, TextField, IconButton, CircularProgress, keyframes } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import styled from '@emotion/styled';
import ArrowForwardIosTwoToneIcon from '@mui/icons-material/ArrowForwardIosTwoTone';
import axios from 'axios';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const GlassCard = styled(Box)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 40px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  }
`;

const GradientText = styled(Typography)`
  background: linear-gradient(45deg, #00ff88 0%, #61dafb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
  text-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
`;

const HoverButton = styled(Button)`
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 255, 136, 0.3);
  }
`;

const FloatingInput = styled(Box)`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 20px;
  width: 100%;
  max-width: 800px;
  margin: 2rem auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.6s ease-out;
`;

const Home = () => {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await axios.get('http://localhost:8000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsAuth(true);
          setUserInfo(res.data);
        } catch (err) {
          localStorage.removeItem('access_token');
        }
      }
    };
    checkAuth();
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const userResponse = await axios.get('http://localhost:8000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const response = await axios.post(
        'http://localhost:8000/api/chat/message',
        {
          content: message,
          user_id: userResponse.data.username,
          role: 'user'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      navigate(`/chat`, {
        state: {
          newSession: response.data.session_id,
          initialMessage: message
        }
      });
    } catch (error) {
      if (error.response?.status === 422) {
        console.error('Validation errors:', error.response.data.detail);
        alert(`Ошибка валидации: ${JSON.stringify(error.response.data.detail)}`);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <Box position="relative" minHeight="100vh" overflow="hidden">
      <AnimatedBackground density={60} />
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, pt: { xs: '12vh', md: '18vh' }, px: { xs: 2, sm: 3 }, animation: `${fadeIn} 1s ease-out` }}>
        <GlassCard>
          {isAuth && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
              <HoverButton variant="contained" size="medium" onClick={() => navigate('/chat')} sx={{ borderRadius: '8px', textTransform: 'none', px: 3, py: 1 }}>
                Перейти в чат
              </HoverButton>
              <HoverButton variant="outlined" size="medium" onClick={handleLogout} sx={{ borderRadius: '8px', textTransform: 'none', px: 3, py: 1, border: '2px solid rgba(0,255,136,0.5)' }}>
                Выйти из аккаунта
              </HoverButton>
            </Box>
          )}
          <GradientText variant="h2" gutterBottom sx={{ fontWeight: 900, fontSize: { xs: '2.8rem', md: '4.5rem' }, mb: 3, textAlign: 'center' }}>
            NeuroChat
          </GradientText>
          <Typography variant="h5" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 4, textAlign: 'center', fontSize: { xs: '1.3rem', md: '1.6rem' }, fontStyle: 'italic', fontWeight: 300 }}>
            Управление Данными ДВФУ (всё ради MongoDB) :D
          </Typography>
          {isAuth ? (
            <FloatingInput>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Начните диалог с нейросетью..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  InputProps={{
                    disableUnderline: true,
                    sx: { color: '#fff', fontSize: '1.1rem', '&::placeholder': { color: 'rgba(255,255,255,0.6)' } }
                  }}
                />
                <IconButton onClick={handleSendMessage} disabled={isLoading} sx={{ background: 'linear-gradient(45deg, #00ff88 30%, #61dafb 90%)', color: '#000', '&:hover': { transform: 'scale(1.1)' }, '&:disabled': { opacity: 0.5 } }}>
                  {isLoading ? <CircularProgress size={24} sx={{ color: '#000' }} /> : <ArrowForwardIosTwoToneIcon />}
                </IconButton>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 2, textAlign: 'center' }}>
                Добро пожаловать, {userInfo.username}! Начните новый диалог
              </Typography>
            </FloatingInput>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.9)', mb: 4, fontWeight: 300 }}>
                Для начала работы войдите или зарегистрируйтесь
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                <HoverButton variant="contained" size="large" onClick={() => navigate('/login')} sx={{ background: 'linear-gradient(45deg, #00ff88 0%, #61dafb 100%)', borderRadius: '16px', px: 5, py: 1.8, fontSize: '1.2rem' }}>
                  Войти
                </HoverButton>
                <HoverButton variant="outlined" size="large" onClick={() => navigate('/register')} sx={{ border: '2px solid rgba(0, 255, 136, 0.5)', color: '#00ff88', borderRadius: '16px', px: 5, py: 1.8, fontSize: '1.2rem', '&:hover': { border: '2px solid #00ff88' } }}>
                  Регистрация
                </HoverButton>
              </Box>
            </Box>
          )}
        </GlassCard>
        {!isAuth && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { md: 'repeat(3, 1fr)' }, gap: 4, mt: 8, padding: 4 }}>
            {['🤖 ИИ Ассистент', '💾 База данных', '🚀 Технологии'].map((title, index) => (
              <Box key={index} sx={{ background: 'linear-gradient(145deg, rgba(97,218,251,0.15) 0%, rgba(0,255,136,0.15) 100%)', borderRadius: '24px', p: 4, textAlign: 'center', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 24px rgba(0,0,0,0.2)' } }}>
                <Typography variant="h5" sx={{ color: '#00ff88', mb: 2, fontWeight: 600, fontSize: '1.5rem' }}>
                  {title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                  {index === 0 && 'Продвинутый ИИ с естественным языком общения'}
                  {index === 1 && 'Надежное хранение данных в MongoDB'}
                  {index === 2 && 'Современный стек технологий и фреймворков'}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Home;
