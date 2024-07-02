import React from 'react';
import { IoSend } from 'react-icons/io5';

const UserInput = () => {
  return (
    <div className="flex items-center mb-8 w-[500px] max-[330px]:w-[120px] max-[350px]:w-[155px] max-[385px]:w-[220px] max-[420px]:w-[250px] max-[480px]:w-[280px] max-[768px]:w-[320px] max-[850px]:w-[400px] min-[1024px]:w-[600px]  m-auto">
      <input
        type="text"
        placeholder="Type your prompt here..."
        className="border border-gray-300 rounded-md py-2 px-4 mr-2 focus:outline-none flex-1 "
        // Ensures input expands to fill available space
      />
      <button className="bg-[#1d4487] text-white rounded-md py-2 px-4 focus:outline-none">
        <IoSend size={16} />
      </button>
    </div>
  );
};

export default UserInput;