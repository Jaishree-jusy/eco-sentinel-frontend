import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AppLayout } from '@/layouts/AppLayout';

import { AuthProvider } from '@/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Authentication
import Login from '@/pages/auth/Login';
import GovernmentLogin from '@/pages/auth/GovernmentLogin';
import CommunityAuth from '@/pages/auth/CommunityAuth';

// Dashboard
import Dashboard from '@/pages/Dashboard';

// Geospatial
import SatelliteViewer from '@/pages/geospatial/SatelliteViewer';
import NDVIPage from '@/pages/geospatial/NDVIPage';
import ChangeDetection from '@/pages/geospatial/ChangeDetection';
import ForestLayers from '@/pages/geospatial/ForestLayers';
import EnvironmentalData from '@/pages/geospatial/EnvironmentalData';

// AI Detection
import AIDetection from '@/pages/ai/AIDetection';
import ModelPerformance from '@/pages/ai/ModelPerformance';
import AnomalyDetection from '@/pages/ai/AnomalyDetection';
import TrainingData from '@/pages/ai/TrainingData';

// Alerts
import ActiveAlerts from '@/pages/alerts/ActiveAlerts';
import RiskAssessment from '@/pages/alerts/RiskAssessment';
import AlertNotifications from '@/pages/alerts/AlertNotifications';
import DecisionRules from '@/pages/alerts/DecisionRules';
import AlertDetail from '@/pages/alerts/AlertDetail';

// Polygons
import PolygonsList from '@/pages/polygons/PolygonsList';
import PolygonDetail from '@/pages/polygons/PolygonDetail';

// Evidence
import EvidenceList from '@/pages/evidence/EvidenceList';
import EvidenceDetail from '@/pages/evidence/EvidenceDetail';

// Blockchain
import BlockchainOverview from '@/pages/blockchain/BlockchainOverview';
import ForestLossRecords from '@/pages/blockchain/ForestLossRecords';
import BlockchainEvidence from '@/pages/blockchain/BlockchainEvidence';
import BlockchainExplorer from '@/pages/blockchain/BlockchainExplorer';
import RecordDetail from '@/pages/blockchain/RecordDetail';

// Analytics
import AnalyticsDashboard from '@/pages/analytics/AnalyticsDashboard';
import AnalyticsReports from '@/pages/analytics/AnalyticsReports';
import AnalyticsExport from '@/pages/analytics/AnalyticsExport';

// Government
import GovernmentDashboard from '@/pages/government/GovernmentDashboard';
import GovernmentAlerts from '@/pages/government/GovernmentAlerts';
import GovernmentMLDetections from '@/pages/government/GovernmentDetection';
import GovernmentAnalytics from '@/pages/government/GovernmentAnalytics';
import GovernmentEvidence from '@/pages/government/GovernmentEvidence';
import GovernmentBlockchain from '@/pages/government/GovernmentBlockchain';
import GovernmentLiveMonitoring from '@/pages/government/GovernmentLiveMonitoring';
import GovernmentCommunityReports from '@/pages/government/GovernmentCommunityReports';

