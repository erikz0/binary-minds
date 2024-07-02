import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCode, FaTimes } from 'react-icons/fa';
import { RiDownloadCloudFill } from "react-icons/ri";
import { IoCopy } from "react-icons/io5";
import config from '../config';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CopyTooltip from './CopyTooltip';
import DownloadTooltip from './DownloadTooltip';  // Import your custom tooltip component

const Header = ({ selectedDataset }) => {
  const [showJSON, setShowJSON] = useState(false);
  const [dataset, setDataset] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDataset = async () => {
      setLoading(true);
      setError(null);
      if (selectedDataset) {
        try {
          const token = localStorage.getItem('token');
          const dataResponse = await axios.get(`${config.serverUrl}/metadata/data/${selectedDataset.package}/${selectedDataset.file}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setDataset(dataResponse.data);
        } catch (error) {
          console.error('Error loading data:', error);
          setError('Error loading data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDataset();
  }, [selectedDataset]);

  const toggleJSON = () => {
    setShowJSON((prevShowJSON) => !prevShowJSON);
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

  const copyJSONToClipboard = () => {
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

  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-300 relative">
      <h1 className="text-lg font-bold">ICED CHAT</h1>
      <div>
        <button onClick={toggleJSON} className="mr-4 focus:outline-none">
          {showJSON ? <FaTimes size={24} /> : <FaCode size={24} />}
        </button>
      </div>
      {showJSON && dataset && (
        <div className="p-4 overflow-auto h-[80vh] w-[300px] max-w-full border border-gray-300 absolute top-20 right-4 bg-white z-50">
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
          {copySuccess && (
            <p className="text-green-500 mb-4">Data copied to clipboard!</p>
          )}
          <pre className="whitespace-pre-wrap break-all w-[300px]">{JSON.stringify(dataset, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Header;
