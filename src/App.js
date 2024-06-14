import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Box, Typography, Grid, List, ListItem, ListItemText } from '@mui/material';
import Papa from 'papaparse';
import Login from './Login'; // Import the Login component
import config from './config'; // Import the configuration

const App = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [graphCode, setGraphCode] = useState('');
  const [dataset, setDataset] = useState(null);
  const [metadata, setMetadata] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Add authentication state
  const graphContainerRef = useRef(null);

  // Function to normalize data
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
      '<': 'less_than',
      '>': 'greater_than',
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

  // Function to generate metadata
  const generateMetadata = (data) => {
    const columns = Object.keys(data[0]).map(key => {
      return { name: key, type: typeof data[0][key] };
    });
    return columns;
  };

  // Load CSV file into memory when the component mounts
  useEffect(() => {
    const loadCSV = async () => {
      try {
        const fileResponse = await axios.get(`${config.serverUrl}/data/data.csv`);
        const text = fileResponse.data;
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            console.log('CSV data before normalization:', results.data);
            const normalizedData = normalizeData(results.data);
            console.log('CSV data after normalization:', normalizedData);
            setDataset(normalizedData);
            setMetadata(generateMetadata(normalizedData));  // Generating metadata
          },
        });
      } catch (error) {
        console.error('Error loading CSV file:', error);
      }
    };

    loadCSV();
  }, []);

  const handleSendMessage = async () => {
    if (input.trim() === '' || !dataset) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const response = await axios.post(`${config.serverUrl}/bm-chat`, {
        message: input,
        dataset: dataset,
        metadata: metadata
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.graphCode) {
        setGraphCode(response.data.graphCode);
        const botMessage = { text: 'Graph Generated!', sender: 'bot', color: '#1F4F91' }; // Darker shade of blue
        setMessages((prevMessages) => [...prevMessages, botMessage]);
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

  useEffect(() => {
    if (graphCode && dataset && graphContainerRef.current) {
      // Clear previous graph by removing and recreating the canvas
      graphContainerRef.current.innerHTML = '<canvas id="graph-container"></canvas>';

      console.log("Graph code: " + graphCode)

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

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ backgroundColor: '#CAE8FF', height: '100vh', padding: 0, margin: 0 }}>
      <Container maxWidth={false} style={{ height: '95vh' }}>
        <Grid container spacing={2} style={{ height: '100%' }}>
          <Grid item xs={3} style={{ height: '100%' }}>
            <Box my={4} p={3} border={1} borderRadius={5} style={{ height: 'calc(100% - 32px)', overflow: 'auto', backgroundColor: '#ffffff', borderColor: '#000000' }}>
              <Typography variant="h5" gutterBottom>
                Dataset Metadata
              </Typography>
              <List>
                {metadata.map((field, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={field.name} />
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
            <Box my={4} p={3} border={1} borderRadius={5} ref={graphContainerRef} style={{ height: 'calc(100% - 32px)', overflow: 'auto', backgroundColor: '#ffffff', borderColor: '#000000' }}>
              <Typography variant="h5">Graph will be displayed here:</Typography>
              <canvas id="graph-container"></canvas>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default App;
