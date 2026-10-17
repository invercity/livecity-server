import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Types } from 'mongoose';
import { RoutesService } from './routes.service';

describe('RoutesService', () => {
  it('syncs route IDs onto stops when creating and updating a route', async () => {
    const pointUpdates: Array<{ filter: unknown; update: unknown }> = [];
    const routeId = new Types.ObjectId('65f000000000000000000099');
    const stop1 = '65f000000000000000000011';
    const stop2 = '65f000000000000000000012';
    const stop3 = '65f000000000000000000013';

    let storedRoute: {
      _id: Types.ObjectId;
      title: string;
      start: Types.ObjectId;
      end: Types.ObjectId;
      nodes: unknown[];
      points: Types.ObjectId[];
      total: number;
      save: () => Promise<unknown>;
    } | null = null;

    class MockRouteModel {
      _id = routeId;
      title: string;
      start: Types.ObjectId;
      end: Types.ObjectId;
      nodes: unknown[];
      points: Types.ObjectId[];
      total: number;

      constructor(dto: {
        title: string;
        start: string;
        end: string;
        nodes: unknown[];
        points: string[];
        total: number;
      }) {
        this.title = dto.title;
        this.start = new Types.ObjectId(dto.start);
        this.end = new Types.ObjectId(dto.end);
        this.nodes = dto.nodes;
        this.points = dto.points.map((p) => new Types.ObjectId(p));
        this.total = dto.total;
      }

      async save() {
        storedRoute = this;
        return this;
      }

      static findById() {
        return {
          exec: async () => storedRoute,
        };
      }
    }

    const mockNodeModel = {};
    const mockPointModel = {
      updateMany(filter: unknown, update: unknown) {
        pointUpdates.push({ filter, update });
        return { exec: async () => ({ acknowledged: true }) };
      },
    };

    const service = new RoutesService(
      MockRouteModel as never,
      mockNodeModel as never,
      mockPointModel as never,
    );

    // Create route with stop1 and stop2
    await service.createRoute({
      title: '12',
      start: stop1,
      end: stop2,
      nodes: [],
      points: [stop1, stop2],
      total: 1200,
    });

    assert.equal(pointUpdates.length, 1);
    assert.deepEqual(pointUpdates[0].update, {
      $addToSet: { routes: routeId },
    });

    // Update route to stop2 and stop3 (should pull from old stops and addToSet on new stops)
    await service.updateRoute(routeId.toString(), {
      title: '12-A',
      start: stop2,
      end: stop3,
      nodes: [],
      points: [stop2, stop3],
      total: 1500,
    });

    assert.equal(pointUpdates.length, 3);
    assert.deepEqual(pointUpdates[1].update, {
      $pull: { routes: routeId },
    });
    assert.deepEqual(pointUpdates[2].update, {
      $addToSet: { routes: routeId },
    });
  });
});
