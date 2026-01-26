import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import MapView from './components/MapView/MapView';
import SupplierDetail from './components/SupplierDetail/SupplierDetail';

function App() {
  return (
    <BrowserRouter basename="/RADAR-UI">
      <Routes>
        <Route
          path="/"
          element={
            <Layout showAlertFeed={true}>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/map"
          element={
            <Layout showAlertFeed={true}>
              <MapView />
            </Layout>
          }
        />
        <Route
          path="/supplier/:id"
          element={
            <Layout showAlertFeed={false}>
              <SupplierDetail />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
