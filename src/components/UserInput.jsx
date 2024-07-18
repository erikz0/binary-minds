/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { IoSend } from 'react-icons/io5';

const UserInput = ({ selectedDataset, handleSendMessage, loading, setLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [isActive, setIsActive] = useState(false);
  const inputRef = useRef(null);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    setIsActive(event.target.value.length > 0);
    adjustInputHeight();
  };

  const adjustInputHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const scrollHeight = inputRef.current.scrollHeight;
      const minHeight = 20;
      const maxHeight = 220;
      inputRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      inputRef.current.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  };

  const resetInputHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = '20px';
      inputRef.current.style.overflowY = 'hidden';
    }
  };

  const onSendMessage = () => {
    handleSendMessage(inputValue);
    setInputValue('');
    setIsActive(false);
    resetInputHeight();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        // If Shift + Enter, insert a newline
        const newValue = inputValue + '\n';
        setInputValue(newValue);
        adjustInputHeight();
      } else {
        // If only Enter, send the message
        event.preventDefault();
        onSendMessage();
      }
    }
  };

  useEffect(() => {
    adjustInputHeight();
  }, [inputValue]);

  return (
    <div className="flex items-center mb-8 w-[500px] max-[330px]:w-[120px] max-[350px]:w-[155px] max-[385px]:w-[220px] max-[420px]:w-[250px] max-[480px]:w-[280px] max-[768px]:w-[320px] max-[850px]:w-[400px] min-[1024px]:w-[600px] m-auto">
      <textarea
        ref={inputRef}
        placeholder="Message ICED Dataset"
        className={`placeholder-center border border-gray-300 py-4 px-4 mr-2 focus:outline-none flex-1 resize-none text-area-chat ${
          inputValue.length > 50 ? 'rounded-lg' : 'rounded-full'
        }`}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={loading}
        style={{ minHeight: '20px', maxHeight: '220px', overflowY: 'auto' }}
      />
      <button
        className={`rounded-full py-2 px-4 focus:outline-none ${isActive ? 'bg-[#1d4487]' : 'bg-[#8d9cb4]'}`}
        onClick={onSendMessage}
        disabled={loading || inputValue.trim() === ''}
      >
        <IoSend size={14} className={`text-center ${isActive ? 'text-white' : 'text-white'}`} />
      </button>
    </div>
  );
};

export default UserInput;
