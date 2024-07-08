/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import Login from './Login';
import config from './config';
import ChatPage from './ChatPage'
import './index.css';


 

const App = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [graphCode, setGraphCode] = useState('');
  const [dataset, setDataset] = useState(null);
  const [summary, setSummary] = useState('');
  const [metadata, setMetadata] = useState([]);
  const [datasetTitle, setDatasetTitle] = useState('');
  const [datasetPackage, setDatasetPackage] = useState('');
  const [datasetFile, setDatasetFile] = useState('');
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

  const fetchDataset = async (dataset) => {
    try {
      const token = localStorage.getItem('token');
      const dataResponse = await axios.get(`${config.serverUrl}/normalized-data/${dataset.package}/${dataset.file}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const metadataResponse = await axios.get(`${config.serverUrl}/metadata/data/${dataset.package}/${dataset.file}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const normalizedData = dataResponse.data;
      const metadata = metadataResponse.data;
  
      setDataset(normalizedData);
      setMetadata(metadata);
      setDatasetTitle(dataset.title);
      setDatasetPackage(dataset.package);  // Set the dataset package
      setDatasetFile(dataset.file)
    } catch (error) {
      console.error('Error loading data or metadata:', error);
    }
  };
  
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
   

    <div>
    <><Routes>
      <Route path="/login" element={<Login onLogin={handleLogin} setIsAuthenticated={setIsAuthenticated} />} />
      <Route path="/chat" element={isAuthenticated ? (
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
          datasetTitle={datasetTitle}
          datasetPackage={datasetPackage}
          datasetFile={datasetFile} />
      ) : (
        <Navigate to="/login" />
      )} />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes></>
  </div>
  );
};

export default App;