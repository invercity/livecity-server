import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Types } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { TransportService } from './transport.service';

describe('TransportService & SSE Stream', () => {
  const stop1Id = new Types.ObjectId('65f000000000000000000001');
  const stop2Id = new Types.ObjectId('65f000000000000000000002');
  const stop3Id = new Types.ObjectId('65f000000000000000000003');
  const routeId = new Types.ObjectId('65f000000000000000000010');
  const busId = new Types.ObjectId('65f000000000000000000020');

  const mockConfig = {
    get: (key: string) => {
      if (key === 'DELTA_DISTANCE_METERS') return 50;
      if (key === 'DEFAULT_SPEED_M_PER_MIN') return 500;
      if (key === 'DEFAULT_STOP_TIME_MIN') return 2;
      return undefined;
    },
  };

  it('calculates arrival time and distance at a target stop accurately', async () => {
    const mockPointModel = {
      findById: (id: string) => ({
        exec: async () =>
          id === stop3Id.toString()
            ? {
                _id: stop3Id,
                title: 'Зупинка 3',
                routes: [routeId],
              }
            : null,
      }),
    };

    const mockRouteModel = {
      findById: () => ({
        exec: async () => ({
          _id: routeId,
          title: '27',
          points: [stop1Id, stop2Id, stop3Id],
          nodes: [
            { node: new Types.ObjectId(), total: 600, start: '', end: '' },
            { node: new Types.ObjectId(), total: 900, start: '', end: '' },
          ],
        }),
      }),
    };

    const mockTransportModel = {
      find: () => ({
        exec: async () => [
          {
            _id: busId,
            route: routeId,
            lat: 51.498,
            lng: 31.289,
            current: { _id: stop1Id, title: 'Зупинка 1' },
            next: { _id: stop2Id, title: 'Зупинка 2' },
            distance: 100, // 100m left to reach stop2
          },
        ],
      }),
    };

    const service = new TransportService(
      mockTransportModel as never,
      mockRouteModel as never,
      mockPointModel as never,
      mockConfig as never,
    );

    const arrival = await service.getPointArrivalInfo(stop3Id.toString());
    assert.equal(arrival.pointId, stop3Id.toString());
    assert.equal(arrival.routes.length, 1);
    assert.equal(arrival.routes[0].status, 'OK');
    assert.equal(arrival.routes[0].title, '27');
    // From stop2 to stop3 is node[1].total (900m) + 100m to stop2 = 1000m
    assert.equal(arrival.routes[0].distance, 1000);
    // Time = 1000 / 500 (2 min) + 1 node * 2 min stop time = 4 min
    assert.equal(arrival.routes[0].time, 4);
  });

  it('emits Server-Sent Events (SSE) when transport is initialized or ended', async () => {
    class MockTransportModel {
      _id = busId;
      lat: number;
      lng: number;
      constructor(dto: { lat: number; lng: number }) {
        this.lat = dto.lat;
        this.lng = dto.lng;
      }
      async save() {
        return this;
      }
      static findByIdAndDelete(id: string) {
        return {
          exec: async () => (id === busId.toString() ? { _id: busId } : null),
        };
      }
    }

    const mockRouteModel = {
      find: () => ({ exec: async () => [] }),
    };

    const service = new TransportService(
      MockTransportModel as never,
      mockRouteModel as never,
      {} as never,
      mockConfig as never,
    );

    const nextEventPromise = firstValueFrom(service.getEventsStream());
    await service.initTransport(51.4982, 31.2893);
    const updatedEvent = await nextEventPromise;

    assert.equal(updatedEvent.type, 'transport:updated');

    const removedEventPromise = firstValueFrom(service.getEventsStream());
    await service.endTransport(busId.toString());
    const removedEvent = await removedEventPromise;

    assert.equal(removedEvent.type, 'transport:removed');
    assert.deepEqual(removedEvent.data, { _id: busId.toString() });
  });
});
