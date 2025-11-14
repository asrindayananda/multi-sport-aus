import axios from 'axios';
import { SportEvent } from '../types';

// Sports API service for fetching data from various sources
// Note: Ergast API has shut down. Using OpenF1 API as alternative
const OPENF1_API = 'https://api.openf1.org/v1';

// Mock data for demonstration purposes
// F1 2025 Calendar based on official F1 schedule
const mockSportsData = {
  f1: [
    {
      id: 'f1-1',
      title: 'Australian Grand Prix',
      date: '2025-03-16',
      time: '05:00',
      location: 'Melbourne, Australia',
      sport: 'F1' as const,
      description: 'Formula 1 Australian Grand Prix at Albert Park Circuit'
    },
    {
      id: 'f1-2',
      title: 'Chinese Grand Prix',
      date: '2025-03-23',
      time: '08:00',
      location: 'Shanghai, China',
      sport: 'F1' as const,
      description: 'Formula 1 Chinese Grand Prix at Shanghai International Circuit'
    },
    {
      id: 'f1-3',
      title: 'Japanese Grand Prix',
      date: '2025-04-06',
      time: '06:00',
      location: 'Suzuka, Japan',
      sport: 'F1' as const,
      description: 'Formula 1 Japanese Grand Prix at Suzuka Circuit'
    },
    {
      id: 'f1-4',
      title: 'Bahrain Grand Prix',
      date: '2025-04-13',
      time: '18:00',
      location: 'Sakhir, Bahrain',
      sport: 'F1' as const,
      description: 'Formula 1 Bahrain Grand Prix at Bahrain International Circuit'
    },
    {
      id: 'f1-5',
      title: 'Saudi Arabian Grand Prix',
      date: '2025-04-20',
      time: '20:00',
      location: 'Jeddah, Saudi Arabia',
      sport: 'F1' as const,
      description: 'Formula 1 Saudi Arabian Grand Prix at Jeddah Corniche Circuit'
    },
    {
      id: 'f1-6',
      title: 'Miami Grand Prix',
      date: '2025-05-04',
      time: '21:00',
      location: 'Miami, USA',
      sport: 'F1' as const,
      description: 'Formula 1 Miami Grand Prix at Miami International Autodrome'
    },
    {
      id: 'f1-7',
      title: 'Emilia Romagna Grand Prix',
      date: '2025-05-18',
      time: '15:00',
      location: 'Imola, Italy',
      sport: 'F1' as const,
      description: 'Formula 1 Emilia Romagna Grand Prix at Autodromo Enzo e Dino Ferrari'
    },
    {
      id: 'f1-8',
      title: 'Monaco Grand Prix',
      date: '2025-05-25',
      time: '15:00',
      location: 'Monte Carlo, Monaco',
      sport: 'F1' as const,
      description: 'Formula 1 Monaco Grand Prix at Circuit de Monaco'
    },
    {
      id: 'f1-9',
      title: 'Spanish Grand Prix',
      date: '2025-06-01',
      time: '15:00',
      location: 'Barcelona, Spain',
      sport: 'F1' as const,
      description: 'Formula 1 Spanish Grand Prix at Circuit de Barcelona-Catalunya'
    },
    {
      id: 'f1-10',
      title: 'Canadian Grand Prix',
      date: '2025-06-15',
      time: '20:00',
      location: 'Montreal, Canada',
      sport: 'F1' as const,
      description: 'Formula 1 Canadian Grand Prix at Circuit Gilles Villeneuve'
    }
  ],
  bathurst: [
    {
      id: 'bath-1',
      title: 'Bathurst 12 Hour',
      date: '2025-01-31',
      time: '05:45',
      location: 'Mount Panorama, Bathurst',
      sport: 'Bathurst' as const,
      description: 'Bathurst 12 Hour endurance race'
    },
    {
      id: 'bath-2',
      title: 'Bathurst 1000',
      date: '2025-10-09',
      time: '11:00',
      location: 'Mount Panorama, Bathurst',
      sport: 'Bathurst' as const,
      description: 'The Great Race - Bathurst 1000 at Mount Panorama Circuit'
    }
  ],
  nrl: [
    {
      id: 'nrl-1',
      title: 'NRL Season Opener',
      date: '2025-03-06',
      time: '19:50',
      location: 'Sydney',
      sport: 'NRL' as const,
      description: 'NRL 2025 Season Opening Round'
    },
    {
      id: 'nrl-2',
      title: 'State of Origin Game 1',
      date: '2025-06-04',
      time: '20:00',
      location: 'Sydney',
      sport: 'NRL' as const,
      description: 'NSW Blues vs Queensland Maroons - Game 1'
    },
    {
      id: 'nrl-3',
      title: 'State of Origin Game 2',
      date: '2025-06-22',
      time: '20:00',
      location: 'Melbourne',
      sport: 'NRL' as const,
      description: 'NSW Blues vs Queensland Maroons - Game 2'
    },
    {
      id: 'nrl-4',
      title: 'State of Origin Game 3',
      date: '2025-07-09',
      time: '20:00',
      location: 'Brisbane',
      sport: 'NRL' as const,
      description: 'NSW Blues vs Queensland Maroons - Game 3'
    },
    {
      id: 'nrl-5',
      title: 'NRL Grand Final',
      date: '2025-09-28',
      time: '19:00',
      location: 'Sydney',
      sport: 'NRL' as const,
      description: 'NRL Grand Final 2025'
    }
  ],
  afl: [
    {
      id: 'afl-1',
      title: 'AFL Round 1',
      date: '2025-03-13',
      time: '19:20',
      location: 'Melbourne Cricket Ground',
      sport: 'AFL' as const,
      description: 'AFL Season 2025 Opening Round'
    },
    {
      id: 'afl-2',
      title: 'ANZAC Day Match',
      date: '2025-04-25',
      time: '15:20',
      location: 'Melbourne Cricket Ground',
      sport: 'AFL' as const,
      description: 'Collingwood vs Essendon - Traditional ANZAC Day clash'
    },
    {
      id: 'afl-3',
      title: 'AFL Grand Final',
      date: '2025-09-27',
      time: '14:30',
      location: 'Melbourne Cricket Ground',
      sport: 'AFL' as const,
      description: 'AFL Grand Final 2025'
    }
  ]
};

