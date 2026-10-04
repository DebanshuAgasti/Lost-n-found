import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext.jsx';
import { api } from '../api.js';
import AiHubPage from '../pages/AiHubPage.jsx';

describe('AiHubPage Component', () => {
  it('renders Vision Attribute Extractor and Natural Language Parser tools', () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <AiHubPage />
        </AppProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Vision Attribute Extractor')).toBeInTheDocument();
    expect(screen.getByText('Natural Language Report Parser')).toBeInTheDocument();
    expect(screen.getByText(/Run Gemini Vision Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/Parse with LLM Client/i)).toBeInTheDocument();
  });

  it('runs vision analysis when clicked and renders structured attributes', async () => {
    const mockVisionData = {
      category: 'ELECTRONICS',
      brand: 'Apple',
      model: 'iPhone 15 Pro',
      primaryColor: 'Space Gray',
      secondaryColor: 'Black',
      distinctiveMarks: 'Holographic sticker on lower rear glass',
      scratchesOrDamage: 'Light micro-abrasions along upper edge',
      stickersOrAccessories: 'Clear shockproof protective bumper',
      suggestedTitle: 'Space Gray Apple iPhone 15 Pro with Clear Case',
      suggestedDescription: 'Detected flagship smartphone in Space Gray finish.',
      confidenceScore: 0.94
    };
    vi.spyOn(api, 'extractAttributes').mockResolvedValue(mockVisionData);

    render(
      <BrowserRouter>
        <AppProvider>
          <AiHubPage />
        </AppProvider>
      </BrowserRouter>
    );

    const runBtn = screen.getByRole('button', { name: /Run Gemini Vision Analysis/i });
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText(/Analysis Complete \(94% Confidence\)/i)).toBeInTheDocument();
    });
    expect(screen.getAllByText(/Apple/i)[0]).toBeInTheDocument();
  });
});
