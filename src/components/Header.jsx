import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaCode } from 'react-icons/fa';
import { RiDownloadCloudFill } from 'react-icons/ri';
import { IoCopy } from 'react-icons/io5';
import config from '../config';
import Papa from 'papaparse'; // Import papaparse for CSV parsing
import CopyTooltip from './CopyTooltip';
import DownloadTooltip from './DownloadTooltip';
import { BsListColumnsReverse } from "react-icons/bs";
import { jsPDF } from 'jspdf';

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
  const [pdfUrl, setPdfUrl] = useState('');

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
        responseType: 'text', // Ensure response type is text
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
          </div>
        )}
      </div>
      {showDatasetContainer && (
         <div className={`p-4 overflow-auto h-[80vh] border border-gray-300 absolute top-20 right-4 bg-white header-data ${viewNormalizedData ? 'w-full' : 'w-[300px]'} max-w-full`}>
          <div className="flex justify-between mb-4">
            <button
              onClick={() => setViewNormalizedData(false)}
              className={`px-2 py-1 rounded-lg ${!viewNormalizedData ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
               Dataset
            </button>
            {normalizedData.length > 0 && (
              <button
                onClick={() => setViewNormalizedData(true)}
                className={`px-2 py-1 rounded-lg ${viewNormalizedData ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Normalized Data
              </button>
            )}
          </div>

          {dataset && (
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
          )}

          <div className="flex justify-between">
            {!viewNormalizedData && (
              <button
                onClick={() => setShowDatasetContainer(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Close
              </button>
            )}
            {normalizedData.length > 0 && viewNormalizedData && (
              <button
                onClick={() => setShowDatasetContainer(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg mb-4"
              >
                Close Normalized Data
              </button>
            )}
          </div>

          {loadingDataset ? (
            <p>Loading dataset...</p>
          ) : errorDataset ? (
            <p className="text-red-500">{errorDataset}</p>
          ) : (
            dataset && !viewNormalizedData && (
              <div>
                <pre>{JSON.stringify(dataset, null, 2)}</pre>
              </div>
            )
          )}

          {loadingNormalizedData ? (
            <p>Loading normalized data...</p>
          ) : errorNormalizedData ? (
            <p className="text-red-500">{errorNormalizedData}</p>
          ) : (
            normalizedData.length > 0 &&
            viewNormalizedData && (
              <div className="table-container">
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
                      <tr key={index}  className="odd:bg-white even:bg-gray-50">
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="border border-gray-300 py-2 px-4">{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-center mt-4">
                    {Array.from({ length: Math.ceil(normalizedData.length / pageSize) }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`px-2 py-1 mx-1 border rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
              </div>
            )
          )}
        </div>
      )}

      {pdfUrl && (
        <div className="absolute top-20 right-4 bg-white p-4 border border-gray-300 rounded-lg w-[600px] h-[80vh] overflow-auto">
          <object data={pdfUrl} type="application/pdf" width="100%" height="100%">
            <p>It appears you don't have a PDF plugin for this browser. No biggie... you can <a href={pdfUrl}>click here to download the PDF file.</a></p>
          </object>
          <button
            className="text-gray-500 underline mt-4"
            onClick={() => setPdfUrl('')}
          >
            Close PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
