import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { calculateDistanceMeters } from '../common/geo.utils';
import { PointsService } from '../points/points.service';
import { Route, RouteDocument } from '../routes/schemas/route.schema';

export interface LatLngInput {
  lat: number;
  lng: number;
}

@Injectable()
export class GuideService {
  private readonly defaultSearchRadiusMeters = 500;

  constructor(
    private readonly pointsService: PointsService,
    @InjectModel(Route.name) private readonly routeModel: Model<RouteDocument>,
  ) {}

  /**
   * Modernized async/await version of legacy Service.prototype.getPersonalRoute
   * Fixes the circular loop bug (indexA -> end -> indexB) and uses MongoDB 2dsphere $nearSphere
   */
  async getPersonalRoute(start: LatLngInput, end: LatLngInput) {
    if (
      typeof start?.lat !== 'number' ||
      typeof start?.lng !== 'number' ||
      typeof end?.lat !== 'number' ||
      typeof end?.lng !== 'number'
    ) {
      throw new BadRequestException('Invalid start or end coordinates');
    }

    const [startPoints, endPoints] = await Promise.all([
      this.pointsService.findNear(
        start.lat,
        start.lng,
        this.defaultSearchRadiusMeters,
      ),
      this.pointsService.findNear(
        end.lat,
        end.lng,
        this.defaultSearchRadiusMeters,
      ),
    ]);

    if (startPoints.length === 0 || endPoints.length === 0) {
      return { status: 'ERROR', result: null };
    }

    const endPointMap = new Map(
      endPoints.map((point) => [point._id.toString(), point]),
    );

    let bestCandidate: {
      score: number;
      payload: {
        type: 'ONE';
        steps: Array<{
          type: 'TO' | 'BUS' | 'FROM';
          route: RouteDocument;
          start: string | null;
          end: string | null;
          total: number;
        }>;
        total: number;
      };
    } | null = null;

    for (const startPoint of startPoints) {
      const startPointId = startPoint._id.toString();

      for (const routeObjId of startPoint.routes) {
        const currentRoute = await this.routeModel.findById(routeObjId).exec();
        if (!currentRoute) continue;

        const routePointIds = currentRoute.points.map((p) => p.toString());
        const indexA = routePointIds.indexOf(startPointId);
        if (indexA === -1) continue;

        for (const [endPointId, endStation] of endPointMap.entries()) {
          const indexB = routePointIds.indexOf(endPointId);
          if (indexB === -1 || indexA === indexB) continue;

          let busDistance = 0;
          if (indexA < indexB) {
            for (let idx = indexA; idx < indexB; idx++) {
              busDistance += currentRoute.nodes[idx]?.total ?? 0;
            }
          } else {
            // Circular route wrap-around (fixed from legacy bug where i started at indexB)
            for (let idx = indexA; idx < currentRoute.nodes.length; idx++) {
              busDistance += currentRoute.nodes[idx]?.total ?? 0;
            }
            for (let idx = 0; idx < indexB; idx++) {
              busDistance += currentRoute.nodes[idx]?.total ?? 0;
            }
          }

          const walkToMeters = calculateDistanceMeters(
            start.lat,
            start.lng,
            startPoint.lat,
            startPoint.lng,
          );
          const walkFromMeters = calculateDistanceMeters(
            endStation.lat,
            endStation.lng,
            end.lat,
            end.lng,
          );

          // Walking is weighted 5x compared to riding the bus (same heuristic as legacy service.js)
          const weightedScore =
            (walkToMeters + walkFromMeters) * 5 + busDistance;

          if (!bestCandidate || weightedScore < bestCandidate.score) {
            bestCandidate = {
              score: weightedScore,
              payload: {
                type: 'ONE',
                steps: [
                  {
                    type: 'TO',
                    route: currentRoute,
                    start: null,
                    end: startPointId,
                    total: walkToMeters,
                  },
                  {
                    type: 'BUS',
                    route: currentRoute,
                    start: startPointId,
                    end: endPointId,
                    total: busDistance,
                  },
                  {
                    type: 'FROM',
                    route: currentRoute,
                    start: endPointId,
                    end: null,
                    total: walkFromMeters,
                  },
                ],
                total: busDistance,
              },
            };
          }
        }
      }
    }

    if (!bestCandidate) {
      return { status: 'ERROR', result: null };
    }

    return {
      status: 'OK',
      result: bestCandidate.payload,
    };
  }
}
