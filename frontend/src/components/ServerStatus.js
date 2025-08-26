import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip,
  CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { clientAPI } from '../services/api';

function ServerStatus() {
  const [status, setStatus] = useState({
    moscow: { connected: false, clientsCount: 0 },
    germany: { connected: false, clientsCount: 0 }
  });
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const response = await clientAPI.getServerStatus();
      if (response.success) {
        setStatus(response.data);
      }
    } catch (err) {
      console.error('Error fetching server status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={20} />
          <Typography>Checking server status...</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Server Status
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">Moscow:</Typography>
          <Chip
            icon={status.moscow.connected ? <CheckCircleIcon /> : <ErrorIcon />}
            label={status.moscow.connected ? 'Connected' : 'Disconnected'}
            color={status.moscow.connected ? 'success' : 'error'}
            size="small"
          />
          {status.moscow.connected && (
            <Typography variant="body2" color="text.secondary">
              ({status.moscow.clientsCount} clients)
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">Germany:</Typography>
          <Chip
            icon={status.germany.connected ? <CheckCircleIcon /> : <ErrorIcon />}
            label={status.germany.connected ? 'Connected' : 'Disconnected'}
            color={status.germany.connected ? 'success' : 'error'}
            size="small"
          />
          {status.germany.connected && (
            <Typography variant="body2" color="text.secondary">
              ({status.germany.clientsCount} clients)
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default ServerStatus;