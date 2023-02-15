import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';
import { ThemeProvider, StyledEngineProvider } from '@mui/material';
import StylesProvider from '@mui/styles/StylesProvider';
import { theme } from './theme';
import Unauthorized from './components/Unauthorized';
import Authorized from './components/Authorized';
import './App.css';

import CloudentityAuth from '@cloudentity/auth';
import authConfig from './authConfig';
import { useAuth } from './auth';

function App() {
  const cloudentity = new CloudentityAuth(authConfig);
  const [authenticated] = useAuth(cloudentity);

  function authorize () {
    cloudentity.authorize();
  };

  function clearAuth () {
    cloudentity.revokeAuth()
      .then(() => {
        window.location.reload();
      })
      .catch(() => {
        window.location.reload();
      });
  };

  return (
    <>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <StylesProvider injectFirst>
            <div>
              <BrowserRouter>
                <Routes>
                  <Route index element={<Unauthorized className="App" auth={authenticated} handleLogin={authorize} />} />
                  <Route path="login" element={<Unauthorized role="login" className="App" auth={authenticated} handleLogin={authorize} />} />
                  <Route path="register" element={<Unauthorized role="register" className="App" auth={authenticated} handleLogin={authorize} />} />
                  <Route path="authorized" element={<Authorized auth={authenticated} handleLogout={clearAuth} />} />
                </Routes>
              </BrowserRouter>
            </div>
          </StylesProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </>
  );
};

export default App;
