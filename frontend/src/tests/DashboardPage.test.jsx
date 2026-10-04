import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import ReportLostModal from '../components/ReportLostModal.jsx';

describe('DashboardPage Component', () => {
  it('renders hero title and quick stats counters', () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <DashboardPage />
        </AppProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Lost Something\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Lost Reports/i)).toBeInTheDocument();
    expect(screen.getByText(/Recovered Custodies/i)).toBeInTheDocument();
    expect(screen.getByText(/High-Confidence Matches/i)).toBeInTheDocument();
    expect(screen.getAllByText(/93.5%/i)[0]).toBeInTheDocument();
  });

  it('opens report lost modal when Report Lost button is clicked', () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <DashboardPage />
          <ReportLostModal />
        </AppProvider>
      </BrowserRouter>
    );

    const reportBtn = screen.getByRole('button', { name: /Report Lost Item/i });
    fireEvent.click(reportBtn);

    expect(screen.getByText('Item Title *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Space Gray Apple iPhone 15 Pro/i)).toBeInTheDocument();
  });
});
