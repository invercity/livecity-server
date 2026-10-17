import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { GuideService } from './guide.service';

describe('GuideService', () => {
  const stopAId = new Types.ObjectId('65f000000000000000000101');
  const stopBId = new Types.ObjectId('65f000000000000000000102');
  const routeId = new Types.ObjectId('65f000000000000000000201');

  it('throws BadRequestException when coordinates are missing', async () => {
    const service = new GuideService({} as never, {} as never);
    await assert.rejects(
      () => service.getPersonalRoute(null as never, { lat: 51.5, lng: 31.3 }),
      BadRequestException,
    );
  });

  it('finds the optimal direct bus route (TO -> BUS -> FROM) between two points', async () => {
    const mockPointsService = {
      findNear: async (lat: number) => {
        if (lat < 51.5) {
          return [
            {
              _id: stopAId,
              title: 'Початкова зупинка',
              lat: 51.4985,
              lng: 31.2895,
              routes: [routeId],
            },
          ];
        }
        return [
          {
            _id: stopBId,
            title: 'Кінцева зупинка',
            lat: 51.51,
            lng: 31.3,
            routes: [routeId],
          },
        ];
      },
    };

    const mockRouteModel = {
      findById: () => ({
        exec: async () => ({
          _id: routeId,
          title: '15',
          points: [stopAId, stopBId],
          nodes: [{ node: new Types.ObjectId(), total: 1850, start: '', end: '' }],
        }),
      }),
    };

    const service = new GuideService(
      mockPointsService as never,
      mockRouteModel as never,
    );

    const response = await service.getPersonalRoute(
      { lat: 51.4982, lng: 31.2893 },
      { lat: 51.5103, lng: 31.3002 },
    );

    assert.equal(response.status, 'OK');
    assert.ok(response.result);
    assert.equal(response.result.type, 'ONE');
    assert.equal(response.result.total, 1850);
    assert.equal(response.result.steps.length, 3);
    assert.equal(response.result.steps[0].type, 'TO');
    assert.equal(response.result.steps[1].type, 'BUS');
    assert.equal(response.result.steps[2].type, 'FROM');
  });
});
