import { describe, it, expect } from 'vitest';
import { api } from '../api.js';

describe('Frontend API Client Suite', () => {
  it('should return seed lost items when backend is offline', async () => {
    const items = await api.getLostItems();
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toHaveProperty('title');
    expect(items[0]).toHaveProperty('category');
  });

  it('should return seed found items with storage locations', async () => {
    const items = await api.getFoundItems();
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toHaveProperty('storageLocation');
    expect(items[0]).toHaveProperty('currentCustodian');
  });

  it('should return multimodal attribute extraction response', async () => {
    const res = await api.extractAttributes(new File([''], 'test.jpg'));
    expect(res).toBeDefined();
    expect(res.category).toBe('ELECTRONICS');
    expect(res.brand).toBe('Apple');
    expect(res.confidenceScore).toBe(0.94);
  });

  it('should parse conversational report into structured entity JSON', async () => {
    const res = await api.parseNaturalLanguage('Found a lost iPhone in the campus library at 3pm');
    expect(res).toBeDefined();
    expect(res.category).toBe('ELECTRONICS');
    expect(res.confidenceScore).toBe(0.92);
  });

  it('should return candidate match pairs with 6D breakdown scores', async () => {
    const matches = await api.getMatches(1);
    expect(Array.isArray(matches)).toBe(true);
    expect(matches[0]).toHaveProperty('overallScore');
    expect(matches[0]).toHaveProperty('breakdown');
    expect(matches[0].breakdown.visualScore).toBe(0.94);
  });
});
