/* eslint-disable no-unused-vars */
import SideBar from './components/SideBar';
import Header from './components/Header';
import React, { useState, useEffect, useRef } from 'react';
import DatasetInfoComponent from './DatasetInfoComponent';
import UserInput from './components/UserInput';
import { IoPersonCircle } from 'react-icons/io5'; // Import IoPersonCircle for user icon
 // Import the logo image

const ChatPage = () => {
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState('16rem');
  const [datasetInfoMessages, setDatasetInfoMessages] = useState([]);
  const [userMessages, setUserMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef(null);

  const handleSelectDataset = (dataset) => {
    setSelectedDataset(dataset);
  };

  const addDatasetInfoMessage = (message) => {
    setDatasetInfoMessages((prevMessages) => [...prevMessages, message]);
  };

  const addUserMessage = async (message) => {
    setUserMessages((prevMessages) => [...prevMessages, message]);
  };

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [datasetInfoMessages, userMessages]);

  return (
    <main className="w-full h-screen flex relative">
      {/* Your sidebar and main content setup */}
      <SideBar onSelectDataset={handleSelectDataset} setSidebarWidth={setSidebarWidth} className="h-screen" />
      <section className="flex flex-col p-10 main-content" style={{ marginLeft: "6rem" }}>
        <Header selectedDataset={selectedDataset} setSelectedDataset={setSelectedDataset} />
        <div className="flex flex-col justify-center items-center flex-1 overflow-auto">
          {(datasetInfoMessages.length === 0 && userMessages.length === 0) ? (
            <DatasetInfoComponent
              selectedDataset={selectedDataset}
              addMessage={addDatasetInfoMessage}
              loading={loading}
              setLoading={setLoading}
            />
          ) : (
            <div className="chat-container p-4 rounded-lg h-[60vh] w-[100%] max-[768px]:w-[100%] mx-auto mb-4">
              {[...datasetInfoMessages, ...userMessages].map((message, index) => (
                <div key={index} className={`message ${message.sender === 'user' ? 'text-right' : 'text-left'} mb-10 relative w-[600px] mx-auto`}>
                  <div
                    className={`inline-block px-4 py-2 rounded-lg ${
                      message.sender === 'user' ? 'bg-[#cfc9c9] text-gray-600 rounded-xl rounded-br-none shadow-lg relative' : 'bg-blue-200 text-black rounded-2xl rounded-bl-none shadow-md relative'
                    }`}
                  >
                    {message.text}
                    {message.sender === 'user' ? (
                      <IoPersonCircle className="absolute top-[-1rem] right-[-7px] text-3xl text-blue-500" />
                    ) : (
                      <img src="/binary-insight-logo--.png" alt="Logo" className="w-[80px] h-[80px] object-cover absolute top-[-5.45rem] left-[-30px]" />
                    )}
                  </div>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>
          )}
        </div>
        <div className="sticky bottom-0 z-50 w-full">
          <UserInput
            selectedDataset={selectedDataset}
            addMessage={addUserMessage}
            loading={loading}
            setLoading={setLoading}
          />
        </div>
      </section>
    </main>
  );
};

export default ChatPage;
