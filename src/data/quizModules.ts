import { QuizModule, QuizModuleId, QuizItem } from '../types/quiz';
import { ENGLAND_COUNTIES } from './englandCounties';
import { ENGLAND_CITIES } from './englandCities';

export const QUIZ_MODULES: QuizModule[] = [
  {
    id: 'england-all',
    title: 'Entirety of England',
    subtitle: 'All Ceremonial Counties',
    category: 'counties-all',
    itemCount: ENGLAND_COUNTIES.length,
  },
  {
    id: 'region-north',
    title: 'Northern England',
    subtitle: 'North East, North West & Yorkshire',
    category: 'counties-region',
    regionFilter: 'North',
    itemCount: ENGLAND_COUNTIES.filter(c => c.regionalSubset === 'North').length,
  },
  {
    id: 'region-midlands',
    title: 'The Midlands',
    subtitle: 'East Midlands & West Midlands',
    category: 'counties-region',
    regionFilter: 'Midlands',
    itemCount: ENGLAND_COUNTIES.filter(c => c.regionalSubset === 'Midlands').length,
  },
  {
    id: 'region-east',
    title: 'East of England',
    subtitle: 'Norfolk, Suffolk, Essex & Fens',
    category: 'counties-region',
    regionFilter: 'East',
    itemCount: ENGLAND_COUNTIES.filter(c => c.regionalSubset === 'East').length,
  },
  {
    id: 'region-south-east',
    title: 'South East & London',
    subtitle: 'Greater London, Kent, Sussex, Thames Valley',
    category: 'counties-region',
    regionFilter: 'South East',
    itemCount: ENGLAND_COUNTIES.filter(c => c.regionalSubset === 'South East').length,
  },
  {
    id: 'region-south-west',
    title: 'South West',
    subtitle: 'Cornwall, Devon, Somerset, Wessex & Cotswolds',
    category: 'counties-region',
    regionFilter: 'South West',
    itemCount: ENGLAND_COUNTIES.filter(c => c.regionalSubset === 'South West').length,
  },
  {
    id: 'cities-major',
    title: 'Major Towns & Cities',
    subtitle: 'London, Manchester, Birmingham & 25 more',
    category: 'cities',
    itemCount: ENGLAND_CITIES.length,
  },
];

export function getQuizItemsForModule(moduleId: QuizModuleId): QuizItem[] {
  if (moduleId === 'cities-major') {
    return ENGLAND_CITIES.map(city => ({
      id: city.id,
      name: city.name,
      type: 'city',
      subtitle: `${city.countyName} (${city.region})`,
      data: city,
    }));
  }

  const moduleDef = QUIZ_MODULES.find(m => m.id === moduleId);
  let counties = ENGLAND_COUNTIES;

  if (moduleDef?.regionFilter) {
    counties = ENGLAND_COUNTIES.filter(c => c.regionalSubset === moduleDef.regionFilter);
  }

  return counties.map(county => ({
    id: county.id,
    name: county.name,
    type: 'county',
    subtitle: `${county.region} · County Town: ${county.countyTown}`,
    data: county,
  }));
}
