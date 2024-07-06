/* eslint-disable no-unused-vars */


import SideBar from './components/SideBar';
import Header from './components/Header';
import React, { useState, useEffect, useRef } from 'react';
import DatasetInfoComponent from './DatasetInfoComponent';
import UserInput from './components/UserInput';
import logo from './iced.png'; 
import axios from 'axios';
import config from './config';
import ReactMarkdown from 'react-markdown';
import { IoMdCloudDownload } from 'react-icons/io';
import './Tooltip.css'; // Assuming you have a CSS file for tooltip styles

const ChatPage = () => {
    const [selectedDataset, setSelectedDataset] = useState(null);
    const [datasetInfoMessages, setDatasetInfoMessages] = useState([]);
    const [sidebarWidth, setSidebarWidth] = useState('16rem');
    const [userMessages, setUserMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [retrievedDataset, setRetrievedDataset] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const messageEndRef = useRef(null);

    const handleSelectDataset = (dataset) => {
        setSelectedDataset(dataset);
    };

    const addDatasetInfoMessage = (message) => {
        setDatasetInfoMessages((prevMessages) => [...prevMessages, message]);
    };

    const addUserMessage = (message, graphCode = null) => {
        setUserMessages((prevMessages) => [...prevMessages, { ...message, graphCode }]);
    };

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }

        userMessages.forEach((message, index) => {
            if (message.graphCode) {
                const el = document.getElementById(`graph-container-${index}`);
                renderGraph(el, message.graphCode, retrievedDataset, index);
            }
        });
    }, [userMessages, retrievedDataset]);

    const renderGraph = (el, graphCode, dataset, index) => {
        if (!el || !graphCode) return;

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

    useEffect(() => {
        const fetchData = async () => {
            if (!selectedDataset) return;

            try {
                const token = localStorage.getItem('token');
                const dataResponse = await axios.get(`${config.serverUrl}/normalized-data/${selectedDataset.package}/${selectedDataset.file}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const parsedData = dataResponse.data;
                if (typeof parsedData === 'string') {
                    setRetrievedDataset(JSON.parse(parsedData));
                } else {
                    setRetrievedDataset(parsedData);
                }
            } catch (error) {
                console.error('Error fetching dataset:', error);
            }
        };

        fetchData();
    }, [selectedDataset]);

    const handleDownload = (index) => {
        const canvas = document.getElementById(`graph-canvas-${index}`);

        if (!canvas) {
            console.error(`Canvas element with id 'graph-canvas-${index}' not found.`);
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

    const handleTooltipOpen = (event) => {
        setIsTooltipVisible(true);
        setTooltipPosition({ x: event.clientX, y: event.clientY });
    };

    const handleTooltipClose = () => {
        setIsTooltipVisible(false);
    };

    return (
        <main className="w-full h-screen flex relative">
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
                                        <ReactMarkdown>{message.text}</ReactMarkdown>
                                        {message.graphCode && (
                                            <div id={`graph-container-${index}`} style={{ width: '100%', height: '400px' }}></div>
                                        )}
                                        {message.graphCode && (
                                            <div className="relative">
                                                <button
                                                    onMouseEnter={handleTooltipOpen}
                                                    onMouseLeave={handleTooltipClose}
                                                    onClick={() => handleDownload(index)}
                                                    className="absolute top-1 right-1 z-50"
                                                >
                                                    <IoMdCloudDownload size={24} className='text-[#1d4487] relative hover:scale-110 transition duration-300' />
                                                </button>
                                                {/* {isTooltipVisible && (
                                                    <div className="tooltip" style={{ left: tooltipPosition.x, top: tooltipPosition.y + 20 }}>
                                                        Download Graph
                                                    </div>
                                                )} */}
                                            </div>
                                        )}
                                        {message.sender === 'user' ? (
                                            <img src={logo} alt="ICED Logo" className="absolute top-[-1.25rem] right-[-7px] rounded-full w-[25px] h-[25px] object-cover z-50" />
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
                        addUserMessage={addUserMessage}
                        loading={loading}
                        setLoading={setLoading}
                    />
                </div>
            </section>
        </main>
    );
};

export default ChatPage;
