import React, { useEffect, useState } from 'react';
import { Box, Typography, List, Avatar, IconButton, Tooltip, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { truncateString } from '../utils/truncate';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';

const GlassSidebar = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(12px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRight: '1px solid rgba(255, 255, 255, 0.2)',
  width: 320,
  height: '100%',
  padding: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const SessionItem = styled(motion.div)(({ selected, theme }) => ({
  background: selected ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 255, 255, 0.05)',
  borderRadius: 12,
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: selected ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
}));

const SessionsHeader = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  fontWeight: 'bold',
  color: '#00ff88',
}));

const SessionSidebar = ({ activeSessionId, onSessionSelect }) => {
  const [sessions, setSessions] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, sessionsRes] = await Promise.all([
          axios.get('http://localhost:8000/api/auth/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          axios.get('http://localhost:8000/api/chat/sessions', {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
        ]);

        setUserInfo(userRes.data);
        setSessions(sessionsRes.data.sessions);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [accessToken]);

  const handleNewSession = async () => {
    try {
      const { data } = await axios.post('http://localhost:8000/api/chat/session', {}, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSessions(prev => [...prev, data]);
      onSessionSelect(data.session_id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await axios.delete(`http://localhost:8000/api/chat/session/${sessionId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <GlassSidebar>
      <HeaderBox>
        <Avatar sx={{
          bgcolor: 'rgba(0, 255, 136, 0.3)',
          mr: 2,
          width: 56,
          height: 56,
          fontSize: '1.8rem'
        }}>
          {userInfo.username?.charAt(0).toUpperCase() || '?'}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ color: '#00ff88' }}>
            {userInfo.username}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {userInfo.email}
          </Typography>
        </Box>
      </HeaderBox>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <SessionsHeader variant="subtitle1">
          Мои сессии
        </SessionsHeader>
        <Tooltip title="Новая сессия">
          <IconButton
            onClick={handleNewSession}
            sx={{
              background: 'linear-gradient(45deg, #00ff88 30%, #61dafb 90%)',
              color: '#000',
              '&:hover': { transform: 'scale(1.05)' }
            }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <AnimatePresence>
          {sessions.map((sess) => (
            <SessionItem
              key={sess.session_id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              selected={sess.session_id === activeSessionId}
              onClick={() => onSessionSelect(sess.session_id)}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                  {truncateString(sess.title || sess.session_id, 24)}
                </Typography>
                <Tooltip title="Удалить сессию">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(sess.session_id);
                    }}
                    sx={{ color: 'rgba(255,50,50,0.7)' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </SessionItem>
          ))}
        </AnimatePresence>
      </List>

      <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Tooltip title="Выйти из аккаунта">
          <IconButton
            onClick={handleLogout}
            sx={{
              color: '#00ff88',
              borderRadius: '12px',
              padding: '6px 12px',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 136, 0.2)',
                transform: 'scale(1.02)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
              }
            }}
          >
            <LogoutIcon sx={{ mr: 1 }} />
            <Typography variant="body2">Выйти</Typography>
          </IconButton>
        </Tooltip>
      </Box>
    </GlassSidebar>
  );
};

export default SessionSidebar;
