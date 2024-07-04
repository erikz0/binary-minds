/* eslint-disable no-unused-vars */


import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaCode } from 'react-icons/fa';
import { RiDownloadCloudFill } from 'react-icons/ri';
import { IoCopy } from 'react-icons/io5';
import config from '../config';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse'; // Import papaparse for CSV parsing
import CopyTooltip from './CopyTooltip';
import DownloadTooltip from './DownloadTooltip';
import { BsListColumnsReverse } from "react-icons/bs";

const Header = ({ selectedDataset, setSelectedDataset }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dataset, setDataset] = useState(null);
  const [normalizedData, setNormalizedData] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [loadingDataset, setLoadingDataset] = useState(false);
  const [loadingNormalizedData, setLoadingNormalizedData] = useState(false);
  const [errorDataset, setErrorDataset] = useState(null);
  const [errorNormalizedData, setErrorNormalizedData] = useState(null);
  const [showDatasetContainer, setShowDatasetContainer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewNormalizedData, setViewNormalizedData] = useState(false); // Define viewNormalizedData state

  const dropdownRef = useRef(null);
  const pageSize = 10; // Define pageSize for pagination

  useEffect(() => {
    const fetchDataset = async () => {
      setLoadingDataset(true);
      setErrorDataset(null);
      if (selectedDataset) {
        try {
          const token = localStorage.getItem('token');
          const dataResponse = await axios.get(`${config.serverUrl}/metadata/data/${selectedDataset.package}/${selectedDataset.file}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setDataset(dataResponse.data);
          setShowDatasetContainer(false); // Close dataset container initially when dataset changes
        } catch (error) {
          console.error('Error loading data:', error);
          setErrorDataset('Error loading data');
        } finally {
          setLoadingDataset(false);
        }
      }
    };

    fetchDataset();
  }, [selectedDataset]);

  const fetchNormalizedData = async () => {
    setLoadingNormalizedData(true);
    setErrorNormalizedData(null);
    try {
      const token = localStorage.getItem('token');
      const normalizedDataResponse = await axios.get(`${config.serverUrl}/normalized-data/${selectedDataset.package}/${selectedDataset.file}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const csvData = normalizedDataResponse.data; // Assuming normalized data is CSV string

      // Parse CSV data using PapaParse
      Papa.parse(csvData, {
        header: true,
        complete: (results) => {
          setNormalizedData(results.data); // Set parsed CSV data to state
          setLoadingNormalizedData(false);
          setShowDatasetContainer(true); // Show dataset container when dataset is selected
          setShowDropdown(false); // Close dropdown after loading data
          setViewNormalizedData(true); // Set viewNormalizedData state
          setCurrentPage(1); // Reset currentPage to 1 when new data is loaded
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          setErrorNormalizedData('Error parsing CSV');
          setLoadingNormalizedData(false);
        }
      });
    } catch (error) {
      console.error('Error loading normalized data:', error);
      setErrorNormalizedData('Error loading normalized data');
      setLoadingNormalizedData(false);
    }
  };

  const handleDatasetSelect = (dataset) => {
    setSelectedDataset(dataset);
    setShowDropdown(false); // Close dropdown after selecting dataset
    setShowDatasetContainer(true); // Show dataset container when dataset is selected
    setNormalizedData([]); // Clear normalized data on dataset change
    setCurrentPage(1); // Reset pagination on dataset change
    setViewNormalizedData(false); // Reset viewNormalizedData state
  };

  const handleNormalizedDataSelect = () => {
    fetchNormalizedData();
  };

  const copyJSONToClipboard = () => {
    if (!dataset) return;
    navigator.clipboard.writeText(JSON.stringify(dataset, null, 2));
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 3000); // Reset copy success message after 3 seconds
  };

  const downloadPDF = () => {
    if (!dataset) return;

    const doc = new jsPDF();
    const jsonContent = JSON.stringify(dataset, null, 2);

    const lines = doc.splitTextToSize(jsonContent, 180);
    const pageHeight = doc.internal.pageSize.height;
    let cursorY = 10;

    lines.forEach((line) => {
      if (cursorY + 10 > pageHeight) {
        doc.addPage();
        cursorY = 10; // Reset cursor position to top of new page
      }
      doc.text(line, 10, cursorY);
      cursorY += 10; // Move cursor down for next line
    });

    doc.save('dataset.pdf');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = currentPage * pageSize;

  return (
    <div className="flex justify-between items-center border-b border-gray-300 relative">
      <h1 className="text-lg font-bold max-[480px]:text-sm">ICED DATASET</h1>
      <div className="relative">
        <img
          src="/binary-insight-logo--.png"
          alt="Binary Insight Logo"
          className="cursor-pointer object-cover  w-[7rem]"
          onClick={() => {
            if (showDatasetContainer) {
              setShowDatasetContainer(false);
            } else {
              setShowDropdown((prevShowDropdown) => !prevShowDropdown);
            }
          }}
        />
        {showDropdown && (
          <div ref={dropdownRef} className="absolute top-24 right-0 bg-white border border-gray-300 shadow-lg px-2 py-2 rounded-lg">
            <div
              className="flex cursor-pointer mb-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition duration-300"
              onClick={() => handleDatasetSelect(selectedDataset)}
            >
              <span className="text-sm mr-16 items-start text-gray-700">Dataset {selectedDataset ? selectedDataset.name : 'No dataset selected'}</span>
              <FaCode size={16} className="ml-8 text-yellow-500" />
            </div>
            <div
              className="flex cursor-pointer mb-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition duration-300"
              onClick={handleNormalizedDataSelect}
            >
              <span className="text-sm white-space-nowrap mr-16 items-start text-gray-700">Normalized</span>
              <BsListColumnsReverse size={16} className="ml-2 text-green-500" />
            </div>
            {/* Add more dropdown items here */}
          </div>
        )}
      </div>
      {showDatasetContainer && (
        <div className="p-4 overflow-auto h-[80vh] w-[300px] max-w-full border border-gray-300 absolute top-20 right-4 bg-white header-data">
          <div className="flex justify-between mb-4">
            <div className="relative">
              <CopyTooltip text="Copy Data">
                <button onClick={copyJSONToClipboard} className="focus:outline-none mr-2">
                  <IoCopy size={15} />
                </button>
              </CopyTooltip>
            </div>
            <div className="relative">
              <DownloadTooltip text="Download Data">
                <button onClick={downloadPDF} className="focus:outline-none">
                  <RiDownloadCloudFill size={15} />
                </button>
              </DownloadTooltip>
            </div>
          </div>
          {(loadingDataset || loadingNormalizedData) && <p>Loading...</p>}
          {!loadingDataset && !loadingNormalizedData && errorDataset && <p>{errorDataset}</p>}
          {!loadingDataset && !loadingNormalizedData && errorNormalizedData && <p>{errorNormalizedData}</p>}
          {!loadingDataset && !loadingNormalizedData && !errorDataset && !errorNormalizedData && (
            <>
              {viewNormalizedData && normalizedData.length > 0 ? (
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      {Object.keys(normalizedData[0]).map((key) => (
                        <th key={key} className="border border-gray-300 py-2 px-4">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {normalizedData.slice(startIndex, endIndex).map((row, index) => (
                      <tr key={index} className={index % 2 === 1 ? 'bg-gray-50' : ''}>
                        {Object.values(row).map((value, valueIndex) => (
                          <td key={valueIndex} className="border border-gray-300 py-2 px-4">{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <pre>{JSON.stringify(dataset, null, 2)}</pre>
              )}
              {/* Pagination controls */}
              {normalizedData.length > pageSize && (
                <div className="flex justify-center mt-4">
                  {Array.from({ length: Math.ceil(normalizedData.length / pageSize) }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index + 1)}
                      className={`px-4 py-2 mx-1 focus:outline-none ${
                        currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Header;