export const sportsApi = {
  // Fetch F1 race calendar
  // Note: Ergast API shut down in 2024. Using curated data based on official F1 2025 calendar.
  // For live API integration, consider:
  // - OpenF1 API (https://openf1.org/) - Real-time telemetry and session data
  // - RapidAPI F1 (https://rapidapi.com/api-sports/api/api-formula-1) - Requires API key
  // - Manual scraping of official F1 website
  async getF1Schedule(): Promise<SportEvent[]> {
    try {
      // Using curated data based on official 2025 F1 calendar
      // This ensures the app works even without external API dependencies
      console.log('Loading F1 2025 calendar data');
      return mockSportsData.f1;
    } catch (error) {
      console.error('Error loading F1 data:', error);
      return mockSportsData.f1;
    }
  },

  // Fetch Bathurst events (using mock data)
  async getBathurstSchedule(): Promise<SportEvent[]> {
    try {
      // In production, this would call a real API
      return mockSportsData.bathurst;
    } catch (error) {
      console.error('Error fetching Bathurst data:', error);
      return mockSportsData.bathurst;
    }
  },

  // Fetch NRL schedule (using mock data)
  async getNRLSchedule(): Promise<SportEvent[]> {
    try {
      // In production, this would call a real API like SportsData.io or similar
      return mockSportsData.nrl;
    } catch (error) {
      console.error('Error fetching NRL data:', error);
      return mockSportsData.nrl;
    }
  },

  // Fetch AFL schedule (using mock data)
  async getAFLSchedule(): Promise<SportEvent[]> {
    try {
      // In production, this would call a real API
      return mockSportsData.afl;
    } catch (error) {
      console.error('Error fetching AFL data:', error);
      return mockSportsData.afl;
    }
  },

  // Fetch all sports schedules
  async getAllSchedules(): Promise<SportEvent[]> {
    try {
      const [f1, bathurst, nrl, afl] = await Promise.all([
        this.getF1Schedule(),
        this.getBathurstSchedule(),
        this.getNRLSchedule(),
        this.getAFLSchedule()
      ]);

      return [...f1, ...bathurst, ...nrl, ...afl].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } catch (error) {
      console.error('Error fetching all schedules:', error);
      return [];
    }
  }
};
