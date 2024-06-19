import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Container, Box, Typography, Grid, List, ListItem, ListItemText } from '@mui/material';
import Papa from 'papaparse';
import { useAuth } from './AuthContext';
import Login from './Login';
import DatasetMenu from './DatasetMenu';
import config from './config';

const ChatPage = ({ dataset, metadata, graphCode, setGraphCode, setSummary, summary, messages, setMessages, input, setInput }) => {
  const graphContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (graphCode && dataset && graphContainerRef.current) {
      graphContainerRef.current.innerHTML = '<canvas id="graph-container"></canvas>';

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.text = `
        (function() {
          const ctx = document.getElementById('graph-container').getContext('2d');
          const dataset = ${JSON.stringify(dataset)};
          ${graphCode}
        })();
      `;
      graphContainerRef.current.appendChild(script);
    }
  }, [graphCode, dataset]);

  const handleSendMessage = async () => {
    if (input.trim() === '' || !dataset) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const response = await axios.post(`${config.serverUrl}/bm-chat`, {
        message: input,
        metadata: metadata
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.graphCode) {
        setGraphCode(response.data.graphCode);
        const botMessage = { text: 'Graph Generated!', sender: 'bot', color: '#1F4F91' };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setSummary(response.data.summary);
      } else {
        const botMessage = { text: response.data.reply, sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }
    } catch (error) {
      console.error('Error fetching ChatGPT response:', error);
    }

    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleDownload = () => {
    const canvas = document.getElementById('graph-container');
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'graph.png';
    link.click();
  };

  return (
    <Container maxWidth={false} style={{ height: '95vh' }}>
      <Button onClick={() => navigate('/datasets')} style={{ margin: '10px' }}>Back to Datasets</Button>
      <Grid container spacing={2} style={{ height: '100%' }}>
        <Grid item xs={3} style={{ height: '100%' }}>
          <Box my={4} p={3} border={1} borderRadius={5} style={{ height: 'calc(100% - 100px)', overflow: 'auto', backgroundColor: '#ffffff', borderColor: '#000000' }}>
            <Typography variant="h5" gutterBottom>
              Dataset Metadata
            </Typography>
            <List>
              {metadata.map((field, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={field.name}
                    secondary={`Type: ${field.type}, Min: ${field.min}, Max: ${field.max}, Avg: ${field.avg}, Count: ${field.count}, Unique Values: ${field.uniqueValues}${field.potentialValues ? `, Potential Values: ${field.potentialValues.join(', ')}` : ''}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Grid>
        <Grid item xs={4} style={{ height: '100%' }}>
          <Box my={4} p={3} border={1} borderRadius={5} style={{ height: 'calc(100% - 150px)', overflow: 'auto', backgroundColor: '#ffffff', borderColor: '#000000' }}>
            <Typography variant="h4" gutterBottom>
              Pooled Dataset for Women Only
            </Typography>
            <Box my={2} p={2} border={1} borderRadius={5} style={{ height: 'calc(100% - 250px)', overflow: 'auto', backgroundColor: '#ffffff', borderColor: '#000000' }}>
              {messages.map((msg, index) => (
                <Typography key={index} align={msg.sender === 'user' ? 'right' : 'left'} style={msg.color ? { color: msg.color } : {}}>
                  {msg.text}
                </Typography>
              ))}
            </Box>
            <TextField
              fullWidth
              variant="outlined"
              label="Type your message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{ marginBottom: '16px', backgroundColor: '#ffffff', borderColor: '#000000' }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendMessage}
              fullWidth
              style={{ backgroundColor: '#000000', color: '#ffffff' }}
            >
              Send
            </Button>
          </Box>
        </Grid>
        <Grid item xs={5} style={{ height: '100%' }}>
          <Box my={4} p={3} border={1} borderRadius={5} ref={graphContainerRef} style={{ height: 'calc(100% - 350px)', overflow: 'auto', backgroundColor: '#ffffff', borderColor: '#000000' }}>
            <Typography variant="h5">Graph will be displayed here:</Typography>
            <canvas id="graph-container"></canvas>
          </Box>
          <Box mt={2}>
            <Typography variant="h6">Summary</Typography>
            <Typography>{summary}</Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleDownload}
              style={{ marginTop: '16px' }}
            >
              Download as PNG
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

const App = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [graphCode, setGraphCode] = useState('');
  const [dataset, setDataset] = useState(null);
  const [summary, setSummary] = useState('');
  const [metadata, setMetadata] = useState([]);
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Checking token...');
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${config.serverUrl}/check-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(() => {
        setIsAuthenticated(true);
      }).catch((error) => {
        console.error('Token validation failed:', error);
        localStorage.removeItem('token');
        navigate('/login');
      });
    } else {
      navigate('/login');
    }
  }, [setIsAuthenticated, navigate]);

  const fetchDataset = async (datasetName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.serverUrl}/data/${datasetName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const text = response.data;
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          const normalizedData = normalizeData(results.data);
          setDataset(normalizedData);
          setMetadata(generateMetadata(normalizedData));
        },
      });
    } catch (error) {
      console.error('Error loading CSV file:', error);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/datasets');
  };

  const normalizeData = (data) => {
    const charMap = {
      '%': 'percent',
      '&': 'and',
      '<': 'less_than',
      '>': 'greater_than',
      '#': 'number',
      '$': 'dollar',
      '@': 'at',
      '!': 'exclamation',
      '^': 'caret',
      '*': 'asterisk',
      '(': 'left_parenthesis',
      ')': 'right_parenthesis',
      '+': 'plus',
      '=': 'equals',
      '{': 'left_curly_brace',
      '}': 'right_curly_brace',
      '[': 'left_square_bracket',
      ']': 'right_square_bracket',
      '|': 'pipe',
      '\\': 'backslash',
      ':': 'colon',
      ';': 'semicolon',
      '"': 'double_quote',
      "'": 'single_quote',
      ',': 'comma',
      '.': 'dot',
      '?': 'question_mark',
      '/': 'slash'
    };

    const normalizeKey = (key) => {
      return key.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, (char) => {
        return charMap[char] || '_';
      }).replace(/^[0-9]/, (match) => {
        return '_' + match;
      });
    };

    const normalizedData = data.map(row => {
      const normalizedRow = {};
      for (let key in row) {
        if (row.hasOwnProperty(key)) {
          const normalizedKey = normalizeKey(key);
          if (typeof row[key] === 'string') {
            normalizedRow[normalizedKey] = row[key].trim().toLowerCase();
          } else {
            normalizedRow[normalizedKey] = row[key];
          }
        }
      }
      return normalizedRow;
    });

    return normalizedData;
  };

  const generateMetadata = (data) => {
    const columns = Object.keys(data[0]).map(key => {
      const columnData = data.map(row => row[key]);
      const numericData = columnData.filter(value => typeof value === 'number');
      const min = numericData.length > 0 ? Math.min(...numericData) : null;
      const max = numericData.length > 0 ? Math.max(...numericData) : null;
      const avg = numericData.length > 0 ? (numericData.reduce((acc, val) => acc + val, 0) / numericData.length) : null;
      const uniqueValues = [...new Set(columnData)];
      const potentialValues = (typeof data[0][key] === 'string' && uniqueValues.length <= 20) ? uniqueValues : null;
      return {
        name: key,
        type: typeof data[0][key],
        min: min,
        max: max,
        avg: avg,
        count: columnData.length,
        uniqueValues: uniqueValues.length,
        potentialValues: potentialValues
      };
    });
    return columns;
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={handleLogin} setIsAuthenticated/>} />
      <Route path="/datasets" element={
        isAuthenticated ? (
          <DatasetMenu onSelectDataset={(datasetName) => {
            fetchDataset(datasetName);
            navigate('/chat');
          }} />
        ) : (
          <Navigate to="/login" />
        )
      } />
      <Route path="/chat" element={
        isAuthenticated ? (
          <ChatPage
            dataset={dataset}
            metadata={metadata}
            graphCode={graphCode}
            setGraphCode={setGraphCode}
            setSummary={setSummary}
            summary={summary}
            messages={messages}
            setMessages={setMessages}
            input={input}
            setInput={setInput}
          />
        ) : (
          <Navigate to="/login" />
        )
      } />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
