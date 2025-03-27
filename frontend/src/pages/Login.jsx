import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    try {
      const data = new URLSearchParams();
      data.append('username', username);
      data.append('password', password);

      const response = await axios.post('http://localhost:8000/api/auth/login', data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      localStorage.setItem('access_token', response.data.access_token);
      navigate('/chat');
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Ошибка при входе');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper elevation={6} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
          Вход
        </Typography>
        {errorMsg && <Typography color="error" align="center">{errorMsg}</Typography>}
        <TextField
          label="Имя пользователя"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Пароль"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleLogin}
          sx={{ mt: 2, mb: 1 }}
        >
          Войти
        </Button>
        <Button
          variant="text"
          fullWidth
          onClick={() => navigate('/register')}
        >
          Зарегистрироваться
        </Button>
      </Paper>
    </Box>
  );
};

export default Login;
