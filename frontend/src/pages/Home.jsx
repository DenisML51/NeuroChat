import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Typography, Container, TextField, IconButton, 
  CircularProgress, keyframes, useMediaQuery, Tooltip, Zoom 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import styled from '@emotion/styled';
import ArrowForwardIosTwoToneIcon from '@mui/icons-material/ArrowForwardIosTwoTone';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { useTheme } from '@mui/material/styles';

// Анимации
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const cardHover = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0); }
`;

// Стилизованные компоненты
const GlassCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(24px)',
  borderRadius: '32px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: theme.spacing(4),
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.3)'
  },
}));

const GradientText = styled(Typography)({
  background: 'linear-gradient(45deg, #00ff88 0%, #61dafb 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: '0 4px 20px rgba(0, 255, 136, 0.3)',
});

const FeatureCard = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(145deg, rgba(97,218,251,0.12) 0%, rgba(0,255,136,0.12) 100%)',
  borderRadius: '24px',
  padding: theme.spacing(4),
  textAlign: 'center',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.25)',
    '&::before': {
      opacity: 0.1,
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 50% 0%, rgba(0,255,136,0.3) 0%, transparent 70%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
}));

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [quickQuestions] = useState([
    'Как мне найти информацию о поступлении?',
    'Покажи мои последние запросы',
    'Какие документы нужны для общежития?'
  ]);

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
        { headers: { Authorization: `Bearer ${token}` } }
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
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setMessage(question);
  };

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'Доброй ночи';
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  return (
    <Box position="relative" minHeight="100vh" overflow="hidden">
      <Helmet>
        <title>NeuroChat - ИИ помощник ДВФУ</title>
      </Helmet>
      
      <AnimatedBackground density={isMobile ? 40 : 60} />
      
      <Container maxWidth="lg" sx={{ 
        position: 'relative', 
        zIndex: 2, 
        pt: { xs: 8, md: 12 }, 
        px: { xs: 2, sm: 3 },
        animation: `${fadeIn} 0.8s ease-out`
      }}>
        <GlassCard>
          {/* Шапка с управлением */}
          {isAuth && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 2, 
              mb: 4,
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  color: '#fff'
                }}>
                  {userInfo.username?.[0]?.toUpperCase()}
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {getGreetingTime()},
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                    @{userInfo.username}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/chat')}
                  sx={{ 
                    borderRadius: '12px',
                    textTransform: 'none',
                    px: 4,
                    py: 1,
                    background: 'linear-gradient(45deg, #00ff88 30%, #61dafb 90%)',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,255,136,0.3)'
                    }
                  }}
                >
                  Мои диалоги
                </Button>
                <Tooltip title="Выйти из системы" TransitionComponent={Zoom}>
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      localStorage.removeItem('access_token');
                      navigate('/login');
                    }}
                    sx={{ 
                      borderRadius: '12px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      color: 'rgba(255,255,255,0.8)',
                      '&:hover': {
                        borderColor: theme.palette.error.main,
                        color: theme.palette.error.main
                      }
                    }}
                  >
                    Выход
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          )}

          {/* Основной контент */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <GradientText variant="h1" sx={{ 
              fontWeight: 900, 
              fontSize: { xs: '2.8rem', md: '4rem' },
              lineHeight: 1.2,
              mb: 3
            }}>
              NeuroChat
            </GradientText>
            <Typography variant="h5" sx={{ 
              color: 'rgba(255,255,255,0.85)', 
              maxWidth: 800,
              mx: 'auto',
              fontSize: { xs: '1.2rem', md: '1.4rem' },
              fontWeight: 300
            }}>
              AI LLM Чат Бот (все ради MongoDB :D)
            </Typography>
          </Box>

          {isAuth ? (
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              <Box sx={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '20px',
                p: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                  <TextField
                    fullWidth
                    variant="filled"
                    placeholder="Задайте вопрос ИИ-ассистенту..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    InputProps={{
                      disableUnderline: true,
                      sx: { 
                        color: '#fff',
                        borderRadius: '14px',
                        background: 'rgba(255,255,255,0.05)',
                        '& .MuiFilledInput-input': {
                          py: 2,
                          px: 3
                        },
                        '&::placeholder': { 
                          color: 'rgba(255,255,255,0.6)',
                          opacity: 1
                        }
                      }
                    }}
                  />
                  <IconButton 
                    onClick={handleSendMessage} 
                    disabled={isLoading}
                    sx={{ 
                      flexShrink: 0,
                      background: 'linear-gradient(45deg, #00ff88 30%, #61dafb 90%)',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 8px 16px rgba(0,255,136,0.3)'
                      },
                      '&:disabled': {
                        opacity: 0.7
                      }
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} sx={{ color: '#000' }} />
                    ) : (
                      <ArrowForwardIosTwoToneIcon sx={{ color: '#000' }} />
                    )}
                  </IconButton>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      onClick={() => handleQuickQuestion(question)}
                      sx={{
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'rgba(255,255,255,0.8)',
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          color: theme.palette.primary.main
                        }
                      }}
                    >
                      {question}
                    </Button>
                  ))}
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                gap: 3, 
                justifyContent: 'center',
                flexWrap: 'wrap',
                mt: 4
              }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                  sx={{
                    px: 6,
                    py: 1.5,
                    borderRadius: '14px',
                    fontSize: '1.1rem',
                    background: 'linear-gradient(45deg, #00ff88 0%, #61dafb 100%)',
                    '&:hover': {
                      boxShadow: '0 12px 24px rgba(0,255,136,0.3)'
                    }
                  }}
                >
                  Начать работу
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/register')}
                  sx={{
                    px: 6,
                    py: 1.5,
                    borderRadius: '14px',
                    fontSize: '1.1rem',
                    border: '2px solid rgba(0,255,136,0.5)',
                    color: '#00ff88',
                    '&:hover': {
                      borderColor: '#00ff88',
                      background: 'rgba(0,255,136,0.05)'
                    }
                  }}
                >
                  Регистрация
                </Button>
              </Box>
            </Box>
          )}
        </GlassCard>

        {/* Блок с фичами */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
          gap: 4, 
          mt: 8,
          mb: 4
        }}>
          {[
            { 
              title: 'ИИ Ассистент', 
              content: 'LLM модель для ответов на сообщения пользователя',
              icon: '✨'
            },
            { 
              title: 'База данных', 
              content: 'Интеграция с MongoDB для надежного хранения данных',
              icon: '🔒'
            },
            { 
              title: 'Технологии', 
              content: 'Современный стек: React, FastAPI, PyTorch',
              icon: '💡'
            }
          ].map((feature, index) => (
            <FeatureCard key={index}>
              <Typography variant="h5" sx={{ 
                color: theme.palette.primary.main,
                mb: 2,
                fontWeight: 600,
                fontSize: '1.4rem'
              }}>
                {feature.icon} {feature.title}
              </Typography>
              <Typography variant="body1" sx={{ 
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.6,
                fontSize: '1rem'
              }}>
                {feature.content}
              </Typography>
            </FeatureCard>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Home;