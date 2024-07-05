

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import config from './config';
import { Oval } from 'react-loader-spinner';
import { FaInfoCircle, FaColumns, FaChartBar, FaQuestionCircle } from 'react-icons/fa';
import logo from './iced.png'; 
import './DatasetInfoComponent.css'; // Import your CSS file

const DatasetInfoComponent = ({ selectedDataset }) => {
  const initialQuestions = [
    { id: 1, text: 'Describe the dataset for the user', response: null, icon: FaInfoCircle, color: 'purple' },
    { id: 2, text: 'Please give the user important columns in the dataset', response: null, icon: FaColumns, color: 'green' },
    { id: 3, text: 'Please pick two important columns and generate a graph out of them', response: null, icon: FaChartBar, color: 'red' },
    { id: 4, text: 'Explain how to use this chat to help describe data', response: null, icon: FaQuestionCircle, color: '#1d4487' },
  ];

  const [activeQuestion, setActiveQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [graphCode, setGraphCode] = useState('');
  const graphContainerRef = useRef(null);

  useEffect(() => {
    if (graphCode && graphContainerRef.current && selectedDataset && selectedDataset.data) {
      graphContainerRef.current.innerHTML = '<canvas id="graph-container"></canvas>';

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.text = `
        (function() {
          const ctx = document.getElementById('graph-container').getContext('2d');
          const dataset = ${JSON.stringify(selectedDataset.data)};
          if (Array.isArray(dataset)) {
            ${graphCode}
          } else {
            console.error('Invalid dataset structure:', dataset);
          }
        })();
      `;
      graphContainerRef.current.appendChild(script);
    }
  }, [graphCode, selectedDataset]);

  const handleQuestionClick = async (questionId) => {
    if (!selectedDataset) {
      console.error('You need to select a dataset before fetching a response');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const question = initialQuestions.find((q) => q.id === questionId);

      if (question) {
        const payload = {
          message: question.text,
          package: selectedDataset.package,
          filename: selectedDataset.file,
        };

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

        let botMessage = {};

        if (response.data.graphCode) {
          setGraphCode(response.data.graphCode);
          botMessage = { text: 'Graph generated below:', sender: 'bot', color: '#1F4F91' };
        } else {
          botMessage = { text: response.data.reply, sender: 'bot' };
          setGraphCode('');
        }

        question.response = botMessage.text;
        setActiveQuestion(question);
      }
    } catch (error) {
      console.error('Error fetching response:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap justify-center items-center dataset-info-container">
      {loading ? (
        <div className="flex w-full justify-center items-center">
          <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md mx-4 my-4">
            <div className="text-center">
              <Oval
                height={40}
                width={40}
                color="#1d4487"
                secondaryColor="#1d4487"
                strokeWidth={2}
                strokeWidthSecondary={2}
                ariaLabel="loading"
              />
            </div>
          </div>
        </div>
      ) : activeQuestion ? (
        <div className="flex  flex-col dataset-chat h-[60vh] w-[100%] max-[768px]:w-[100%] mx-auto ">
         
          <div className="bg-[#cfc9c9] p-4 rounded-xl rounded-br-none shadow-lg w-[250px] mx-4 my-4 ml-[300px] relative">
          <img src={logo} alt="ICED Logo" className="absolute bottom-[43px] right-[-14px] w-[25px] h-[25px] max-[780px]:w-[20px] max-[780px]:h-[20px] object-cover" />
            <span className="text-gray-600">{activeQuestion.text}</span>
          </div>
          <div className="bg-blue-200 p-4 rounded-2xl rounded-bl-none shadow-md w-full max-w-md mx-4 my-4 relative">
          <img src="/binary-insight-logo--.png" alt="Logo" className="w-[80px] h-[80px] max-[860px]:w-[60px] max-[860px]:h-[60px] object-cover absolute bottom-[170px] left-[-30px]  " />
            <span>{activeQuestion.response}</span>
            {graphCode && <div ref={graphContainerRef}></div>}
          </div>
        </div>
      ) : (
        <>
          <div className="w-full flex flex-col  justify-center items-center ">
            <h3 className='font-semibold max-[460px]:text-sm max-[430px]:text-xs'>Please Select a Dataset from the Sidebar to get started</h3>
            <img src="/binary-insight-logo--.png" alt="Logo" className="w-[11rem] object-cover " />
          </div>
          {initialQuestions.map((question) => (
            <div
              key={question.id}
              className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-4 my-2 cursor-pointer hover:scale-105 transition duration-300"
              onClick={() => handleQuestionClick(question.id)}
            >
              <div className="flex items-start">
                <div className="mr-2 mb-2" style={{ color: question.color }}>{React.createElement(question.icon)}</div>
                <h2 className="text-sm text-[#4e4d4d] font-medium mb-2 mt-6">{question.text}</h2>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default DatasetInfoComponent;
