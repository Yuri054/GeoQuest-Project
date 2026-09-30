import { geoMercator, geoPath } from 'd3-geo';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import rawEnglandGeoJSON from '../data/englandCounties.geo.json';
import { ENGLAND_COUNTIES } from '../data/englandCounties';
import { ENGLAND_CITIES } from '../data/englandCities';
import { CountyData } from '../types/quiz';

export interface ProjectedCounty {
  id: string;
  name: string;
  pathD: string;
  centroid: [number, number];
  bounds: [[number, number], [number, number]];
  metadata?: CountyData;
}

export interface ProjectedCity {
  id: string;
  name: string;
  countyId: string;
  countyName: string;
  region: string;
  x: number;
  y: number;
  population: string;
  famousFor: string;
}

export const MAP_WIDTH = 700;
export const MAP_HEIGHT = 900;
export const MAP_PADDING = 35;

export const englandGeoJSON = rawEnglandGeoJSON as unknown as FeatureCollection<Geometry, {
  id: string;
  name: string;
  officialName: string;
  area: number;
}>;

// Setup high-precision D3 Mercator projection fitted to England's GIS boundary
export const projection = geoMercator().fitExtent(
  [
    [MAP_PADDING, MAP_PADDING],
    [MAP_WIDTH - MAP_PADDING, MAP_HEIGHT - MAP_PADDING],
  ],
  englandGeoJSON
);

export const pathGenerator = geoPath().projection(projection);

// Projected Counties mapped to their rich metadata
export const PROJECTED_COUNTIES: ProjectedCounty[] = englandGeoJSON.features.map(feature => {
  const id = feature.id as string || feature.properties.id;
  const pathD = pathGenerator(feature) || '';
  const centroid = pathGenerator.centroid(feature);
  const bounds = pathGenerator.bounds(feature);

  // Match rich metadata
  const metadata = ENGLAND_COUNTIES.find(c => c.id === id);

  return {
    id,
    name: feature.properties.name,
    pathD,
    centroid: [
      isNaN(centroid[0]) ? 0 : centroid[0],
      isNaN(centroid[1]) ? 0 : centroid[1],
    ],
    bounds,
    metadata,
  };
});

// Projected Cities positioned using the exact same GIS projection
export const PROJECTED_CITIES: ProjectedCity[] = ENGLAND_CITIES.map(city => {
  const projectedPos = projection(city.coordinates);
  const x = projectedPos ? projectedPos[0] : 0;
  const y = projectedPos ? projectedPos[1] : 0;

  return {
    ...city,
    x,
    y,
  };
});
