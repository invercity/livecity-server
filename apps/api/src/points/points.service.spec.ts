import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NotFoundException } from '@nestjs/common';
import { PointsService } from './points.service';

describe('PointsService', () => {
  it('upserts a stop from Google Maps Place ID (creates new or updates existing)', async () => {
    const store: Array<{
      _id: string;
      title: string;
      lat: number;
      lng: number;
      googlePlaceId?: string;
      routes: string[];
      save: () => Promise<unknown>;
    }> = [];

    class MockPointModel {
      _id = '65f000000000000000000001';
      title: string;
      lat: number;
      lng: number;
      googlePlaceId?: string;
      routes: string[];

      constructor(dto: {
        title: string;
        lat: number;
        lng: number;
        googlePlaceId?: string;
        routes: string[];
      }) {
        this.title = dto.title;
        this.lat = dto.lat;
        this.lng = dto.lng;
        this.googlePlaceId = dto.googlePlaceId;
        this.routes = dto.routes ?? [];
      }

      async save() {
        const existingIdx = store.findIndex((s) => s._id === this._id);
        if (existingIdx === -1) {
          store.push(this);
        } else {
          store[existingIdx] = this;
        }
        return this;
      }

      static findOne(filter: { googlePlaceId?: string }) {
        return {
          exec: async () =>
            store.find((s) => s.googlePlaceId === filter.googlePlaceId) ?? null,
        };
      }

      static findById(id: string) {
        return {
          exec: async () => store.find((s) => s._id === id) ?? null,
        };
      }
    }

    const service = new PointsService(MockPointModel as never);

    // 1. First click on Google Maps bus stop POI creates the stop
    const created = await service.upsertFromGooglePlace({
      googlePlaceId: 'ChIJ_google_stop_1',
      title: 'Центральний ринок',
      lat: 51.495,
      lng: 31.29,
    });
    assert.equal(created.title, 'Центральний ринок');
    assert.equal(created.googlePlaceId, 'ChIJ_google_stop_1');
    assert.equal(store.length, 1);

    // 2. Second click on the same Google Place ID updates it without duplicating
    const updated = await service.upsertFromGooglePlace({
      googlePlaceId: 'ChIJ_google_stop_1',
      title: 'Центральний ринок (оновлено)',
      lat: 51.4951,
      lng: 31.2901,
    });
    assert.equal(store.length, 1);
    assert.equal(updated.title, 'Центральний ринок (оновлено)');
    assert.equal(updated.lat, 51.4951);

    // 3. findById throws NotFoundException for unknown ID
    await assert.rejects(
      () => service.findById('non_existent_id'),
      NotFoundException,
    );
  });

  it('constructs a GeoJSON $nearSphere query in findNear', async () => {
    let capturedFilter: unknown = null;
    const mockModel = {
      find(filter: unknown) {
        capturedFilter = filter;
        return {
          exec: async () => [{ title: 'Near Stop', lat: 51.498, lng: 31.289 }],
        };
      },
    };

    const service = new PointsService(mockModel as never);
    const results = await service.findNear(51.4982, 31.28935, 450);

    assert.equal(results.length, 1);
    assert.deepEqual(capturedFilter, {
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [31.28935, 51.4982],
          },
          $maxDistance: 450,
        },
      },
    });
  });
});
