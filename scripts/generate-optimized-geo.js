import fs from 'fs';
import path from 'path';
import { geoMercator, geoPath } from 'd3-geo';

const rawGeo = JSON.parse(fs.readFileSync('src/data/englandCounties.geo.json', 'utf8'));

// Perpendicular distance & Ramer-Douglas-Peucker simplification
function perpendicularDistance(point, lineStart, lineEnd) {
  let dx = lineEnd[0] - lineStart[0];
  let dy = lineEnd[1] - lineStart[1];
  const mag = Math.hypot(dx, dy);
  if (mag > 0) { dx /= mag; dy /= mag; }
  const pvx = point[0] - lineStart[0];
  const pvy = point[1] - lineStart[1];
  const pvdot = dx * pvx + dy * pvy;
  const dsx = pvdot * dx;
  const dsy = pvdot * dy;
  return Math.hypot(pvx - dsx, pvy - dsy);
}

function rdp(points, epsilon) {
  if (points.length <= 2) return points;
  let maxDist = 0, index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (dist > maxDist) { maxDist = dist; index = i; }
  }
  if (maxDist > epsilon) {
    const rec1 = rdp(points.slice(0, index + 1), epsilon);
    const rec2 = rdp(points.slice(index), epsilon);
    return rec1.slice(0, rec1.length - 1).concat(rec2);
  }
  return [points[0], points[points.length - 1]];
}

function simplifyRing(ring, eps = 0.0055) {
  if (ring.length <= 4) return ring;
  const simp = rdp(ring, eps);
  if (simp.length < 4) return ring.slice(0, 4);
  const first = simp[0], last = simp[simp.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) simp.push([first[0], first[1]]);
  return simp.map(p => [Number(p[0].toFixed(5)), Number(p[1].toFixed(5))]);
}

function simplifyFeature(feat, eps = 0.0055) {
  const geom = feat.geometry;
  let coords;
  if (geom.type === 'Polygon') {
    coords = geom.coordinates.map(r => simplifyRing(r, eps));
  } else if (geom.type === 'MultiPolygon') {
    coords = geom.coordinates.map(p => p.map(r => simplifyRing(r, eps)));
  } else {
    coords = geom.coordinates;
  }
  return {
    ...feat,
    geometry: { ...geom, coordinates: coords }
  };
}

const VIEWBOX_WIDTH = 480;
const VIEWBOX_HEIGHT = 650;
const PADDING = 18;

const simplifiedFeatures = rawGeo.features.map(f => simplifyFeature(f, 0.0055));
const simplifiedGeo = { type: 'FeatureCollection', features: simplifiedFeatures };

// High-precision Mercator projection fitted to portrait mobile viewport
const projection = geoMercator().fitExtent(
  [[PADDING, PADDING], [VIEWBOX_WIDTH - PADDING, VIEWBOX_HEIGHT - PADDING]],
  simplifiedGeo
);

const pathGen = geoPath().projection(projection);

// Clean SVG path string formatter (rounds numbers to 1 decimal place to save memory and string parsing)
function formatPathString(d) {
  if (!d) return '';
  return d.replace(/([0-9]+\.[0-9]{2,})/g, (match) => {
    return Number(match).toFixed(1);
  });
}

// Read cities from englandCities.ts
const citiesContent = fs.readFileSync('src/data/englandCities.ts', 'utf8');
// Parse city coordinates directly
const cityMatches = [];
const cityRegex = /id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*countyId:\s*'([^']+)',\s*countyName:\s*'([^']+)',\s*region:\s*'([^']+)',\s*coordinates:\s*\[([0-9.-]+),\s*([0-9.-]+)\],\s*population:\s*'([^']+)',\s*famousFor:\s*'([^']+)'/g;
let m;
while ((m = cityRegex.exec(citiesContent)) !== null) {
  const lng = parseFloat(m[6]);
  const lat = parseFloat(m[7]);
  const projected = projection([lng, lat]);
  cityMatches.push({
    id: m[1],
    name: m[2],
    countyId: m[3],
    countyName: m[4],
    region: m[5],
    lng,
    lat,
    x: Math.round(projected[0] * 10) / 10,
    y: Math.round(projected[1] * 10) / 10,
    population: m[8],
    famousFor: m[9],
  });
}

const counties = simplifiedFeatures.map(feat => {
  const id = feat.id;
  const name = feat.properties.name;
  const rawPath = pathGen(feat);
  const pathD = formatPathString(rawPath);
  const centroid = pathGen.centroid(feat);

  return {
    id,
    name,
    pathD,
    centroid: [Math.round(centroid[0] * 10) / 10, Math.round(centroid[1] * 10) / 10],
  };
});

// Write to TypeScript file
const tsOutput = `// Auto-generated optimized GIS dataset for Android mobile WebView (portrait orientation)
export interface GisCounty {
  id: string;
  name: string;
  pathD: string;
  centroid: [number, number];
}

export interface GisCity {
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

export const MAP_VIEWBOX_WIDTH = ${VIEWBOX_WIDTH};
export const MAP_VIEWBOX_HEIGHT = ${VIEWBOX_HEIGHT};

export const GIS_COUNTIES: GisCounty[] = ${JSON.stringify(counties, null, 2)};

export const GIS_CITIES: GisCity[] = ${JSON.stringify(cityMatches, null, 2)};
`;

fs.writeFileSync('src/data/englandGisOptimized.ts', tsOutput);
console.log('Generated src/data/englandGisOptimized.ts successfully!');
console.log('Counties:', counties.length, 'Cities:', cityMatches.length);
