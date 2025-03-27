import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:8000/api/auth/register', {
        username,
        email,
        password
      });
      navigate('/login');
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Ошибка при регистрации');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ff9a9e, #fad0c4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper elevation={6} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
          Регистрация
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
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          onClick={handleRegister}
          sx={{ mt: 2, mb: 1 }}
        >
          Зарегистрироваться
        </Button>
        <Button
          variant="text"
          fullWidth
          onClick={() => navigate('/login')}
        >
          Войти
        </Button>
      </Paper>
    </Box>
  );
};

export default Register;
