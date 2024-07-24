import React, { useState } from 'react';
import { toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS
import { Oval } from 'react-loader-spinner'; // Import Oval from react-loader-spinner
import { FaInfoCircle, FaColumns, FaChartBar, FaQuestionCircle } from 'react-icons/fa';
import logo from './assets/images/iced.png';
import bmlogo from './assets/images/binary-insight-logo--.png'
import './DatasetInfoComponent.css'; // Import your CSS file

const DatasetInfoComponent = ({ selectedDataset, handleSendMessage, loading, setLoading }) => {
  const initialQuestions = [
    { id: 1, text: 'Describe the dataset for the user', response: null, icon: FaInfoCircle, color: 'purple' },
    { id: 2, text: 'Please give the user important columns in the dataset', response: null, icon: FaColumns, color: 'green' },
    { id: 3, text: 'Please pick two important columns and generate a graph out of them', response: null, icon: FaChartBar, color: 'red' },
    { id: 4, text: 'Explain how to use this chat to help describe data', response: null, icon: FaQuestionCircle, color: '#1d4487' },
  ];

  const [activeQuestion, setActiveQuestion] = useState(null);

  const handleQuestionClick = async (questionId) => {
    if (!selectedDataset) {
      toast.error('Please select a dataset before fetching a response', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        transition: Slide
      });
      return;
    }

    const question = initialQuestions.find((q) => q.id === questionId);

    if (question) {
      // Use handleSendMessage to send the question as a message
      handleSendMessage(question.text);
      setActiveQuestion(question);
    }
  };

  return (
    <div className="dataset-info-container">
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
        <div className="dataset-chat">
          <div className="bg-[#cfc9c9] p-4 rounded-xl rounded-br-none shadow-lg mx-auto my-4 relative">
            <img src={logo} alt="ICED Logo" className="absolute bottom-[43px] right-[-14px] w-[25px] h-[25px] object-cover" />
            <span className="text-gray-600">{activeQuestion.text}</span>
          </div>
          <div className="bg-blue-200 p-4 rounded-2xl rounded-bl-none shadow-md w-full max-w-md mx-auto my-4 relative">
            <img src={bmlogo} alt="Logo" className="w-[80px] h-[80px] object-cover absolute bottom-[170px] left-[-30px]" />
            <span>{activeQuestion.response}</span>
          </div>
        </div>
      ) : (
        <>
          <div className="w-full flex flex-col justify-center items-center">
            <h3 className='font-semibold max-[480px]:text-sm'>Please Select a Dataset from the Sidebar to get started</h3>
            <img src={bmlogo} alt="Logo" className="w-[11rem] object-cover" />
          </div>
          <div className="question-container">
            {initialQuestions.map((question) => (
              <div
                key={question.id}
                className="bg-white p-3 rounded-lg shadow-md cursor-pointer hover:scale-105 transition duration-300"
                onClick={() => handleQuestionClick(question.id)}
              >
                <div className="flex items-start">
                  <div className="mr-2 mb-2" style={{ color: question.color }}>{React.createElement(question.icon)}</div>
                  <h2 className="text-sm text-[#4e4d4d] font-medium mb-2 mt-6">{question.text}</h2>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DatasetInfoComponent;
