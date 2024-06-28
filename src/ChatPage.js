import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Container, Box, Typography, Grid, List, ListItem, ListItemText } from '@mui/material';
import config from './config';

const ChatPage = ({ dataset, metadata, graphCode, setGraphCode, setSummary, summary, messages, setMessages, input, setInput, datasetDescription, datasetPackage, datasetFile }) => {
  const graphContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (graphCode && dataset && graphContainerRef.current) {

      // Ensure dataset is an array
      let parsedDataset = dataset;
      if (typeof dataset === 'string') {
        try {
          parsedDataset = JSON.parse(dataset);
        } catch (error) {
          console.error('Error parsing dataset:', error);
        }
      }
  
      console.log("Is parsedDataset array? ", Array.isArray(parsedDataset));
  
      graphContainerRef.current.innerHTML = '<canvas id="graph-container"></canvas>';
  
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.text = `
        (function() {
          const ctx = document.getElementById('graph-container').getContext('2d');
          const dataset = ${JSON.stringify(parsedDataset)};
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
    setInput(''); // Clear the input after sending the message

    try {
      const response = await axios.post(`${config.serverUrl}/bm-chat`, {
        message: input,
        package: datasetPackage,
        filename: datasetFile
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
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleDownloadGraph = () => {
    const canvas = document.getElementById('graph-container');
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'graph.png';
    link.click();
  };

  const handleDownloadDataInfo = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${config.serverUrl}/data/${datasetPackage}/datainfo.pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'datainfo.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading datainfo:', error);
    }
  };

  return (
    <Container maxWidth={false} style={{ height: '95vh' }}>
      <Button onClick={() => navigate('/datasets')} style={{ margin: '10px' }}>Back to Datasets</Button>
      <Grid container spacing={2} style={{ height: '100%' }}>
        <Grid item xs={3} style={{ height: '100%' }}>
          <Box my={4} p={3} border={1} borderRadius={5} style={{ height: 'calc(100% - 100px)', overflow: 'auto', backgroundColor: '#ffffff', borderColor: '#000000' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h5" gutterBottom>
                Dataset Metadata
              </Typography>
              <Button variant="contained" color="primary" onClick={handleDownloadDataInfo} style={{ backgroundColor: '#000000', color: '#ffffff' }}>
                Download Data Information
              </Button>
            </Box>
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
              {datasetDescription}
            </Typography>
            <Box my={2} p={2} border={1} borderRadius={5} style={{ height: 'calc(100% - 250px)', overflow: 'auto', backgroundColor: '#ffffff', borderColor: '#000000' }}>
              {messages.map((msg, index) => (
                <Box key={index} style={{ margin: '10px 0' }}>
                  <Typography
                    variant="caption"
                    style={{ display: 'block', textAlign: msg.sender === 'user' ? 'right' : 'left', color: '#888' }}
                  >
                    {msg.sender === 'user' ? 'user' : 'bot'}
                  </Typography>
                  <Typography
                    align={msg.sender === 'user' ? 'right' : 'left'}
                    style={{
                      color: msg.sender === 'user' ? '#1E90FF' : '#00008B',
                      whiteSpace: 'pre-wrap',
                      margin: msg.sender === 'user' ? '10px 0 10px auto' : '10px auto 10px 0',
                      backgroundColor: msg.sender === 'user' ? '#E0F7FF' : '#D3D3E3',
                      padding: '10px',
                      borderRadius: '10px',
                      maxWidth: '80%',
                    }}
                  >
                    {msg.text}
                  </Typography>
                </Box>
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
              onClick={handleDownloadGraph}
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

export default ChatPage;
