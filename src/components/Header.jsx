/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { FaCode } from 'react-icons/fa';
import { RiDownloadCloudFill } from 'react-icons/ri';
import { IoCopy } from 'react-icons/io5';
import config from '../config';
import CopyTooltip from './CopyTooltip';
import DownloadTooltip from './DownloadTooltip';
import { BsListColumnsReverse } from "react-icons/bs";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdCancel } from "react-icons/md";
import bmlogo from '../assets/images/binary-insight-logo--.png'

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
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);
  const [viewNormalizedData, setViewNormalizedData] = useState(false);
  const [markdownContent, setMarkdownContent] = useState(''); // State to store Markdown content
  const [pdfContent, setPdfContent] = useState(null); // State to store PDF content

  const dropdownRef = useRef(null);
  const pageSize = 10; // Define pageSize for pagination

  const datasetCache = useRef({});

  useEffect(() => {
    const fetchDataset = async () => {
      setLoadingDataset(true);
      setErrorDataset(null);

      if (selectedDataset) {
        const cacheKey = `${selectedDataset.package}/${selectedDataset.file}`;

        // Check if data is in cache
        if (datasetCache.current[cacheKey]) {
          setDataset(datasetCache.current[cacheKey]);
          setLoadingDataset(false);
          return;
        }

        try {
          const token = localStorage.getItem('token');
          const dataResponse = await axios.get(`${config.serverUrl}/metadata/data/${selectedDataset.package}/${selectedDataset.file}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // Store data in cache
          datasetCache.current[cacheKey] = dataResponse.data;
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
  }, [selectedDataset, datasetCache]);

  const fetchNormalizedData = async () => {
    setLoading(true); 
    setError(null); 
    setErrorNormalizedData(null);
    try {
      const token = localStorage.getItem('token');
      const normalizedDataResponse = await axios.get(`${config.serverUrl}/normalized-data/${selectedDataset.package}/${selectedDataset.file}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // No need to parse CSV since the response is already JSON
      setNormalizedData(normalizedDataResponse.data);
      setLoadingNormalizedData(false);
      setShowDatasetContainer(true);
      setShowDropdown(false);
      setViewNormalizedData(true);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading normalized data:', error);
      setErrorNormalizedData('Error loading normalized data');
    } finally {
      setLoading(false); // Hide loading indicator (always)
    }
  };


  const fetchMarkdownDataInfo = async () => {
    setLoading(true); 
    setError(null); 
    try {
      const token = localStorage.getItem('token');
      const markdownResponse = await axios.get(`${config.serverUrl}/data-info/${selectedDataset.package}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMarkdownContent(markdownResponse.data);
      setShowDropdown(false);
    } catch (error) {
      console.error('Error fetching Markdown data info:', error);
    } finally {
      setLoading(false); // Hide loading indicator (always)
    }
  };

  const fetchPdfData = async () => {
    setLoading(true); 
    setError(null); 
    try {
      const token = localStorage.getItem('token');
      const pdfResponse = await axios.get(`${config.serverUrl}/data-pdf/${selectedDataset.package}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'arraybuffer', // Ensure the response is treated as binary data
      });
      const pdfBlob = new Blob([pdfResponse.data], { type: 'application/pdf' });
      setPdfContent(URL.createObjectURL(pdfBlob));
      setShowDropdown(false);
    } catch (error) {
      console.error('Error fetching PDF data:', error);
    } finally {
      setLoading(false); // Hide loading indicator (always)
    }
  };

  const handleDatasetSelect = (dataset) => {
    setSelectedDataset(dataset);
    setShowDropdown(false);
    setShowDatasetContainer(true);
    setNormalizedData([]);
    setCurrentPage(1);
    setViewNormalizedData(false);
  };

  const handleNormalizedDataSelect = () => {
    fetchNormalizedData();
  };

  const handleMarkdownSelect = () => {
    fetchMarkdownDataInfo();
  };

  const handlePdfSelect = () => {
    fetchPdfData();
  };

  const copyJSONToClipboard = () => {
    if (!dataset) return;
    navigator.clipboard.writeText(JSON.stringify(dataset, null, 2));
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 3000); // Reset copy success message after 3 seconds
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = currentPage * pageSize;


  if (loading) { 
    return (
      <div className="flex justify-center items-center">
        <div className="spinner">
          <div className="double-bounce1"></div>
          <div className="double-bounce2"></div>
        </div>
      </div>
    );
  }

  if (error) return <div className="text-red-500">{error}</div>; 

  return (
    <div className="flex justify-between items-center border-b border-gray-300 relative">
      <h1 className="text-lg font-bold max-[480px]:text-sm">ICED DATASET</h1>
      <div className="relative">
        <img
          src={bmlogo}
          alt="Binary Insight Logo"
          className="cursor-pointer object-cover w-[7.25rem]"
          onClick={() => {
            if (!selectedDataset) {
              toast.error("Please select a dataset first.");
              return;
            }
            if (showDatasetContainer) {
              setShowDatasetContainer(false);
            } else {
              setShowDropdown((prevShowDropdown) => !prevShowDropdown);
            }
            if (markdownContent) {
              setMarkdownContent(''); // Close markdown content when logo is clicked
             
            }
            if (pdfContent) {
             
              setPdfContent(null); // Close PDF content when logo is clicked
             
            }
          }}
        />
        {showDropdown && (
          <div ref={dropdownRef} className="absolute top-24 right-0 bg-white border border-gray-300 shadow-lg px-2 py-2 rounded-lg z-50">
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
            <div
              className="flex cursor-pointer mb-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition duration-300"
              onClick={handleMarkdownSelect}
            >
              <span className="text-sm white-space-nowrap mr-16 items-start text-gray-700">Data Info</span>
              <BsListColumnsReverse size={16} className="ml-2 text-red-500" />
            </div>
            <div
              className="flex cursor-pointer mb-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition duration-300"
              onClick={handlePdfSelect}
            >
              <span className="text-sm white-space-nowrap mr-16 items-start text-gray-700">Data PDF</span>
              <BsListColumnsReverse size={16} className="ml-2 text-blue-500" />
            </div>
          </div>
        )}
      </div>
      {showDatasetContainer && (
        <div className={`p-4 normalized-container h-[85vh] border border-gray-300 absolute top-20 right-4 bg-white header-data ${viewNormalizedData ? 'w-full' : 'w-[300px]'} max-w-full`}>
          <div className="flex justify-between mb-4">
            {!viewNormalizedData ? (
              <>
                <div className="relative">
                  <CopyTooltip text="Copy Data">
                    <button onClick={copyJSONToClipboard} className="focus:outline-none">
                      <IoCopy size={24} className="text-gray-500" />
                    </button>
                  </CopyTooltip>
                  {copySuccess && <span className="text-green-500 text-sm">Copied to Clipboard!</span>}
                </div>
              </>
            ) : (
              <button onClick={() => setShowDatasetContainer(false)} className="focus:outline-none">
               <MdCancel size={16} className="text-gray-500" />
              </button>
            )}
          </div>
          {!viewNormalizedData ? (
            <pre className="text-xs whitespace-pre-wrap">{dataset ? JSON.stringify(dataset, null, 2) : 'No data available'}</pre>
          ) : (
            <div className="h-full ">
              <div className="">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {Object.keys(normalizedData[0] || {}).map((header) => (
                        <th key={header} className="border px-2 py-1 text-left">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {normalizedData.slice(startIndex, endIndex).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="border px-2 py-1 text-left">{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between mt-2">
                <button
                  className={`py-1 px-2 border rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  className={`py-1 px-2 border rounded ${endIndex >= normalizedData.length ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={endIndex >= normalizedData.length}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {markdownContent && (
        <div className="w-full h-[85vh] border border-gray-300 absolute top-20 right-4 bg-white p-4 mark-down-data">
            <button onClick={() => setMarkdownContent('')} className="text-gray-500">
              <MdCancel size={16} />
            </button>
          <div className="w-full h-full ">
            <ReactMarkdown>{markdownContent}</ReactMarkdown>
          </div>
        </div>
      )}
      {pdfContent && (
        <div className="w-full h-[85vh] border border-gray-300 absolute top-20 right-4 bg-white p-4 pdf-container ">
          <div className=" p-4 rounded-lg shadow-lg w-full h-full ">
            <iframe src={pdfContent} title="Data PDF" className="w-full h-full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
