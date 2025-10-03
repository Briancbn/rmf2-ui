import type { RouteObject } from 'react-router';
import { HomeRedirect } from './home-redirect';

export const AdminRoutes: RouteObject[] = [
  {
    // Home
    path: 'home',
    lazy: async () => {
      const { Home } = await import('@/pages/dashboard');
      return { Component: Home };
    },
  },
  {
    // Network
    path: 'network',
    lazy: async () => {
      const { Home } = await import('@/pages/dashboard');
      return { Component: Home };
    },
  },
  {
    // Simulation
    path: 'simulation',
    lazy: async () => {
      const { Home } = await import('@/pages/dashboard');
      return { Component: Home };
    },
  },
  {
    // Operation
    path: 'operation',
    lazy: async () => {
      const { Home } = await import('@/pages/dashboard');
      return { Component: Home };
    },
    children: [
      {
        // Schedule
        path: 'schedule',
        lazy: async () => {
          const { Home } = await import('@/pages/dashboard');
          return { Component: Home };
        },
      },
    ],
  },
];

export const dashboardRoutes: RouteObject[] = [
  {
    // Redirect index page to /home
    index: true,
    Component: HomeRedirect,
  },
  {
    lazy: async () => {
      const { AdminLayout } = await import('@/layouts');
      return { Component: AdminLayout };
    },
    children: AdminRoutes,
  },
];

export const routes: RouteObject[] = [
  {
    path: '/',
    children: dashboardRoutes,
  },
];

export default routes;
