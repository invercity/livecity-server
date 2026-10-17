import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateDistanceMeters, toRadians } from './geo.utils';

describe('geo.utils', () => {
  it('converts degrees to radians accurately', () => {
    assert.equal(toRadians(0), 0);
    assert.ok(Math.abs(toRadians(180) - Math.PI) < 1e-10);
    assert.ok(Math.abs(toRadians(90) - Math.PI / 2) < 1e-10);
  });

  it('returns 0 meters for identical coordinates', () => {
    const dist = calculateDistanceMeters(51.4982, 31.28935, 51.4982, 31.28935);
    assert.equal(dist, 0);
  });

  it('calculates realistic Haversine distance in meters between two city points', () => {
    // ~1 km apart in Chernihiv
    const dist = calculateDistanceMeters(51.4982, 31.2893, 51.5072, 31.2893);
    assert.ok(dist >= 995 && dist <= 1005, `Expected ~1000m, got ${dist}m`);
  });

  it('is symmetric regardless of point order', () => {
    const d1 = calculateDistanceMeters(51.4982, 31.2893, 51.505, 31.301);
    const d2 = calculateDistanceMeters(51.505, 31.301, 51.4982, 31.2893);
    assert.equal(d1, d2);
  });
});
