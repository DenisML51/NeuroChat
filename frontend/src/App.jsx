import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import ThemeProviderWrapper from './components/ThemeProvider';
import AnimatedBackground from './components/AnimatedBackground';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const isAuthenticated = localStorage.getItem('access_token');

  return (
    <ThemeProviderWrapper>
      <CssBaseline />
      <AnimatedBackground />
      <Router>
        <Routes>
          <Route path="/" element={<HomeWrapper><Home /></HomeWrapper>} />
          <Route
            path="/chat"
            element={
              <PageWrapper>
                {isAuthenticated ? <Chat /> : <Navigate to="/login" />}
              </PageWrapper>
            }
          />
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        </Routes>
      </Router>
    </ThemeProviderWrapper>
  );
}

const PageWrapper = ({ children }) => (
  <Box sx={{
    position: 'relative',
    zIndex: 1,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  }}>
    {children}
  </Box>
);

const HomeWrapper = ({ children }) => (
  <Box sx={{
    position: 'relative',
    zIndex: 1,
    minHeight: '100vh',
  }}>
    {children}
  </Box>
);

export default App;