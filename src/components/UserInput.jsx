/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';
import { IoSend } from 'react-icons/io5';
import config from '../config';

const UserInput = ({ selectedDataset, addMessage, loading, setLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [isActive, setIsActive] = useState(false);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    setIsActive(event.target.value.length > 0);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    // Add the user message to the chat
    addMessage({ sender: 'user', text: inputValue });

    setInputValue('');
    setIsActive(false);
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

      // Add the response message to the chat
      addMessage({ sender: 'bot', text: response.data.reply });
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({ sender: 'bot', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex items-center mb-8 w-[500px] max-[330px]:w-[120px] max-[350px]:w-[155px] max-[385px]:w-[220px] max-[420px]:w-[250px] max-[480px]:w-[280px] max-[768px]:w-[320px] max-[850px]:w-[400px] min-[1024px]:w-[600px] m-auto">
      <input
        type="text"
        placeholder="Message ICED Dataset"
        className="border border-gray-300 rounded-full py-2 px-4 mr-2 focus:outline-none flex-1"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={loading}
      />
      <button
        className={`rounded-full py-2 px-4 focus:outline-none ${isActive ? 'bg-[#1d4487]' : 'bg-[#8d9cb4]'}`}
        onClick={handleSendMessage}
        disabled={loading || inputValue.trim() === ''}
      >
        <IoSend size={14} className={`text-center ${isActive ? 'text-white' : 'text-white'}`} />
      </button>
    </div>
  );
};

export default UserInput;
