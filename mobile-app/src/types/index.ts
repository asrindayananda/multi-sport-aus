export interface SportEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  sport: 'F1' | 'Bathurst' | 'NRL' | 'AFL';
  description: string;
}

export type RootStackParamList = {
  MainTabs: undefined;
  EventDetails: { event: SportEvent };
};

export type TabParamList = {
  Home: undefined;
  Calendar: undefined;
  Settings: undefined;
};
