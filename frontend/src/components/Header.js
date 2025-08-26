import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <VpnKeyIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          VPN Configuration Manager
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="body2">
            Sing-box Config Generator
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;