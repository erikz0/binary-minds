
import SideBar from './components/SideBar';
import Header from './components/Header';
import React, { useState, useEffect, useRef } from 'react';
import DatasetInfoComponent from './DatasetInfoComponent';
import UserInput from './components/UserInput';
import { IoPersonCircle } from 'react-icons/io5';
import axios from 'axios';
import config from './config';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown for rendering markdown

const ChatPage = () => {
    const [selectedDataset, setSelectedDataset] = useState(null);
    const [sidebarWidth, setSidebarWidth] = useState('16rem');
    const [datasetInfoMessages, setDatasetInfoMessages] = useState([]);
    const [userMessages, setUserMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [retrievedDataset, setRetrievedDataset] = useState(null);
    const messageEndRef = useRef(null);

    const handleSelectDataset = (dataset) => {
        setSelectedDataset(dataset);
    };

    const addDatasetInfoMessage = (message) => {
        console.log("Adding dataset info message:", message);
        setDatasetInfoMessages((prevMessages) => [...prevMessages, message]);
    };

    const addUserMessage = (message, graphCode = null) => {
        console.log("Adding user message:", message, "Graph code:", graphCode);
        setUserMessages((prevMessages) => [...prevMessages, { ...message, graphCode }]);
    };

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }

        userMessages.forEach((message, index) => {
            if (message.graphCode) {
                console.log(`Rendering graph for message at index ${index} with graphCode`, message.graphCode);
                const el = document.getElementById(`graph-container-${index}`);
                renderGraph(el, message.graphCode, retrievedDataset, index);
            }
        });
    }, [datasetInfoMessages, userMessages, retrievedDataset]);

    const renderGraph = (el, graphCode, dataset, index) => {
        if (!el || !graphCode) return;

        console.log(`Rendering graph in element ${el.id} with dataset`, dataset);
        console.log(`Dataset type: ${typeof dataset}, isArray: ${Array.isArray(dataset)}`);

        if (!Array.isArray(dataset)) {
            console.error("Dataset is not an array. Cannot render graph.");
            return;
        }

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
                console.log("Retrieved dataset:", parsedData);
            } catch (error) {
                console.error('Error fetching dataset:', error);
            }
        };

        fetchData();
    }, [selectedDataset]);

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