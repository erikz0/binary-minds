import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import config from './config';

const useStyles = makeStyles({
  listItem: {
    '&:hover': {
      backgroundColor: '#d3d3d3', // Darker gray for more visibility
      color: '#000000', // Black text color
      border: '1px solid #000000', // Black border
      cursor: 'pointer',
    },
  },
});

const DatasetMenu = ({ onSelectDataset }) => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const classes = useStyles();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.serverUrl}/data/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDatasets(response.data);
        setLoading(false);
      } catch (error) {
        setError('Error fetching datasets');
        setLoading(false);
      }
    };

    fetchDatasets();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box my={4} p={3} border={1} borderRadius={5} style={{ backgroundColor: '#ffffff', borderColor: '#000000' }}>
      <Typography variant="h5" gutterBottom>
        Select a Dataset
      </Typography>
      <List>
        {datasets.map((dataset, index) => (
          <ListItem
            key={index}
            button
            onClick={() => {
              onSelectDataset(dataset);
              navigate('/chat');
            }}
            className={classes.listItem}
          >
            <ListItemText
              primary={`${dataset.package}/${dataset.file}`}
              secondary={dataset.description}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default DatasetMenu;