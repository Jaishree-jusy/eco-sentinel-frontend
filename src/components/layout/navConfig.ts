import type { LucideIcon } from 'lucide-react';

import {
  LayoutDashboard,
  Satellite,
  Leaf,
  ArrowLeftRight,
  Layers,
  CloudSun,
  BrainCircuit,
  Radar,
  Activity,
  Database,
  Bell,
  ShieldAlert,
  ListTree,
  Hexagon,
  FileCheck2,
  Blocks,
  BarChart3,
  FileBarChart,
  FileDown,
  Building2,
  Users,
  MapPinned,
  Radio,
  Scale,
  ClipboardCheck,
  Megaphone,
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon?: LucideIcon;
  children?: {
    label: string;
    path: string;
  }[];
}

export const NAV_SECTIONS: {
  title: string;
  items: NavItem[];
}[] = [

  // ============================================================
  // OVERVIEW
  // ============================================================

  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },

  // ============================================================
  // GEOSPATIAL
  // ============================================================

  {
    title: 'Geospatial',
    items: [
      {
        label: 'Geospatial',
        path: '/geospatial',
        icon: Satellite,
        children: [
          {
            label: 'Satellite Viewer',
            path: '/geospatial/satellite-viewer',
          },
          {
            label: 'NDVI',
            path: '/geospatial/ndvi',
          },
          {
            label: 'Change Detection',
            path: '/geospatial/change-detection',
          },
          {
            label: 'Forest Layers',
            path: '/geospatial/forest-layers',
          },
          {
            label: 'Environmental Data',
            path: '/geospatial/environmental-data',
          },
        ],
      },
    ],
  },

  // ============================================================
  // AI DETECTION
  // ============================================================

  {
    title: 'AI Detection',
    items: [
      {
        label: 'AI Detection',
        path: '/ai',
        icon: BrainCircuit,
        children: [
          {
            label: 'Detection',
            path: '/ai/detection',
          },
          {
            label: 'Model Performance',
            path: '/ai/model-performance',
          },
          {
            label: 'Training Data',
            path: '/ai/training-data',
          },
        ],
      },
    ],
  },

  // ============================================================
  // ALERTS
  // ============================================================

  {
    title: 'Alerts',
    items: [
      {
        label: 'Alerts',
        path: '/alerts',
        icon: ShieldAlert,
        children: [
          {
            label: 'Active Alerts',
            path: '/alerts/active',
          },
          {
            label: 'Risk Assessment',
            path: '/alerts/risk-assessment',
          },
          {
            label: 'Notifications',
            path: '/alerts/notifications',
          },
          {
            label: 'Decision Rules',
            path: '/alerts/decision-rules',
          },
        ],
      },
    ],
  },

  // ============================================================
  // DETECTIONS
  // ============================================================

  {
    title: 'Detections',
    items: [
      {
        label: 'Polygons',
        path: '/polygons',
        icon: Hexagon,
      },
      {
        label: 'Evidence',
        path: '/evidence',
        icon: FileCheck2,
      },
    ],
  },

  // ============================================================
  // GOVERNMENT PORTAL
  // ============================================================

  {
    title: 'Government Portal',
    items: [
      {
        label: 'Government',
        path: '/government',
        icon: Building2,
        children: [
          {
            label: 'Government Dashboard',
            path: '/government/dashboard',
          },
          {
            label: 'Alerts',
            path: '/government/alerts',
          },
          {
            label: 'ML Detections',
            path: '/government/ml-detections',
          },
          {
            label: 'Analytics',
            path: '/government/analytics',
          },
          {
            label: 'Evidence',
            path: '/government/evidence',
          },
          {
            label: 'Blockchain Verification',
            path: '/government/blockchain',
          },
          {
            label: 'Live Monitoring',
            path: '/government/live-monitoring',
          },
          {
            label: 'Community Reports',
            path: '/government/community-reports',
          },
        ],
      },
    ],
  },

  // ============================================================
  // COMMUNITY / NGO PORTAL
  // ============================================================

  {
    title: 'NGO Portal',
    items: [
      {
        label: 'NGO',
        path: '/ngo',
        icon: Users,
        children: [
          {
            label: 'NGO Dashboard',
            path: '/ngo/dashboard',
          },
          {
            label: 'Alerts',
            path: '/ngo/alerts',
          },
          {
            label: 'Trends',
            path: '/ngo/trends',
          },
          {
            label: 'Awareness',
            path: '/ngo/awareness',
          },
          {
            label: 'Report & Participate',
            path: '/ngo/report',
          },
        ],
      },
    ],
  },

  // ============================================================
  // TRACEABILITY
  // ============================================================

  {
    title: 'Traceability',
    items: [
      {
        label: 'Blockchain',
        path: '/blockchain',
        icon: Blocks,
        children: [
          {
            label: 'Forest-Loss Records',
            path: '/blockchain/forest-loss-records',
          },
          {
            label: 'Evidence',
            path: '/blockchain/evidence',
          },
          {
            label: 'Explorer',
            path: '/blockchain/explorer',
          },
        ],
      },
    ],
  },

  // ============================================================
  // ANALYTICS
  // ============================================================

  {
    title: 'Analytics',
    items: [
      {
        label: 'Analytics',
        path: '/analytics',
        icon: BarChart3,
        children: [
          {
            label: 'Dashboard',
            path: '/analytics/dashboard',
          },
          {
            label: 'Export',
            path: '/analytics/export',
          },
        ],
      },
    ],
  },
];

// ============================================================
// ICONS
// ============================================================

export const ICONS = {
  Leaf,
  ArrowLeftRight,
  Layers,
  CloudSun,
  Radar,
  Activity,
  Database,
  Bell,
  ListTree,
  FileBarChart,
  FileDown,
  MapPinned,
  Radio,
  Scale,
  ClipboardCheck,
  Megaphone,
};