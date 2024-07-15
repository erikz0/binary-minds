/* eslint-disable no-unused-vars */

import SideBar from './components/SideBar';
import Header from './components/Header';
import React, { useState, useEffect, useRef } from 'react';
import DatasetInfoComponent from './DatasetInfoComponent';
import UserInput from './components/UserInput';
import logo from './assets/images/iced.png'; 
import bmlogo from './assets/images/binary-insight-logo--.png'; 
import axios from 'axios';
import config from './config';
import { IoMdCloudDownload } from 'react-icons/io';
import ReactMarkdown from 'react-markdown';
import { toast, Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ChatPage = () => {
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState('16rem');
  const [datasetInfoMessages, setDatasetInfoMessages] = useState([]);
  const [sessionMessages, setSessionMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [retrievedDataset, setRetrievedDataset] = useState(null);
  const messageEndRef = useRef(null);

  const getCurrentSessionId = (selectedDataset) => {
    if (!selectedDataset) {
      return null
    }
    const sessionId = selectedDataset.package + selectedDataset.file
    return sessionId
  }

  // Function to get messages for a specific session
  const getMessagesForSession = (sessionId) => {
    return sessionMessages[sessionId] || [];
  };

  const handleSelectDataset = (dataset) => {
    setSelectedDataset(dataset);
    toast.success(`Selected Dataset: ${dataset.title}`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      transition: Slide
    });
  };

  const addDatasetInfoMessage = (message) => {
    setDatasetInfoMessages((prevMessages) => [...prevMessages, message]);
  };

  const addUserMessage = (sessionId, message, graphCode = null) => {
    setSessionMessages(prevSessionMessages => {
      // If the session already exists, add the new message to the existing array
      // Otherwise, create a new array with the message
      const newMessages = prevSessionMessages[sessionId]
        ? [...prevSessionMessages[sessionId], { ...message, graphCode }]
        : [{ ...message, graphCode }];
      
      return {
        ...prevSessionMessages,
        [sessionId]: newMessages
      };
    });
  };

  const handleSendMessage = async (inputValue) => {
    if (inputValue.trim() === '') return;
    
    if (!selectedDataset) {
      addUserMessage(getCurrentSessionId(selectedDataset), { sender: 'bot', text: 'Please select a dataset before continuing to chat' });
      return;
    }

    // Add the user message to the chat
    addUserMessage(getCurrentSessionId(selectedDataset), { sender: 'user', text: inputValue });

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${config.serverUrl}/bm-chat`,
        {
          message: inputValue,
          package: selectedDataset.package,
          filename: selectedDataset.file,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { summary, graphCode, reply } = response.data;

      if (graphCode) {
        addUserMessage(getCurrentSessionId(selectedDataset), { sender: 'bot', text: summary }, graphCode);
      } else {
        addUserMessage(getCurrentSessionId(selectedDataset), { sender: 'bot', text: reply });
      }
    } catch (error) {
      addUserMessage(getCurrentSessionId(selectedDataset), { sender: 'bot', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    getMessagesForSession(getCurrentSessionId(selectedDataset)).forEach((message, index) => {
      if (message.graphCode) {
        const el = document.getElementById(`graph-container-${index}`);
        renderGraph(el, message.graphCode, retrievedDataset, index);
      }
    });
  });

  const renderGraph = (el, graphCode, dataset, index) => {
    if (!el || !graphCode) return;

    if (!Array.isArray(dataset)) {
      return;
    }

    el.innerHTML = `<canvas id="graph-canvas-${index}" style="width: 100%; height: 100%;"></canvas>`;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.text = `
      (function() {
        const ctx = document.getElementById('graph-canvas-${index}').getContext('2d');
        const dataset = ${JSON.stringify(dataset)};
        ${graphCode}
      })();
    `;
    el.appendChild(script);
  };

  // Simple in-memory cache
  const cache = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedDataset) return;

      const cacheKey = `${selectedDataset.package}/${selectedDataset.file}`;
      // Check if data is in cache
      if (cache[cacheKey]) {
        setRetrievedDataset(cache[cacheKey]);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const dataResponse = await axios.get(`${config.serverUrl}/normalized-data/${selectedDataset.package}/${selectedDataset.file}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const parsedData = typeof dataResponse.data === 'string'
          ? JSON.parse(dataResponse.data)
          : dataResponse.data;

        // Store data in cache
        cache[cacheKey] = parsedData;
        setRetrievedDataset(parsedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [selectedDataset, cache]);


  const handleDownload = (index) => {
    const canvas = document.getElementById(`graph-canvas-${index}`);

    if (!canvas) {
        return;
    }

    const imageURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = imageURL;
    a.download = 'graph.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <main className="w-full h-screen flex relative">
      <SideBar onSelectDataset={handleSelectDataset} setSidebarWidth={setSidebarWidth} className="h-screen" />
      <section className="flex flex-col p-10 main-content" style={{ marginLeft: "6rem" }}>
        <Header selectedDataset={selectedDataset} setSelectedDataset={setSelectedDataset} />
        <div className="flex flex-col justify-center items-center flex-1 overflow-auto">
          {(datasetInfoMessages.length === 0 && getMessagesForSession(getCurrentSessionId(selectedDataset)).length === 0) ? (
            <DatasetInfoComponent
              selectedDataset={selectedDataset}
              handleSendMessage={handleSendMessage}
              loading={loading}
              setLoading={setLoading}
            />
          ) : (
            <div className="chat-container p-4 rounded-lg h-[60vh] w-[100%] max-[768px]:w-[100%]  mx-auto mb-4">
              {[...datasetInfoMessages, ...getMessagesForSession(getCurrentSessionId(selectedDataset))].map((message, index) => (
                <div key={index} className={`message ${message.sender === 'user' ? 'text-right' : 'text-left'} mb-10 relative w-[800px] max-[1100px]:w-[700px] max-[1024px]:w-[600px] max-[950px]:w-[500px] max-[840px]:w-[400px] max-[550px]:w-[300px] max-[460px]:w-[250px] max-[405px]:w-[235px]  max-[390px]:w-[210px] max-[365px]:w-[200px] max-[352px]:w-[180px] mx-auto`}>
                  <div
                    className={`inline-block px-4 py-2 rounded-lg ${
                      message.sender === 'user' ? 'bg-[#cfc9c9] text-gray-600 rounded-xl rounded-br-none shadow-lg relative' : 'bg-blue-200 text-black rounded-2xl rounded-bl-none shadow-md relative max-[405px]:mt-6'
                    }`}
                  >
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                    {message.graphCode && (
                      <div id={`graph-container-${index}`} style={{ width: '100%', height: '400px', backgroundColor: 'white' }}></div>
                    )}
                    {message.graphCode && (
                      <div className="relative">
                        <button
                          onClick={() => handleDownload(index)}
                          className="absolute top-2 left-1"
                        >
                          <IoMdCloudDownload size={24} className='text-[#1d4487] relative hover:scale-110 transition duration-300' />
                        </button>
                      </div>
                    )}
                    {message.sender === 'user' ? (
                      <img src={logo} alt="ICED Logo" className="absolute bottom-[18px] right-[-10px] w-[28.5px] h-[28.5px] max-[780px]:w-[20px] max-[780px]:h-[20px] object-cover rounded-full" />
                    ) : (
                      <img src={bmlogo} alt="Logo" className="w-[80px] h-[80px] object-cover absolute top-[-5.45rem] left-[-30px]" />
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message text-left mb-10 relative w-[800px] max-[1100px]:w-[700px] max-[1024px]:w-[600px] max-[950px]:w-[500px] max-[840px]:w-[400px] max-[550px]:w-[300px] max-[460px]:w-[250px] max-[405px]:w-[235px] max-[390px]:w-[210px] max-[365px]:w-[200px] max-[352px]:w-[180px] mx-auto">
                  <img src={bmlogo} alt="Logo" className="w-[80px] h-[80px] object-cover absolute top-[-5.45rem] left-[-30px]" />
                  <div className="loading-message bg-blue-200 text-black inline-block px-4 py-2 rounded-2xl rounded-bl-none shadow-md relative max-[405px]:mt-6">
                    <span className="dots"></span>
                  </div>
                </div>
              )}
              <div ref={messageEndRef} />
            </div>
          )}
        </div>
        <div className="sticky bottom-0 z-50 w-full">
          <UserInput
            selectedDataset={selectedDataset}
            handleSendMessage={handleSendMessage}
            loading={loading}
            setLoading={setLoading}
          />
        </div>
        <ToastContainer />
      </section>
    </main>
  );
};


export default ChatPage;

