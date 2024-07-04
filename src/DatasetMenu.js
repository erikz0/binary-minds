import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaDatabase } from 'react-icons/fa';
import CustomTooltip from './components/CustomTooltip'; // Import your custom tooltip component
import config from './config';
import { motion } from 'framer-motion'; 


const DatasetMenu = ({ onSelectDataset, isOpen }) => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDataset, setActiveDataset] = useState(null); // State to track the active dataset

  useEffect(() => {
    const fetchDatasets = async () => {
      try { 
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.serverUrl}/data/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("fetch dataset:" + response.data)

        setDatasets(response.data);
        setLoading(false);
      } catch (error) {
        setError('Error fetching datasets');
        setLoading(false);
      }
    };

    fetchDatasets();
  }, []);

  const handleDatasetSelect = (dataset) => {
    setActiveDataset(dataset); // Set the selected dataset as active
    onSelectDataset(dataset);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center">
        <div className="spinner">
          <div className="double-bounce1"></div>
          <div className="double-bounce2"></div>
        </div>
      </div>
    );

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="my-4 p-3 ">
      <h2 className={`text-[#4e4d4d] mb-6 font-semibold ${isOpen ? 'text-sm' : 'text-[9px] whitespace-nowrap overflow-hidden text-ellipsis font-normal'}`}>
        Select a Dataset
      </h2>
      <ul>
        {datasets.map((dataset, index) => (
             <motion.li
             key={index}
             className="mb-2 transition-opacity duration-300"
             initial={{ x: -50, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             exit={{ x: -50, opacity: 0 }}
             transition={{ duration: 0.3, delay: index * 0.1 }}
           >
            <CustomTooltip text={dataset.title}>
              <motion.button
               initial={{ x: -50, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               exit={{ x: -50, opacity: 0 }}
               transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => handleDatasetSelect(dataset)}
                className={`px-1 py-2 border rounded cursor-pointer flex items-center mb-3 transition duration-300 ${
                  isOpen ? 'text-left w-full ' : 'justify-center w-fit'
                } ${activeDataset === dataset ? 'bg-blue-200 border-blue-400' : 'bg-gray-200 hover:bg-gray-300 border-gray-400'}`}
              >
                <FaDatabase
                  className={`text-[#4e4d4d] ${isOpen ? 'mr-2' : ''}`}
                  size={isOpen ? 12 : 16}
                  style={{ flexShrink: 0 }}
                />
                {isOpen && (
                  <motion.div  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }} className="text-[8.5px]  font-medium text-gray-600 flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    {dataset.title}
                  </motion.div>
                )}
              </motion.button>
            </CustomTooltip>
            </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default DatasetMenu;

