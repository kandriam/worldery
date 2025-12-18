export interface WorldEventInfo {
  id: string;
  name: string;
  date: string;
  endDate?: string;
  description: string;

  location: string[];
  characters: string[];
  stories: string[];
  tags: string[];
}

// export interface WorldTimeMeasurements {
//   months: string[];
//   daysInMonth: number;
//   hoursInDay: number;
//   minutesInHour: number;
//   secondsInMinute: number
// }