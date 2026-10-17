import { Injectable, MessageEvent, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Observable, Subject } from 'rxjs';
import { calculateDistanceMeters } from '../common/geo.utils';
import { Point, PointDocument } from '../points/schemas/point.schema';
import { Route, RouteDocument } from '../routes/schemas/route.schema';
import { Transport, TransportDocument } from './schemas/transport.schema';

@Injectable()
export class TransportService {
  private readonly deltaDistanceMeters: number;
  private readonly defaultSpeedMetersPerMin: number;
  private readonly defaultStopTimeMinutes: number;
  private readonly events$ = new Subject<MessageEvent>();

  constructor(
    @InjectModel(Transport.name)
    private readonly transportModel: Model<TransportDocument>,
    @InjectModel(Route.name)
    private readonly routeModel: Model<RouteDocument>,
    @InjectModel(Point.name)
    private readonly pointModel: Model<PointDocument>,
    private readonly configService: ConfigService,
  ) {
    this.deltaDistanceMeters = Number(
      this.configService.get('DELTA_DISTANCE_METERS') ?? 50,
    );
    this.defaultSpeedMetersPerMin = Number(
      this.configService.get('DEFAULT_SPEED_M_PER_MIN') ?? 500,
    );
    this.defaultStopTimeMinutes = Number(
      this.configService.get('DEFAULT_STOP_TIME_MIN') ?? 2,
    );
  }

  /**
   * Built-in Server-Sent Events (SSE) stream for real-time transport updates
   */
  getEventsStream(): Observable<MessageEvent> {
    return this.events$.asObservable();
  }

  private emitTransportUpdated(transport: TransportDocument) {
    this.events$.next({
      type: 'transport:updated',
      data: transport,
    });
  }

  private emitTransportRemoved(id: string) {
    this.events$.next({
      type: 'transport:removed',
      data: { _id: id },
    });
  }

  async findAll(): Promise<TransportDocument[]> {
    return this.transportModel.find().exec();
  }

  async initTransport(lat: number, lng: number) {
    const trans = await new this.transportModel({ lat, lng }).save();
    const routes = await this.routeModel.find().exec();
    this.emitTransportUpdated(trans);
    return { trans, routes };
  }

