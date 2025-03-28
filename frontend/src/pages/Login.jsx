import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, keyframes, styled } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const GlassCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(12px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '40px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  animation: `${fadeIn} 0.6s ease-out`,
}));

const GradientText = styled(Typography)({
  background: 'linear-gradient(45deg, #00ff88 0%, #61dafb 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-block',
  fontWeight: 900,
});

const HoverButton = styled(Button)({
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(0, 255, 136, 0.3)',
  },
});

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const data = new URLSearchParams();
      data.append('username', username);
      data.append('password', password);

      const response = await axios.post('http://localhost:8000/api/auth/login', data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      localStorage.setItem('access_token', response.data.access_token);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Ошибка при входе');
    }
  };

  return (
    <Box sx={{
      position: 'relative',
      minHeight: '100vh',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
    }}>
      <AnimatedBackground />

      <GlassCard sx={{
        width: '100%',
        maxWidth: '480px',
        position: 'relative',
        zIndex: 2,
      }}>
        <GradientText variant="h3" align="center" gutterBottom sx={{ mb: 4 }}>
          Добро пожаловать
        </GradientText>

        {errorMsg && (
          <Typography color="error" align="center" sx={{
            background: 'rgba(255, 50, 50, 0.1)',
            padding: '12px',
            borderRadius: '8px',
            mb: 2,
            animation: `${fadeIn} 0.3s ease`,
          }}>
            {errorMsg}
          </Typography>
        )}

        <TextField
          fullWidth
          label="Имя пользователя"
          variant="outlined"
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#fff',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
              '&:hover fieldset': { borderColor: '#00ff88' },
            },
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
          }}
        />

        <TextField
          fullWidth
          label="Пароль"
          type="password"
          variant="outlined"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#fff',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
              '&:hover fieldset': { borderColor: '#00ff88' },
            },
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
          }}
        />

        <HoverButton
          fullWidth
          size="large"
          onClick={handleLogin}
          sx={{
            mt: 3,
            mb: 2,
            background: 'linear-gradient(45deg, #00ff88 30%, #61dafb 90%)',
            color: '#000',
            fontWeight: 'bold',
            borderRadius: '12px',
            py: 1.5,
            fontSize: '1.1rem',
          }}
        >
          Войти
        </HoverButton>

        <Button
          fullWidth
          onClick={() => navigate('/register')}
          sx={{
            color: '#00ff88',
            '&:hover': { background: 'rgba(0, 255, 136, 0.1)' },
          }}
        >
          Нет аккаунта? Создать
        </Button>
      </GlassCard>
    </Box>
  );
};

export default Login;
