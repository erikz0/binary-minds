import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from './config';

const Login = ({ onLogin, setIsAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${config.serverUrl}/check-bm-password`, {
        password,
      });

      const token = response.data.token;
      if (token) {
        localStorage.setItem('token', token);
        onLogin();
        setIsAuthenticated(true)
        navigate('/datasets');
      } else {
        setError('Invalid login credentials');
      }
    } catch (error) {
      setError('Error logging in');
    }
  };

  return (
    <Box my={4} p={3} border={1} borderRadius={5} style={{ backgroundColor: '#ffffff', borderColor: '#000000' }}>
      <Typography variant="h5" gutterBottom>
        Login
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: '16px' }}
      />
      {error && <Typography color="error">{error}</Typography>}
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogin}
        fullWidth
        style={{ backgroundColor: '#000000', color: '#ffffff' }}
      >
        Login
      </Button>
    </Box>
  );
};

export default Login;
