// /* eslint-disable no-unused-vars */
// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import ReactMarkdown from 'react-markdown';
// import { FaCode } from 'react-icons/fa';
// import { RiDownloadCloudFill } from 'react-icons/ri';
// import { IoCopy } from 'react-icons/io5';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import config from '../config';
// import CopyTooltip from './CopyTooltip';
// import DownloadTooltip from './DownloadTooltip';
// import { BsListColumnsReverse } from "react-icons/bs";

// const Header = ({ selectedDataset, setSelectedDataset }) => {
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [dataset, setDataset] = useState(null);
//   const [normalizedData, setNormalizedData] = useState([]);
//   const [copySuccess, setCopySuccess] = useState(false);
//   const [loadingDataset, setLoadingDataset] = useState(false);
//   const [loadingNormalizedData, setLoadingNormalizedData] = useState(false);
//   const [errorDataset, setErrorDataset] = useState(null);
//   const [errorNormalizedData, setErrorNormalizedData] = useState(null);
//   const [showDatasetContainer, setShowDatasetContainer] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [viewNormalizedData, setViewNormalizedData] = useState(false);
//   const [markdownContent, setMarkdownContent] = useState(''); // State to store Markdown content

//   const dropdownRef = useRef(null);
//   const pageSize = 170; // Define pageSize for pagination

//   useEffect(() => {
//     const fetchDataset = async () => {
//       setLoadingDataset(true);
//       setErrorDataset(null);
//       if (selectedDataset) {
//         try {
//           const token = localStorage.getItem('token');
//           const dataResponse = await axios.get(`${config.serverUrl}/metadata/data/${selectedDataset.package}/${selectedDataset.file}`, {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           });
//           setDataset(dataResponse.data);
//           setShowDatasetContainer(false); // Close dataset container initially when dataset changes
//         } catch (error) {
//           console.error('Error loading data:', error);
//           setErrorDataset('Error loading data');
//         } finally {
//           setLoadingDataset(false);
//         }
//       }
//     };

//     fetchDataset();
//   }, [selectedDataset]);

//   const fetchNormalizedData = async () => {
//     setLoadingNormalizedData(true);
//     setErrorNormalizedData(null);
//     try {
//       const token = localStorage.getItem('token');
//       const normalizedDataResponse = await axios.get(`${config.serverUrl}/normalized-data/${selectedDataset.package}/${selectedDataset.file}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
  
//       // No need to parse CSV since the response is already JSON
//       setNormalizedData(normalizedDataResponse.data);
//       setLoadingNormalizedData(false);
//       setShowDatasetContainer(true);
//       setShowDropdown(false);
//       setViewNormalizedData(true);
//       setCurrentPage(1);
//     } catch (error) {
//       console.error('Error loading normalized data:', error);
//       setErrorNormalizedData('Error loading normalized data');
//       setLoadingNormalizedData(false);
//     }
//   };

//   const fetchMarkdownDataInfo = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const markdownResponse = await axios.get(`${config.serverUrl}/data-info/${selectedDataset.package}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setMarkdownContent(markdownResponse.data);
//     } catch (error) {
//       console.error('Error fetching Markdown data info:', error);
//     }
//   };

//   const handleDatasetSelect = (dataset) => {
//     setSelectedDataset(dataset);
//     setShowDropdown(false);
//     setShowDatasetContainer(true);
//     setNormalizedData([]);
//     setCurrentPage(1);
//     setViewNormalizedData(false);
//   };

//   const handleNormalizedDataSelect = () => {
//     fetchNormalizedData();
//   };

//   const handleMarkdownSelect = () => {
//     fetchMarkdownDataInfo();
//   };

//   const copyJSONToClipboard = () => {
//     if (!dataset) return;
//     navigator.clipboard.writeText(JSON.stringify(dataset, null, 2));
//     setCopySuccess(true);
//     setTimeout(() => {
//       setCopySuccess(false);
//     }, 3000); // Reset copy success message after 3 seconds
//   };

//   const downloadMarkdown = () => {
//     if (!markdownContent) return;

//     const blob = new Blob([markdownContent], { type: 'text/markdown' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'data_info.md';
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };

//   const startIndex = (currentPage - 1) * pageSize;
//   const endIndex = currentPage * pageSize;

