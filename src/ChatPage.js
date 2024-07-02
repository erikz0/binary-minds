



import React, { useState } from 'react';
import SideBar from './components/SideBar';
import Header from './components/Header';
import DatasetInfoComponent from './DatasetInfoComponent'; // Import DatasetInfoComponent

const ChatPage = () => {
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState('16rem');

  const handleSelectDataset = (dataset) => {
    setSelectedDataset(dataset);
  };

  return (
    <main className="w-full h-screen flex relative">
      <SideBar onSelectDataset={handleSelectDataset} setSidebarWidth={setSidebarWidth} className="h-screen" />
      <section className="flex flex-col p-10 main-content" style={{ marginLeft: "6rem" }}>
        <Header selectedDataset={selectedDataset} />
        <div className="flex flex-wrap justify-center items-center mt-32">
          {/* Render DatasetInfoComponent */}
          <DatasetInfoComponent selectedDataset={selectedDataset} />
        </div>
      </section>
    </main>
  );
};

export default ChatPage;


