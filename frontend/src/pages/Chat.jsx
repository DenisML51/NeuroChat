import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, Container } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import axios from 'axios';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import SessionSidebar from '../components/SessionSidebar';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const accessToken = localStorage.getItem('access_token');

  // При изменении sessionId очищаем историю и загружаем новые данные
  useEffect(() => {
    if (sessionId) {
      setMessages([]); // сброс истории для новой сессии
      axios.get(`http://localhost:8000/api/chat/session/${sessionId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => {
        setMessages(res.data.messages);
      })
      .catch(err => {
        console.error(err);
      });
    }
  }, [sessionId, accessToken]);

  // Если сессия ещё не создана — создаём её
  useEffect(() => {
    if (!sessionId) {
      axios.post('http://localhost:8000/api/chat/session', {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => {
        setSessionId(res.data.session_id);
      })
      .catch(err => {
        console.error(err);
      });
    }
  }, [sessionId, accessToken]);

  const handleSend = async (prompt) => {
    try {
      // Добавляем сообщение пользователя локально
      const userMessage = { role: 'user', content: prompt };
      setMessages(prev => [...prev, userMessage]);

      // Отправляем сообщение на сервер
      const response = await axios.post('http://localhost:8000/api/chat/message', {
        session_id: sessionId,
        role: 'user',
        content: prompt
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.data.status === 'success') {
        const botMessage = {
          role: 'bot',
          content: response.data.bot_content || 'Ответ не получен'
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // При выборе сессии из боковой панели обновляем sessionId, что приведёт к загрузке истории
  const handleSessionSelect = (newSessionId) => {
    if (newSessionId !== sessionId) {
      setSessionId(newSessionId);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={toggleSidebar}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            LLM Chat
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, display: 'flex', position: 'relative' }}>
        <SessionSidebar
          open={sidebarOpen}
          onClose={toggleSidebar}
          activeSessionId={sessionId}
          onSessionSelect={handleSessionSelect}
        />
        <Container sx={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.paper',
          boxShadow: 3,
          borderRadius: 2,
          p: 2,
          margin: 'auto',
          width: { xs: '100%', md: '70%' },
          height: '80vh',
          position: 'relative',
        }}>
          <ChatWindow messages={messages} />
          <ChatInput onSend={handleSend} />
        </Container>
      </Box>
    </Box>
  );
};

export default Chat;