//   return (
//     <div className="flex justify-between items-center border-b border-gray-300 relative">
//       <h1 className="text-lg font-bold max-[480px]:text-sm">ICED DATASET</h1>
//       <div className="relative">
//         <img
//           src="./assets/images/binary-insight-logo--.png"
//           alt="Binary Insight Logo"
//           className="cursor-pointer object-cover  w-[7rem]"
//           onClick={() => {
//             if (!selectedDataset) {
//               toast.error("Please select a dataset first.");
//               return;
//             }
//             if (showDatasetContainer) {
//               setShowDatasetContainer(false);
//             } else {
//               setShowDropdown((prevShowDropdown) => !prevShowDropdown);
//             }
//           }}
//         />
//         {showDropdown && (
//           <div ref={dropdownRef} className="absolute top-24 right-0 bg-white border border-gray-300 shadow-lg px-2 py-2 rounded-lg z-50">
//             <div
//               className="flex cursor-pointer mb-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition duration-300"
//               onClick={() => handleDatasetSelect(selectedDataset)}
//             >
//               <span className="text-sm mr-16 items-start text-gray-700">Dataset {selectedDataset ? selectedDataset.name : 'No dataset selected'}</span>
//               <FaCode size={16} className="ml-8 text-yellow-500" />
//             </div>
//             <div
//               className="flex cursor-pointer mb-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition duration-300"
//               onClick={handleNormalizedDataSelect}
//             >
//               <span className="text-sm white-space-nowrap mr-16 items-start text-gray-700">Normalized</span>
//               <BsListColumnsReverse size={16} className="ml-2 text-green-500" />
//             </div>
//             <div
//               className="flex cursor-pointer mb-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition duration-300"
//               onClick={handleMarkdownSelect}
//             >
//               <span className="text-sm white-space-nowrap mr-16 items-start text-gray-700">Data Info</span>
//               <BsListColumnsReverse size={16} className="ml-2 text-red-500" />
//             </div>
//           </div>
//         )}
//       </div>
//       {showDatasetContainer && (
//         <div className={`p-4 overflow-auto h-[80vh] border border-gray-300 absolute top-20 right-4 bg-white header-data ${viewNormalizedData ? 'w-full' : 'w-[300px]'} max-w-full`}>
//           <div className="flex justify-between mb-4">
//             {!viewNormalizedData ? (
//               <>
//                 <div className="relative">
//                   <CopyTooltip text="Copy Data">
//                     <button onClick={copyJSONToClipboard} className="focus:outline-none">
//                       <IoCopy size={24} className="text-gray-500" />
//                     </button>
//                   </CopyTooltip>
//                   {copySuccess && <span className="text-green-500 text-sm">Copied!</span>}
//                 </div>
//                 <DownloadTooltip text="Download Markdown">
//                   <button onClick={downloadMarkdown} className="focus:outline-none">
//                     <RiDownloadCloudFill size={24} className="text-gray-500" />
//                   </button>
//                 </DownloadTooltip>
//               </>
//             ) : (
//               <button onClick={() => setShowDatasetContainer(false)} className="focus:outline-none">
//                 Close
//               </button>
//             )}
//           </div>
//           {!viewNormalizedData ? (
//             <div className="text-xs overflow-y-auto">
//               <pre className="whitespace-pre-wrap">{JSON.stringify(dataset, null, 2)}</pre>
//             </div>
//           ) : (
//             <div>
//               {loadingNormalizedData ? (
//                 <p>Loading normalized data...</p>
//               ) : errorNormalizedData ? (
//                 <p>{errorNormalizedData}</p>
//               ) : (
//                 <div className="overflow-auto">
//                   <table className="w-full border-collapse">
//                     <thead>
//                       <tr>
//                         {Object.keys(normalizedData[0] || {}).map((key) => (
//                           <th key={key} className="border p-2 text-xs">
//                             {key}
//                           </th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {normalizedData.slice(startIndex, endIndex).map((row, index) => (
//                         <tr key={index}>
//                           {Object.values(row).map((value, idx) => (
//                             <td key={idx} className="border p-2 text-xs">
//                               {value}
//                             </td>
//                           ))}
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                   <div className="flex justify-center mt-4">
//                     {Array.from({ length: Math.ceil(normalizedData.length / pageSize) }, (_, i) => i + 1).map((page) => (
//                       <button
//                         key={page}
//                         onClick={() => handlePageChange(page)}
//                         className={`px-3 py-1 mx-1 border ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
//                       >
//                         {page}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

          
//         </div>
//       )}
//     </div>
//   );
// };

// export default Header;


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
  const [viewNormalizedData, setViewNormalizedData] = useState(false);
  const [markdownContent, setMarkdownContent] = useState(''); // State to store Markdown content

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
    setLoadingNormalizedData(true);
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
      setLoadingNormalizedData(false);
    }
  };

  const fetchMarkdownDataInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const markdownResponse = await axios.get(`${config.serverUrl}/data-info/${selectedDataset.package}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMarkdownContent(markdownResponse.data);
    } catch (error) {
      console.error('Error fetching Markdown data info:', error);
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

  const copyJSONToClipboard = () => {
    if (!dataset) return;
    navigator.clipboard.writeText(JSON.stringify(dataset, null, 2));
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 3000); // Reset copy success message after 3 seconds
  };

  const downloadMarkdown = () => {
    if (!markdownContent) return;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data_info.md';
    a.click();
    URL.revokeObjectURL(url);
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
           src={bmlogo}
           alt="Binary Insight Logo"
           className="cursor-pointer object-cover  w-[7rem]"
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
                  {copySuccess && <span className="text-green-500 text-sm">Copied to Clipboard!</span>}
                </div>
                {/* <DownloadTooltip text="Download Dataset">
                  <button onClick={downloadMarkdown} className="focus:outline-none">
                    <RiDownloadCloudFill size={24} className="text-gray-500" />
                  </button>
                </DownloadTooltip> */}
              </>
            ) : (
              // <button
              //   className="text-gray-500 underline"
              //   onClick={() => {
              //     setViewNormalizedData(false);
              //     setNormalizedData([]);
              //   }}
              // >
              //   Back to Dataset
              // </button>

              <button onClick={() => setShowDatasetContainer(false)} className="focus:outline-none">
                               Close
                            </button>
            )}
          </div>
          {!viewNormalizedData ? (
            <pre className="text-xs whitespace-pre-wrap">{dataset ? JSON.stringify(dataset, null, 2) : 'No data available'}</pre>
          ) : (
            <div className=" h-full ">
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
        <div className="w-full h-[70vh] border border-gray-300 absolute top-20 right-4 bg-white p-4 overflow-auto z-50">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setMarkdownContent('')} className="text-gray-500">
            <MdCancel size={16} />
            </button>
            <DownloadTooltip text="Download Markdown">
            <button onClick={downloadMarkdown} className="text-gray-500">
              <RiDownloadCloudFill size={24} />
            </button>
            </DownloadTooltip>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-lg w-full h-full overflow-auto">
            <ReactMarkdown>{markdownContent}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;