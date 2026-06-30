import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import MapView from './components/MapView/MapView';
import SupplierDetail from './components/SupplierDetail/SupplierDetail';
import TeamsCardPreview from './components/Signal/TeamsCardPreview';
import SignalsHub from './components/Signal/SignalsHub';
import NetworkView from './components/NetworkView/NetworkView';

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
        {/* Signal model demo views — wrapped in Layout so the TopNav stays
            present and reviewers can move between surfaces in one shell. */}
        <Route
          path="/network"
          element={
            <Layout showAlertFeed={false}>
              <NetworkView />
            </Layout>
          }
        />
        <Route
          path="/signals"
          element={
            <Layout showAlertFeed={false}>
              <SignalsHub />
            </Layout>
          }
        />
        <Route
          path="/preview/teams-card"
          element={
            <Layout showAlertFeed={false}>
              <TeamsCardPreview />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
