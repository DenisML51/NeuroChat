import React from 'react';
import { Box, Button, Typography, Container, keyframes } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import styled from '@emotion/styled';

// Анимации
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Стилизованные компоненты
const GlassCard = styled(Box)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const GradientText = styled(Typography)`
  background: linear-gradient(45deg, #00ff88 0%, #61dafb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
`;

const HoverButton = styled(Button)`
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 255, 136, 0.3);
  }
`;

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box position="relative" minHeight="100vh" overflow="hidden">
      <AnimatedBackground />

      <Container maxWidth="lg" sx={{
        position: 'relative',
        zIndex: 2,
        pt: { xs: '15vh', md: '20vh' },
        px: { xs: 2, sm: 3 },
        animation: `${fadeIn} 1s ease-out`
      }}>
        <GlassCard>
          <GradientText variant="h2" gutterBottom sx={{
            fontWeight: 900,
            fontSize: { xs: '2.5rem', md: '4rem' },
            mb: 3,
            textShadow: '0 4px 20px rgba(0, 255, 136, 0.3)'
          }}>
            Новое поколение чат-бота
          </GradientText>

          <Typography variant="h5" sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            mb: 4,
            fontSize: { xs: '1.2rem', md: '1.5rem' }
          }}>
            Искусственный интеллект с глубоким обучением и персонализацией
          </Typography>

          <Box sx={{
            display: 'flex',
            gap: 3,
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <HoverButton
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                background: `linear-gradient(45deg, #00ff88 0%, #61dafb 100%)`,
                borderRadius: '12px',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem'
              }}
            >
              Войти
            </HoverButton>

            <HoverButton
              variant="outlined"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                border: '2px solid rgba(0, 255, 136, 0.5)',
                color: '#00ff88',
                borderRadius: '12px',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  border: '2px solid #00ff88'
                }
              }}
            >
              Регистрация
            </HoverButton>
          </Box>
        </GlassCard>

        {/* Дополнительные элементы дизайна */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 4,
          mt: 8,
          flexWrap: 'wrap'
        }}>
          {[1, 2, 3].map((item) => (
            <Box key={item} sx={{
              background: `linear-gradient(145deg, rgba(97,218,251,0.1) 0%, rgba(0,255,136,0.1) 100%)`,
              borderRadius: '16px',
              p: 3,
              width: 280,
              textAlign: 'center',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-10px)'
              }
            }}>
              <Typography variant="h6" sx={{ color: '#00ff88', mb: 1.5 }}>
                Преимущество {item}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Уникальные возможности искусственного интеллекта нового поколения
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Home;