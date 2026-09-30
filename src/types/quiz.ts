export type RegionName =
  | 'North East'
  | 'North West'
  | 'Yorkshire and the Humber'
  | 'East Midlands'
  | 'West Midlands'
  | 'East of England'
  | 'Greater London'
  | 'South East'
  | 'South West';

export interface CountyData {
  id: string;
  name: string;
  region: RegionName;
  regionalSubset: 'North' | 'Midlands' | 'East' | 'South East' | 'South West';
  countyTown: string;
  population: string;
  areaSqKm: number;
  funFact: string;
  path: string;
  center: { x: number; y: number };
  labelOffset?: { x: number; y: number };
}

export interface CityData {
  id: string;
  name: string;
  countyId: string;
  countyName: string;
  region: RegionName;
  coordinates: [number, number]; // [longitude, latitude]
  x?: number;
  y?: number;
  population: string;
  famousFor: string;
}

export type QuizTargetType = 'county' | 'city';

export interface QuizItem {
  id: string;
  name: string;
  type: QuizTargetType;
  subtitle?: string;
  data: CountyData | CityData;
}

export type QuizModuleId =
  | 'england-all'
  | 'region-north'
  | 'region-midlands'
  | 'region-east'
  | 'region-south-east'
  | 'region-south-west'
  | 'cities-major';

export interface QuizModule {
  id: QuizModuleId;
  title: string;
  subtitle: string;
  category: 'counties-all' | 'counties-region' | 'cities';
  itemCount: number;
  regionFilter?: string;
}

export type AnswerStatus = 'unanswered' | 'correct-1st' | 'correct-2nd' | 'correct-3rd' | 'missed';

export interface ItemResult {
  itemId: string;
  attempts: number;
  status: AnswerStatus;
}

export type GameMode = 'pin' | 'learn' | 'multiple-choice';

export interface QuizStats {
  scorePercent: number;
  elapsedSeconds: number;
  firstTryCount: number;
  secondTryCount: number;
  thirdTryCount: number;
  missedCount: number;
  totalQuestions: number;
}