// Community / NGO
import NGODashboard from '@/pages/ngo/NGODashboard';
import NGOAlerts from '@/pages/ngo/NGOAlerts';
import NGOTrends from '@/pages/ngo/NGOTrends';
import NGOAwareness from '@/pages/ngo/NGOAwareness';
import NGOReport from '@/pages/ngo/NGOReport';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* =====================================================
              AUTHENTICATION
          ====================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/login/government"
            element={<GovernmentLogin />}
          />

          <Route
            path="/login/community"
            element={<CommunityAuth />}
          />

          {/* =====================================================
              GOVERNMENT / AUTHORIZED PORTAL
          ====================================================== */}

          <Route
            element={
              <ProtectedRoute allowedRole="government" />
            }
          >

            <Route element={<AppLayout />}>

              {/* ==================== OVERVIEW ==================== */}

              <Route
                path="/"
                element={
                  <Navigate
                    to="/government/dashboard"
                    replace
                  />
                }
              />

              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              {/* ==================== GEOSPATIAL ==================== */}

              <Route
                path="/geospatial"
                element={
                  <Navigate
                    to="/geospatial/satellite-viewer"
                    replace
                  />
                }
              />

              <Route
                path="/geospatial/satellite-viewer"
                element={<SatelliteViewer />}
              />

              <Route
                path="/geospatial/ndvi"
                element={<NDVIPage />}
              />

              <Route
                path="/geospatial/change-detection"
                element={<ChangeDetection />}
              />

              <Route
                path="/geospatial/forest-layers"
                element={<ForestLayers />}
              />

              <Route
                path="/geospatial/environmental-data"
                element={<EnvironmentalData />}
              />

              {/* ==================== AI DETECTION ==================== */}

              <Route
                path="/ai"
                element={
                  <Navigate
                    to="/ai/detection"
                    replace
                  />
                }
              />

              <Route
                path="/ai/detection"
                element={<AIDetection />}
              />

              <Route
                path="/ai/model-performance"
                element={<ModelPerformance />}
              />

              <Route
                path="/ai/anomaly-detection"
                element={<AnomalyDetection />}
              />

              <Route
                path="/ai/training-data"
                element={<TrainingData />}
              />

              {/* ==================== ALERTS ==================== */}

              <Route
                path="/alerts"
                element={
                  <Navigate
                    to="/alerts/active"
                    replace
                  />
                }
              />

              <Route
                path="/alerts/active"
                element={<ActiveAlerts />}
              />

              <Route
                path="/alerts/risk-assessment"
                element={<RiskAssessment />}
              />

              <Route
                path="/alerts/notifications"
                element={<AlertNotifications />}
              />

              <Route
                path="/alerts/decision-rules"
                element={<DecisionRules />}
              />

              <Route
                path="/alerts/:alertId"
                element={<AlertDetail />}
              />

              {/* ==================== POLYGONS ==================== */}

              <Route
                path="/polygons"
                element={<PolygonsList />}
              />

              <Route
                path="/polygons/:polygonId"
                element={<PolygonDetail />}
              />

              {/* ==================== EVIDENCE ==================== */}

              <Route
                path="/evidence"
                element={<EvidenceList />}
              />

              <Route
                path="/evidence/:evidenceId"
                element={<EvidenceDetail />}
              />

              {/* ==================== BLOCKCHAIN ==================== */}

              <Route
                path="/blockchain"
                element={<BlockchainOverview />}
              />

              <Route
                path="/blockchain/forest-loss-records"
                element={<ForestLossRecords />}
              />

              <Route
                path="/blockchain/evidence"
                element={<BlockchainEvidence />}
              />

              <Route
                path="/blockchain/explorer"
                element={<BlockchainExplorer />}
              />

              <Route
                path="/blockchain/record/:recordId"
                element={<RecordDetail />}
              />

              {/* ==================== ANALYTICS ==================== */}

              <Route
                path="/analytics"
                element={
                  <Navigate
                    to="/analytics/dashboard"
                    replace
                  />
                }
              />

              <Route
                path="/analytics/dashboard"
                element={<AnalyticsDashboard />}
              />

              <Route
                path="/analytics/reports"
                element={<AnalyticsReports />}
              />

              <Route
                path="/analytics/export"
                element={<AnalyticsExport />}
              />

              {/* ==================== GOVERNMENT PORTAL ==================== */}

              <Route
                path="/government"
                element={
                  <Navigate
                    to="/government/dashboard"
                    replace
                  />
                }
              />

              <Route
                path="/government/dashboard"
                element={<GovernmentDashboard />}
              />

              <Route
                path="/government/alerts"
                element={<GovernmentAlerts />}
              />

              <Route
                path="/government/ml-detections"
                element={<GovernmentMLDetections />}
              />

              <Route
                path="/government/analytics"
                element={<GovernmentAnalytics />}
              />

              <Route
                path="/government/evidence"
                element={<GovernmentEvidence />}
              />

              <Route
                path="/government/blockchain"
                element={<GovernmentBlockchain />}
              />

              <Route
                path="/government/live-monitoring"
                element={<GovernmentLiveMonitoring />}
              />

              <Route
                path="/government/community-reports"
                element={<GovernmentCommunityReports />}
              />

            </Route>

          </Route>

          {/* =====================================================
              COMMUNITY PORTAL
          ====================================================== */}

          <Route
            element={
              <ProtectedRoute allowedRole="community" />
            }
          >

            <Route element={<AppLayout />}>

              {/* ==================== COMMUNITY / NGO ==================== */}

              <Route
                path="/ngo"
                element={
                  <Navigate
                    to="/ngo/dashboard"
                    replace
                  />
                }
              />

              <Route
                path="/ngo/dashboard"
                element={<NGODashboard />}
              />

              <Route
                path="/ngo/alerts"
                element={<NGOAlerts />}
              />

              <Route
                path="/ngo/trends"
                element={<NGOTrends />}
              />

              <Route
                path="/ngo/awareness"
                element={<NGOAwareness />}
              />

              <Route
                path="/ngo/report"
                element={<NGOReport />}
              />

            </Route>

          </Route>

          {/* =====================================================
              FALLBACK
          ====================================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}