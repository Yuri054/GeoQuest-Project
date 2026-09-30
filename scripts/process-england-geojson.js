import fs from 'fs';
import https from 'https';
import path from 'path';

const GEOJSON_URL = 'https://raw.githubusercontent.com/evansd/uk-ceremonial-counties/master/uk-ceremonial-counties.geojson';

const ENGLISH_COUNTIES = [
  'Greater London',
  'Greater Manchester',
  'Merseyside',
  'South Yorkshire',
  'Tyne and Wear',
  'West Midlands',
  'West Yorkshire',
  'North Yorkshire',
  'Durham',
  'Cheshire',
  'Lancashire',
  'East Riding of Yorkshire',
  'Lincolnshire',
  'Derbyshire',
  'Rutland',
  'Nottinghamshire',
  'Somerset',
  'Bristol',
  'Gloucestershire',
  'Devon',
  'Dorset',
  'Cambridgeshire',
  'Bedfordshire',
  'Essex',
  'Kent',
  'Berkshire',
  'East Sussex',
  'Hampshire',
  'Buckinghamshire',
  'Cumbria',
  'Hertfordshire',
  'Leicestershire',
  'Norfolk',
  'Northamptonshire',
  'Oxfordshire',
  'Staffordshire',
  'Suffolk',
  'Surrey',
  'Warwickshire',
  'West Sussex',
  'Worcestershire',
  'Shropshire',
  'Cornwall',
  'Wiltshire',
  'Isle of Wight',
  'Northumberland',
  'Herefordshire'
];

// Ramer-Douglas-Peucker simplification for GIS coordinates
function perpendicularDistance(point, lineStart, lineEnd) {
  let dx = lineEnd[0] - lineStart[0];
  let dy = lineEnd[1] - lineStart[1];

  const mag = Math.hypot(dx, dy);
  if (mag > 0) {
    dx /= mag;
    dy /= mag;
  }

  const pvx = point[0] - lineStart[0];
  const pvy = point[1] - lineStart[1];

  const pvdot = dx * pvx + dy * pvy;
  const dsx = pvdot * dx;
  const dsy = pvdot * dy;

  const ax = pvx - dsx;
  const ay = pvy - dsy;

  return Math.hypot(ax, ay);
}

function rdp(points, epsilon) {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let index = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }

  if (maxDist > epsilon) {
    const rec1 = rdp(points.slice(0, index + 1), epsilon);
    const rec2 = rdp(points.slice(index), epsilon);
    return rec1.slice(0, rec1.length - 1).concat(rec2);
  } else {
    return [points[0], points[points.length - 1]];
  }
}

function simplifyRing(ring, epsilon = 0.002) {
  if (ring.length <= 4) return ring.map(p => [Number(p[0].toFixed(5)), Number(p[1].toFixed(5))]);
  const simplified = rdp(ring, epsilon);
  // Ensure closed polygon ring
  if (simplified.length < 4) {
    return ring.slice(0, 4).map(p => [Number(p[0].toFixed(5)), Number(p[1].toFixed(5))]);
  }
  const first = simplified[0];
  const last = simplified[simplified.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    simplified.push([first[0], first[1]]);
  }
  return simplified.map(p => [Number(p[0].toFixed(5)), Number(p[1].toFixed(5))]);
}

function simplifyGeometry(geom, epsilon = 0.002) {
  if (geom.type === 'Polygon') {
    return {
      type: 'Polygon',
      coordinates: geom.coordinates.map(ring => simplifyRing(ring, epsilon))
    };
  } else if (geom.type === 'MultiPolygon') {
    return {
      type: 'MultiPolygon',
      coordinates: geom.coordinates.map(poly => poly.map(ring => simplifyRing(ring, epsilon)))
    };
  }
  return geom;
}

console.log('Downloading official England ceremonial counties GeoJSON...');
https.get(GEOJSON_URL, (res) => {
  let raw = '';
  res.on('data', chunk => raw += chunk);
  res.on('end', () => {
    const full = JSON.parse(raw);
    const englandFeatures = full.features.filter(f => {
      return f.properties && ENGLISH_COUNTIES.includes(f.properties.county);
    });

    console.log(`Found ${englandFeatures.length} English counties.`);

    const simplifiedFeatures = englandFeatures.map(feat => {
      // Normalize county name (e.g. Durham -> County Durham)
      let name = feat.properties.county;
      if (name === 'Durham') name = 'County Durham';

      // Create standardized id slug
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      return {
        type: 'Feature',
        id,
        properties: {
          id,
          name,
          officialName: feat.properties.county,
          area: feat.properties.area,
        },
        geometry: simplifyGeometry(feat.geometry, 0.0018)
      };
    });

    const finalGeoJSON = {
      type: 'FeatureCollection',
      features: simplifiedFeatures
    };

    const outDir = path.resolve('src/data');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const outPath = path.join(outDir, 'englandCounties.geo.json');
    const jsonStr = JSON.stringify(finalGeoJSON);
    fs.writeFileSync(outPath, jsonStr);

    console.log(`Saved GeoJSON to ${outPath} (${(jsonStr.length / 1024).toFixed(1)} KB)`);

    // Also copy to public directory for easy fetch if needed
    fs.writeFileSync(path.resolve('public/englandCounties.geo.json'), jsonStr);
  });
}).on('error', (err) => {
  console.error('Download error:', err);
});
