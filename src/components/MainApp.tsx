'use client';

import React from 'react';
import { useRoutine } from '@/context/RoutineContext';
import Layout from './Layout/Layout';
import Dashboard from './Dashboard/Dashboard';
import RoutineList from './Routines/RoutineList';
import Calendar from './Calendar/Calendar';
import Statistics from './Statistics/Statistics';
import Settings from './Settings/Settings';

export default function MainApp() {
  const { currentView } = useRoutine();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'routines':
        return <RoutineList />;
      case 'calendar':
        return <Calendar />;
      case 'statistics':
        return <Statistics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderCurrentView()}
    </Layout>
  );
}