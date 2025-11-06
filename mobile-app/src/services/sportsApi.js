import axios from 'axios';

// Sports API service for fetching data from various sources
const ERGAST_API = 'https://ergast.com/api/f1';
const SPORTS_DATA_API = 'https://api.sportsdata.io/v3'; // Placeholder - requires API key

// Mock data for demonstration purposes
const mockSportsData = {
  f1: [
    {
      id: 'f1-1',
      title: 'Australian Grand Prix',
      date: '2024-03-24',
      time: '15:00',
      location: 'Melbourne, Australia',
      sport: 'F1',
      description: 'Formula 1 Australian Grand Prix at Albert Park Circuit'
    },
    {
      id: 'f1-2',
      title: 'Japanese Grand Prix',
      date: '2024-04-07',
      time: '14:00',
      location: 'Suzuka, Japan',
      sport: 'F1',
      description: 'Formula 1 Japanese Grand Prix at Suzuka Circuit'
    }
  ],
  bathurst: [
    {
      id: 'bath-1',
      title: 'Bathurst 1000',
      date: '2024-10-10',
      time: '11:00',
      location: 'Mount Panorama, Bathurst',
      sport: 'Bathurst',
      description: 'The Great Race - Bathurst 1000 at Mount Panorama Circuit'
    },
    {
      id: 'bath-2',
      title: 'Bathurst 12 Hour',
      date: '2024-02-02',
      time: '05:45',
      location: 'Mount Panorama, Bathurst',
      sport: 'Bathurst',
      description: 'Bathurst 12 Hour endurance race'
    }
  ],
  nrl: [
    {
      id: 'nrl-1',
      title: 'State of Origin Game 1',
      date: '2024-06-05',
      time: '20:00',
      location: 'Sydney',
      sport: 'NRL',
      description: 'NSW Blues vs Queensland Maroons - Game 1'
    },
    {
      id: 'nrl-2',
      title: 'NRL Grand Final',
      date: '2024-10-06',
      time: '19:00',
      location: 'Sydney',
      sport: 'NRL',
      description: 'NRL Grand Final 2024'
    }
  ],
  afl: [
    {
      id: 'afl-1',
      title: 'AFL Round 1',
      date: '2024-03-14',
      time: '19:20',
      location: 'Melbourne Cricket Ground',
      sport: 'AFL',
      description: 'AFL Season 2024 Opening Round'
    },
    {
      id: 'afl-2',
      title: 'AFL Grand Final',
      date: '2024-09-28',
      time: '14:30',
      location: 'Melbourne Cricket Ground',
      sport: 'AFL',
      description: 'AFL Grand Final 2024'
    }
  ]
};

export const sportsApi = {
  // Fetch F1 race calendar
  async getF1Schedule() {
    try {
      const response = await axios.get(`${ERGAST_API}/current.json`);
      const races = response.data.MRData.RaceTable.Races;
      
      return races.map(race => ({
        id: `f1-${race.round}`,
        title: race.raceName,
        date: race.date,
        time: race.time || '00:00',
        location: `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
        sport: 'F1',
        description: `${race.raceName} at ${race.Circuit.circuitName}`
      }));
    } catch (error) {
      console.error('Error fetching F1 data:', error);
      return mockSportsData.f1;
    }
  },

  // Fetch Bathurst events (using mock data)
  async getBathurstSchedule() {
    try {
      // In production, this would call a real API
      return mockSportsData.bathurst;
    } catch (error) {
      console.error('Error fetching Bathurst data:', error);
      return mockSportsData.bathurst;
    }
  },

  // Fetch NRL schedule (using mock data)
  async getNRLSchedule() {
    try {
      // In production, this would call a real API like SportsData.io or similar
      return mockSportsData.nrl;
    } catch (error) {
      console.error('Error fetching NRL data:', error);
      return mockSportsData.nrl;
    }
  },

  // Fetch AFL schedule (using mock data)
  async getAFLSchedule() {
    try {
      // In production, this would call a real API
      return mockSportsData.afl;
    } catch (error) {
      console.error('Error fetching AFL data:', error);
      return mockSportsData.afl;
    }
  },

  // Fetch all sports schedules
  async getAllSchedules() {
    try {
      const [f1, bathurst, nrl, afl] = await Promise.all([
        this.getF1Schedule(),
        this.getBathurstSchedule(),
        this.getNRLSchedule(),
        this.getAFLSchedule()
      ]);

      return [...f1, ...bathurst, ...nrl, ...afl].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
    } catch (error) {
      console.error('Error fetching all schedules:', error);
      return [];
    }
  }
};
