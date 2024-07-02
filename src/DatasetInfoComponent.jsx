


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from './config'; // Import config with serverUrl

const DatasetInfoComponent = ({ selectedDataset }) => {
  const [questions, setQuestions] = useState([
    { id: 1, text: 'What are the main features of this dataset?', response: null },
    { id: 2, text: 'What insights can be derived from this dataset?', response: null },
    { id: 3, text: 'How is this dataset useful in real-world applications?', response: null },
    { id: 4, text: 'What are the limitations or challenges of this dataset?', response: null },
  ]);

  useEffect(() => {
    console.log('Selected dataset:', selectedDataset);
    if (selectedDataset) {
      fetchResponses(selectedDataset.packageName, selectedDataset.fileName);
    }
  }, [selectedDataset]);

  const fetchResponses = async (datasetPackage, filename) => {
    try {
      const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
      const responses = await Promise.all(
        questions.map(async (question) => {
          const payload = {
            message: question.text,
            package: datasetPackage,
            filename,
          };
          console.log('Sending payload:', payload); // Log the payload
          const response = await axios.post(
            `${config.serverUrl}/bm-chat`,
            payload,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
          );
          return response.data.response;
        })
      );

      setQuestions((prevQuestions) =>
        prevQuestions.map((question, index) => ({
          ...question,
          response: responses[index],
        }))
      );
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
  };

  const handleQuestionClick = async (questionId) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        const payload = {
          message: question.text, // Use message instead of question
          package: selectedDataset.package, // Use 'package' key in the payload
          filename: selectedDataset.filename,
        };
        console.log('Sending payload:', payload); // Log the payload
        const response = await axios.post(
          `${config.serverUrl}/bm-chat`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const updatedQuestions = questions.map((q) =>
          q.id === questionId ? { ...q, response: response.data.response } : q
        );
        setQuestions(updatedQuestions);
      } catch (error) {
        console.error('Error fetching response:', error);
      }
    }
  };

  return (
    <div className="flex flex-wrap justify-center items-center">
      {questions.map((question) => (
        <div key={question.id} className="bg-white p-4 rounded-lg shadow-md w-full max-w-md mx-4 my-4 cursor-pointer">
          <h2 className="text-lg font-bold mb-2">{question.text}</h2>
          {question.response ? (
            <p>{question.response}</p>
          ) : (
            <p className="text-gray-600">Click to fetch response</p>
          )}
          <button
            onClick={() => handleQuestionClick(question.id)}
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Fetch Response
          </button>
        </div>
      ))}
    </div>
  );
};

export default DatasetInfoComponent;
