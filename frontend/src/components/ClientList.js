import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  Box,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import LinkIcon from '@mui/icons-material/Link';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import UpdateIcon from '@mui/icons-material/Update';
import { clientAPI } from '../services/api';

function ClientList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, client: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [regenerating, setRegenerating] = useState({});

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await clientAPI.list();
      if (response.success) {
        setClients(response.data);
      } else {
        setError('Failed to load clients');
      }
    } catch (err) {
      setError('Error loading clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async () => {
    const client = deleteDialog.client;
    try {
      const response = await clientAPI.delete(client.name);
      if (response.success) {
        setClients(clients.filter(c => c.name !== client.name));
        setDeleteDialog({ open: false, client: null });
      } else {
        setError('Failed to delete client');
      }
    } catch (err) {
      setError('Error deleting client');
    }
  };

  const handleRegenerate = async (client) => {
    setRegenerating(prev => ({ ...prev, [client.name]: true }));
    try {
      const response = await clientAPI.regenerate(client.name);
      if (response.success) {
        // Show success message
        setError('');
        alert(`Config regenerated successfully for ${client.name}`);
        // Refresh the list to get updated URLs
        await fetchClients();
      } else {
        setError(`Failed to regenerate config for ${client.name}`);
      }
    } catch (err) {
      setError(`Error regenerating config: ${err.message}`);
    } finally {
      setRegenerating(prev => ({ ...prev, [client.name]: false }));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadConfig = async (client) => {
    const configUrl = `http://localhost:3001/${client.config_file}`;
    window.open(configUrl, '_blank');
  };

  const getPlatformColor = (platform) => {
    switch (platform.toLowerCase()) {
      case 'ios':
        return 'primary';
      case 'android':
        return 'success';
      case 'windows':
        return 'info';
      default:
        return 'default';
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.platform.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography>Loading clients...</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Client List ({filteredClients.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <IconButton onClick={fetchClients} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {filteredClients.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
          No clients found. Create your first client above.
        </Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Platform</TableCell>
                <TableCell>Config URL</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={client.platform.toUpperCase()}
                      color={getPlatformColor(client.platform)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ 
                        maxWidth: 300, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {client.directUrl}
                      </Typography>
                      <Tooltip title="Copy URL">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(client.directUrl)}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(client.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Open Config URL">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => window.open(client.directUrl, '_blank')}
                      >
                        <LinkIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download Config">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => downloadConfig(client)}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Regenerate Config">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => handleRegenerate(client)}
                        disabled={regenerating[client.name]}
                      >
                        <UpdateIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Client">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, client })}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, client: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete client "{deleteDialog.client?.name}"?
          This will also remove the configuration file.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, client: null })}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default ClientList;