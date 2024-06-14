import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Box, Typography } from '@mui/material';
import config from './config'; // Import the configuration

const Login = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${config.serverUrl}/check-bm-password`, { password });
      if (response.data.success) {
        onLogin();
      } else {
        setError('Incorrect password');
      }
    } catch (error) {
      setError('Error validating password');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Container>
      <Box my={4} p={3} border={1} borderRadius={5} style={{ backgroundColor: '#ffffff', borderColor: '#000000' }}>
        <Typography variant="h4" gutterBottom>
          Enter Password
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ marginBottom: '16px', backgroundColor: '#ffffff', borderColor: '#000000' }}
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
    </Container>
  );
};

export default Login;
