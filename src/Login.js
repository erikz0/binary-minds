// import React, { useState } from 'react';
// import { TextField, Button, Box, Typography } from '@mui/material';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import config from './config';

// const Login = ({ onLogin, setIsAuthenticated }) => {
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     try {
//       const response = await axios.post(`${config.serverUrl}/check-bm-password`, {
//         password,
//       });

//       const token = response.data.token;
//       if (token) {
//         localStorage.setItem('token', token);
//         onLogin();
//         setIsAuthenticated(true)
//         // navigate('/datasets');
//         navigate('/chat');
//       } else {
//         setError('Invalid login credentials');
//       }
//     } catch (error) {
//       setError('Error logging in');
//     }
//   };

//   return (
//     <Box my={4} p={3} border={1} borderRadius={5} style={{ backgroundColor: '#ffffff', borderColor: '#000000' }}>
//       <Typography variant="h5" gutterBottom>
//         Login
//       </Typography>
//       <TextField
//         fullWidth
//         variant="outlined"
//         label="Password"
//         type="password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         style={{ marginBottom: '16px' }}
//       />
//       {error && <Typography color="error">{error}</Typography>}
//       <Button
//         variant="contained"
//         color="primary"
//         onClick={handleLogin}
//         fullWidth
//         style={{ backgroundColor: '#000000', color: '#ffffff' }}
//       >
//         Login
//       </Button>
//     </Box>
//   );
// };

// export default Login;



import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from './config';
import logo from './iced.png';

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
        navigate('/chat');
      } else {
        setError('Invalid login credentials');
      }
    } catch (error) {
      setError('Error logging in');
    }
  };

  return (
    <div className="flex flex-col gap-6 mt-16 items-center h-screen ">
      <img src={logo} alt="ICED Logo" style={{width: '50px', height: '50px' }} />
      <div className="bg-white border-2 border-[#1d4487] p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <input
          className="w-full p-2 border border-gray-300 rounded mb-4 outline-none"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          className="w-full bg-transparent border border-[#1d4487] text-[#1d4487] font-medium py-2 rounded hover:bg-[#1d4487] hover:text-white duration-300 transition-all"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;

