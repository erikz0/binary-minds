import React from 'react';

const PromptContainer = ({ prompt, selectedDataset }) => {
  // Logic to handle prompts based on selectedDataset

  return (
    <div className="flex justify-center items-center border border-gray-300 p-4 rounded-md m-2">
      <p className="text-center">{prompt}</p>
    </div>
  );
};

export default PromptContainer;
