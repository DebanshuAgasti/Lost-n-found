import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext.jsx';
import Navbar from '../components/Navbar.jsx';

describe('Navbar Component', () => {
  it('renders brand title and all 6 navigation route tabs', () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <Navbar />
        </AppProvider>
      </BrowserRouter>
    );

    // Brand
    expect(screen.getByText('Lost')).toBeInTheDocument();
    expect(screen.getByText('Radar')).toBeInTheDocument();

    // Nav links
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Lost Feed/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Found Feed/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Match Radar/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Claims/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /AI Hub/i })).toBeInTheDocument();
  });

  it('renders default persona and unread notification counter badge', () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <Navbar />
        </AppProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Alex Mercer')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 initial unread mock notifications
  });
});