  async endTransport(id: string) {
    const deleted = await this.transportModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Transport ${id} not found`);
    }
    this.emitTransportRemoved(id);
    return {};
  }

  /**
   * Modernized async/await version of legacy Service.prototype.getPointInfo
   */
  async getPointArrivalInfo(pointId: string) {
    const currentPoint = await this.pointModel.findById(pointId).exec();
    if (!currentPoint) {
      throw new NotFoundException('No such point');
    }

    const routesResult: Array<{
      status: 'OK' | 'NOTRANS' | 'NOTFOUND';
      route: string;
      title?: string;
      distance?: number;
      time?: number;
    }> = [];

    for (const routeObjId of currentPoint.routes) {
      const routeId = routeObjId.toString();
      const route = await this.routeModel.findById(routeId).exec();

      if (!route) {
        routesResult.push({ route: routeId, status: 'NOTFOUND' });
        continue;
      }

      const routePointIds = route.points.map((p) => p.toString());
      const currentPointPosition = routePointIds.indexOf(pointId);
      const allTransport = await this.transportModel
        .find({ route: route._id })
        .exec();

      let nearTransport: TransportDocument | null = null;
      let nearTransportLap: TransportDocument | null = null;

      for (const transport of allTransport) {
        const nextStopId = transport.next?._id?.toString();
        if (!nextStopId) continue;

        const transportIndex = routePointIds.indexOf(nextStopId);
        if (transportIndex === -1) continue;

        if (!nearTransportLap) {
          nearTransportLap = transport;
        }

        if (!nearTransport) {
          if (transportIndex <= currentPointPosition) {
            nearTransport = transport;
          }
        } else {
          const currentNearIndex = routePointIds.indexOf(
            nearTransport.next?._id?.toString() ?? '',
          );
          if (
            transportIndex <= currentPointPosition &&
            transportIndex > currentNearIndex
          ) {
            nearTransport = transport;
          }
          const nearLapIndex = routePointIds.indexOf(
            nearTransportLap.next?._id?.toString() ?? '',
          );
          if (
            transportIndex > currentPointPosition &&
            transportIndex < nearLapIndex
          ) {
            nearTransportLap = transport;
          }
        }
      }

      const near = nearTransport ?? nearTransportLap;
      if (near && (near.current?._id || near.next?._id)) {
        const fromId =
          near.distance === 0
            ? near.current?._id?.toString()
            : near.next?._id?.toString();
        const fromPointPosition = fromId ? routePointIds.indexOf(fromId) : 0;

        let distance = 0;
        let nodesCount = 0;

        if (fromPointPosition <= currentPointPosition) {
          for (let x = fromPointPosition; x < currentPointPosition; x++) {
            if (route.nodes[x]) {
              nodesCount++;
              distance += route.nodes[x].total;
            }
          }
        } else {
          for (let y = 0; y < currentPointPosition - 1; y++) {
            if (route.nodes[y]) {
              nodesCount++;
              distance += route.nodes[y].total;
            }
          }
          for (let z = fromPointPosition; z < route.nodes.length; z++) {
            if (route.nodes[z]) {
              nodesCount++;
              distance += route.nodes[z].total;
            }
          }
        }

        distance += near.distance ?? 0;
        const timeMinutes = Math.round(
          distance / this.defaultSpeedMetersPerMin +
            nodesCount * this.defaultStopTimeMinutes,
        );

        routesResult.push({
          status: 'OK',
          route: routeId,
          title: route.title,
          distance,
          time: timeMinutes,
        });
      } else {
        routesResult.push({
          status: 'NOTRANS',
          route: routeId,
          title: route.title,
        });
      }
    }

    return { pointId, routes: routesResult };
  }

  /**
   * Modernized async/await version of legacy Service.prototype.updateTransportData
   */
  async updateTransportData(
    id: string,
    routeId: string,
    lat: number,
    lng: number,
  ) {
    const currentTrans = await this.transportModel.findById(id).exec();
    const currentRoute = await this.routeModel.findById(routeId).exec();

    if (!currentTrans || !currentRoute) {
      throw new NotFoundException('Transport or route not found');
    }

    currentTrans.route = new Types.ObjectId(routeId);
    currentTrans.lat = lat;
    currentTrans.lng = lng;

    const routePointIds = currentRoute.points.map((p) => p.toString());

    if (currentTrans.current?._id && currentTrans.next?._id) {
      const distFromCurrent = calculateDistanceMeters(
        lat,
        lng,
        currentTrans.current.lat ?? lat,
        currentTrans.current.lng ?? lng,
      );

      if (distFromCurrent > this.deltaDistanceMeters) {
        const distToNext = calculateDistanceMeters(
          lat,
          lng,
          currentTrans.next.lat ?? lat,
          currentTrans.next.lng ?? lng,
        );

        if (distToNext < this.deltaDistanceMeters) {
          currentTrans.current = currentTrans.next;
          currentTrans.distance = 0;

          const currentIdx = routePointIds.indexOf(
            currentTrans.next._id.toString(),
          );
          if (currentIdx !== -1) {
            const nextIdx =
              currentIdx + 1 >= routePointIds.length - 1 ? 0 : currentIdx + 1;
            const newNextPoint = await this.pointModel
              .findById(routePointIds[nextIdx])
              .exec();

            if (newNextPoint) {
              currentTrans.next = {
                _id: newNextPoint._id,
                title: newNextPoint.title,
                lat: newNextPoint.lat,
                lng: newNextPoint.lng,
              };
            }
          }
        } else {
          currentTrans.distance = distToNext;
        }
      }
    } else {
      const routePoints = await this.pointModel
        .find({ _id: { $in: currentRoute.points } })
        .exec();

      const matchedPoint = routePoints.find(
        (point) =>
          calculateDistanceMeters(point.lat, point.lng, lat, lng) <
          this.deltaDistanceMeters,
      );

      if (matchedPoint) {
        const currentIdx = routePointIds.indexOf(matchedPoint._id.toString());
        const nextIdx =
          currentIdx + 1 >= routePointIds.length - 1 ? 0 : currentIdx + 1;
        const nextPoint = routePoints.find(
          (p) => p._id.toString() === routePointIds[nextIdx],
        );

        if (nextPoint) {
          currentTrans.current = {
            _id: matchedPoint._id,
            title: matchedPoint.title,
            lat: matchedPoint.lat,
            lng: matchedPoint.lng,
          };
          currentTrans.next = {
            _id: nextPoint._id,
            title: nextPoint.title,
            lat: nextPoint.lat,
            lng: nextPoint.lng,
          };
          currentTrans.distance = 0;
        }
      }
    }

    const saved = await currentTrans.save();
    this.emitTransportUpdated(saved);
    return { trans: saved };
  }
}
