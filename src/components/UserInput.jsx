import React, { useState } from 'react';
import { IoSend } from 'react-icons/io5'; // Ensure the send icon is imported

const UserInput = ({ selectedDataset, handleSendMessage, loading, setLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [isActive, setIsActive] = useState(false);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    setIsActive(event.target.value.length > 0);
  };

  const onSendMessage = () => {
    handleSendMessage(inputValue);
    setInputValue('');
    setIsActive(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onSendMessage();
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
        onClick={onSendMessage}
        disabled={loading || inputValue.trim() === ''}
      >
        <IoSend size={14} className={`text-center ${isActive ? 'text-white' : 'text-white'}`} />
      </button>
    </div>
  );
};

export default UserInput;
