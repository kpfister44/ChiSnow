// ABOUTME: Test suite for StormSelector component
// ABOUTME: Verifies storm selection dropdown functionality

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import StormSelector from './StormSelector';
import type { StormMetadata } from '@/types';

const mockStorms: StormMetadata[] = [
  {
    id: 'storm-2025-12-04',
    date: '2025-12-04T20:00:00.000Z',
    totalStations: 28,
    maxSnowfall: 10,
  },
  {
    id: 'storm-2025-11-28',
    date: '2025-11-28T20:00:00.000Z',
    totalStations: 27,
    maxSnowfall: 2.1,
  },
];

describe('StormSelector', () => {
  it('renders the currently selected storm', () => {
    const onStormChange = vi.fn();
    render(
      <StormSelector
        storms={mockStorms}
        selectedStormId="storm-2025-12-04"
        onStormChange={onStormChange}
      />
    );

    expect(screen.getByRole('heading', { name: /Dec 4, 2025/i })).toBeInTheDocument();
  });

  it('displays storm metadata', () => {
    const onStormChange = vi.fn();
    render(
      <StormSelector
        storms={mockStorms}
        selectedStormId="storm-2025-12-04"
        onStormChange={onStormChange}
      />
    );

    expect(screen.getByText(/10" max/)).toBeInTheDocument();
    expect(screen.getByText(/28 stations/i)).toBeInTheDocument();
  });
});
