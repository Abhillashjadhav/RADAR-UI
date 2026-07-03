import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import MapView from './components/MapView/MapView';
import SupplierDetail from './components/SupplierDetail/SupplierDetail';
import TeamsCardPreview from './components/Signal/TeamsCardPreview';
import SignalsHub from './components/Signal/SignalsHub';
import NetworkView from './components/NetworkView/NetworkView';
import RiskMonitor from './components/RiskMonitor/RiskMonitor';
import ComingSoon from './components/Layout/ComingSoon';
import ChatHome from './components/Home/ChatHome';
import DataMapper from './components/DataMapper/DataMapper';
import SupplierRiskAssessment from './components/SupplierRisk/SupplierRiskAssessment';
import { QSC_LIVE_NETWORK } from './data/liveNetworkData';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout showAlertFeed={false} breadcrumb={['HOME']}>
              <ChatHome />
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout showAlertFeed={true} breadcrumb={['RADAR', 'DASHBOARD']}>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/data-mapper"
          element={
            <Layout showAlertFeed={false} breadcrumb={['RADAR', 'DATA MAPPER']}>
              <DataMapper />
            </Layout>
          }
        />
        <Route
          path="/supplier-risk"
          element={
            <Layout showAlertFeed={false} breadcrumb={['RADAR', 'SUPPLIER RISK ASSESSMENT']}>
              <SupplierRiskAssessment />
            </Layout>
          }
        />
        <Route
          path="/map"
          element={
            <Layout showAlertFeed={true} breadcrumb={['RADAR', 'SUPPLY CHAIN MAP']}>
              <MapView />
            </Layout>
          }
        />
        <Route
          path="/supplier/:id"
          element={
            <Layout showAlertFeed={false} breadcrumb={['RADAR', 'SUPPLIER RISK']}>
              <SupplierDetail />
            </Layout>
          }
        />
        <Route
          path="/risk-monitor"
          element={
            <Layout showAlertFeed={true} breadcrumb={['RADAR', 'RISK MONITOR']}>
              <RiskMonitor />
            </Layout>
          }
        />
        <Route
          path="/network"
          element={
            <Layout showAlertFeed={false} breadcrumb={['RADAR', 'SUBTIER NETWORK']}>
              <NetworkView />
            </Layout>
          }
        />
        <Route
          path="/network-live"
          element={
            <Layout showAlertFeed={false} breadcrumb={['RADAR', 'QSC LIVE']}>
              <NetworkView
                root={QSC_LIVE_NETWORK}
                title="QSC Sub-Tier Network"
                subtitle="QSC Aerospace · live customer BOM · 792 parts → 132 tier-1 suppliers"
                dataSource="live"
              />
            </Layout>
          }
        />
        <Route
          path="/signals"
          element={
            <Layout showAlertFeed={false} breadcrumb={['SIGNAL', 'ANOMALY FEED']}>
              <SignalsHub />
            </Layout>
          }
        />
        <Route
          path="/soon/:feature"
          element={
            <Layout showAlertFeed={false} breadcrumb={['COMING SOON']}>
              <ComingSoon />
            </Layout>
          }
        />
        <Route
          path="/preview/teams-card"
          element={
            <Layout showAlertFeed={false} breadcrumb={['SIGNAL', 'TEAMS CARD']}>
              <TeamsCardPreview />
            </Layout>
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
