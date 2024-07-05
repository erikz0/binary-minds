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
  const [viewNormalizedData, setViewNormalizedData] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(''); // State to store PDF URL

  const dropdownRef = useRef(null);
  const pageSize = 170; // Define pageSize for pagination

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
      const csvData = normalizedDataResponse.data;

      Papa.parse(csvData, {
        header: true,
        complete: (results) => {
          setNormalizedData(results.data);
          setLoadingNormalizedData(false);
          setShowDatasetContainer(true);
          setShowDropdown(false);
          setViewNormalizedData(true);
          setCurrentPage(1);
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

  const fetchPdfDataInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const pdfResponse = await axios.get(`${config.serverUrl}/data-info/${selectedDataset.package}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob', // Important for handling binary data
      });
      const pdfBlob = new Blob([pdfResponse.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);
    } catch (error) {
      console.error('Error fetching PDF data info:', error);
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

  const handlePdfSelect = () => {
    fetchPdfDataInfo();
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
        cursorY = 10;
      }
      doc.text(line, 10, cursorY);
      cursorY += 10;
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
            <div
              className="flex cursor-pointer mb-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition duration-300"
              onClick={handlePdfSelect}
            >
              <span className="text-sm white-space-nowrap mr-16 items-start text-gray-700">PDF Info</span>
              <BsListColumnsReverse size={16} className="ml-2 text-red-500" />
            </div>
          </div>
        )}
      </div>
      {showDatasetContainer && (
        <div className={`p-4 overflow-auto h-[80vh] border border-gray-300 absolute top-20 right-4 bg-white header-data ${viewNormalizedData ? 'w-full' : 'w-[300px]'} max-w-full`}>
          <div className="flex justify-between mb-4">
            {!viewNormalizedData ? (
              <>
                <div className="relative">
                  <CopyTooltip text="Copy Data">
                    <button onClick={copyJSONToClipboard} className="focus:outline-none">
                      <IoCopy size={24} className="text-gray-500" />
                    </button>
                  </CopyTooltip>
                  {copySuccess && <span className="text-green-500 text-sm">Copied!</span>}
                </div>
                <DownloadTooltip text="Download PDF">
                  <button onClick={downloadPDF} className="focus:outline-none">
                    <RiDownloadCloudFill size={24} className="text-gray-500" />
                  </button>
                </DownloadTooltip>
              </>
            ) : (
              <button
                className="text-gray-500 underline"
                onClick={() => {
                  setViewNormalizedData(false);
                  setNormalizedData([]);
                }}
              >
                Back to Dataset
              </button>
            )}
          </div>
          {!viewNormalizedData ? (
            <pre className="text-xs whitespace-pre-wrap">{dataset ? JSON.stringify(dataset, null, 2) : 'No data available'}</pre>
          ) : (
            <div className="overflow-auto h-full">
              <div className="overflow-auto h-[80vh]">
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
      {pdfUrl && (
        <iframe
          src={pdfUrl}
          className="w-full h-[90vh] border border-gray-300 absolute top-20 right-4 bg-white"
          title="PDF Data Info"
        ></iframe>
      )}
    </div>
  );
};

export default Header;
