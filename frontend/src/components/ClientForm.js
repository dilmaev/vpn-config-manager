import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { clientAPI } from '../services/api';

function ClientForm({ onClientCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    platform: 'ios'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('Client name is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await clientAPI.create(formData);
      
      if (response.success) {
        setSuccess(`Client "${formData.name}" created successfully! Config URL: ${response.data.directUrl}`);
        setFormData({
          name: '',
          email: '',
          platform: 'ios'
        });
        onClientCreated();
      } else {
        setError(response.message || 'Failed to create client');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create New Client
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            required
            name="name"
            label="Client Name"
            value={formData.name}
            onChange={handleChange}
            sx={{ flex: 1, minWidth: 200 }}
            disabled={loading}
          />
          
          <TextField
            name="email"
            label="Email (optional)"
            type="email"
            value={formData.email}
            onChange={handleChange}
            sx={{ flex: 1, minWidth: 200 }}
            disabled={loading}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Platform</InputLabel>
            <Select
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              label="Platform"
              disabled={loading}
            >
              <MenuItem value="ios">iOS</MenuItem>
              <MenuItem value="android">Android</MenuItem>
              <MenuItem value="windows">Windows</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
            disabled={loading}
            sx={{ height: 56 }}
          >
            {loading ? 'Creating...' : 'Create Client'}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </Box>
    </Paper>
  );
}

export default ClientForm;