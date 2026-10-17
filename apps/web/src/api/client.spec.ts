import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Web API Client contract', () => {
  it('sends JSON requests and parses responses via fetch', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const originalFetch = globalThis.fetch;

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(input), init });
      return new Response(
        JSON.stringify({
          point: {
            _id: 'p1',
            title: 'Площа Красна',
            lat: 51.493,
            lng: 31.299,
            googlePlaceId: 'ChIJ_krasna',
            routes: [],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }) as typeof fetch;

    try {
      const response = await fetch('/api/points/from-google-place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googlePlaceId: 'ChIJ_krasna',
          title: 'Площа Красна',
          lat: 51.493,
          lng: 31.299,
        }),
      });
      const data = (await response.json()) as {
        point: { title: string; googlePlaceId: string };
      };

      assert.equal(calls.length, 1);
      assert.equal(calls[0].url, '/api/points/from-google-place');
      assert.equal(data.point.title, 'Площа Красна');
      assert.equal(data.point.googlePlaceId, 'ChIJ_krasna');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
