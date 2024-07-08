import React, { useState, useEffect } from 'react';
import logo from '../iced.png';
import { motion, useAnimationControls } from 'framer-motion';
import DatasetMenu from '../DatasetMenu';

import 'react-toastify/dist/ReactToastify.css';

const containerVariants = {
  close: {
    width: '7rem',
    transition: {
      type: 'spring',
      damping: 15,
      duration: 0.2,
    },
  },
  open: {
    width: '16rem',
    transition: {
      type: 'spring',
      damping: 15,
      duration: 0.2,
    },
  },
};

const svgVariants = {
  close: {
    rotate: 360,
  },
  open: {
    rotate: 180,
  },
};

const SideBar = ({ onSelectDataset, setSidebarWidth }) => {
  const [isOpen, setIsOpen] = useState(true);
  const containerControls = useAnimationControls();
  const svgControls = useAnimationControls();

  useEffect(() => {
    if (isOpen) {
      containerControls.start('open');
      svgControls.start('open');
      setSidebarWidth('16rem');
    } else {
      containerControls.start('close');
      svgControls.start('close');
      setSidebarWidth('7rem');
    }
  }, [isOpen, containerControls, svgControls, setSidebarWidth]);

  const handleOpenClose = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <motion.nav
        variants={containerVariants}
        animate={containerControls}
        initial="open"
        className={`bg-[#f9f9f9] flex flex-col  p-3 sidebar shadow shadow-neutral-600 h-screen ${isOpen ? '' : ''}`}
      >


        <div className={`flex flex-row w-full place-items-center ${isOpen ? 'justify-between' : 'gap-2'}`}>
          <img src={logo} alt="ICED Logo" style={{ width: '30px', height: '30px' }} />

          <button className="rounded-full flex" onClick={handleOpenClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="w-6 h-6 text-[#4e4d4d]"
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={svgVariants}
                animate={svgControls}
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                transition={{
                  duration: 0.5,
                  ease: 'easeInOut',
                }}
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-3 ">
          <h2 className={`text-[#4e4d4d] mt-12 font-semibold  ${isOpen ? 'text-2xl ' : 'text-md '}`}>
            DATASETS
          </h2>

          <DatasetMenu onSelectDataset={onSelectDataset} isOpen={isOpen} className="dataset-data"  />
        </div>
      </motion.nav>
    </>
  );
};

export default SideBar;
