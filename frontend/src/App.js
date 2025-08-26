import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Header from './components/Header';
import ClientForm from './components/ClientForm';
import ClientList from './components/ClientList';
import ServerStatus from './components/ServerStatus';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [refreshList, setRefreshList] = useState(0);

  const handleClientCreated = () => {
    setRefreshList(prev => prev + 1);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <ServerStatus />
          <Routes>
            <Route path="/" element={
              <>
                <ClientForm onClientCreated={handleClientCreated} />
                <ClientList key={refreshList} />
              </>
            } />
            <Route path="/admin" element={
              <>
                <ClientForm onClientCreated={handleClientCreated} />
                <ClientList key={refreshList} />
              </>
            } />
            <Route path="*" element={
              <>
                <ClientForm onClientCreated={handleClientCreated} />
                <ClientList key={refreshList} />
              </>
            } />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;