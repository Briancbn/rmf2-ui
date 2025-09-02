import type { RouteObject } from 'react-router';
import { HomeRedirect } from './home-redirect';

export const dashboardRoutes: RouteObject[] = [
  {
    // Redirect index page to /home
    index: true,
    Component: HomeRedirect,
  },
  {
    path: 'home',
    children: [
      {
        // Home
        index: true,
        lazy: async () => {
          const { Home } = await import('@/pages/dashboard');
          return { Component: Home };
        },
      },
    ],
  },
];

export const routes: RouteObject[] = [
  {
    path: '/',
    // lazy: async () => {
    //   const { DashboardLayout } = await import('@/layouts');
    //   return { Component: DashboardLayout };
    // },
    children: dashboardRoutes,
  },
];

export default routes;
