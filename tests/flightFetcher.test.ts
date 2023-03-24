// tests/flightFetcher.test.ts
import { fetchFlights } from '../src/scripts/flightutils'
import { createClient } from '@supabase/supabase-js';
import moment from 'moment';
import type { SupabaseClient } from '@supabase/supabase-js';


jest.mock('@supabase/supabase-js', () => {
  return {
    createClient: jest.fn(() => ({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => ({
                  then: jest.fn((callback: any) => callback({ data: [] })),
                })),
              })),
            })),
          })),
        })),
      })),
    })),
  };
});

describe('fetchFlights', () => {
  let supabase: SupabaseClient;
  let currentDate: Date;
  let type: string;

  beforeEach(() => {
    supabase = createClient('', '');
    currentDate = moment().toDate();
    type = 'departure';
  });

  it('should fetch flights successfully', async () => {
    const flights = await fetchFlights(supabase, currentDate, type);
    expect(flights).toEqual([]);
  });

  // Add more test cases for different scenarios
});
