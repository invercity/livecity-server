import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Point, PointDocument } from '../points/schemas/point.schema';
import { RouteNode, RouteNodeDocument } from './schemas/node.schema';
import { Route, RouteDocument, RouteSegmentRef } from './schemas/route.schema';

export interface CreateNodeInput {
  start: string;
  end: string;
  total: number;
  encodedPolyline?: string;
  data?: string;
  points?: string;
}

export interface UpsertRouteInput {
  title: string;
  start: string;
  end: string;
  nodes: RouteSegmentRef[];
  points: string[];
  total: number;
}

@Injectable()
export class RoutesService {
  constructor(
    @InjectModel(Route.name) private readonly routeModel: Model<RouteDocument>,
    @InjectModel(RouteNode.name)
    private readonly nodeModel: Model<RouteNodeDocument>,
    @InjectModel(Point.name) private readonly pointModel: Model<PointDocument>,
  ) {}

  async findAllNodes(): Promise<RouteNodeDocument[]> {
    return this.nodeModel.find().exec();
  }

  async findNodeById(id: string): Promise<RouteNodeDocument> {
    const node = await this.nodeModel.findById(id).exec();
    if (!node) {
      throw new NotFoundException(`Node ${id} not found`);
    }
    return node;
  }

  async createNode(dto: CreateNodeInput): Promise<RouteNodeDocument> {
    const node = new this.nodeModel(dto);
    return node.save();
  }

  async deleteNode(id: string): Promise<void> {
    await this.nodeModel.findByIdAndDelete(id).exec();
  }

  async findAllRoutes(): Promise<RouteDocument[]> {
    return this.routeModel.find().exec();
  }

  async findRouteById(id: string): Promise<RouteDocument> {
    const route = await this.routeModel.findById(id).exec();
    if (!route) {
      throw new NotFoundException(`Route ${id} not found`);
    }
    return route;
  }

  async createRoute(dto: UpsertRouteInput): Promise<RouteDocument> {
    const route = new this.routeModel(dto);
    const saved = await route.save();
    await this.syncRouteOnPoints(saved._id, dto.points);
    return saved;
  }

  async updateRoute(id: string, dto: UpsertRouteInput): Promise<RouteDocument> {
    const route = await this.findRouteById(id);
    const previousPointIds = route.points.map((p) => p.toString());

    route.title = dto.title;
    route.start = new Types.ObjectId(dto.start);
    route.end = new Types.ObjectId(dto.end);
    route.nodes = dto.nodes;
    route.points = dto.points.map((p) => new Types.ObjectId(p));
    route.total = dto.total;

    const saved = await route.save();
    await this.removeRouteFromPoints(route._id, previousPointIds);
    await this.syncRouteOnPoints(route._id, dto.points);
    return saved;
  }

  async deleteRoute(id: string): Promise<void> {
    const route = await this.findRouteById(id);
    const pointIds = route.points.map((p) => p.toString());
    await this.removeRouteFromPoints(route._id, pointIds);
    await this.routeModel.findByIdAndDelete(id).exec();
  }

  /**
   * Adds route reference to all stops belonging to the route
   */
  private async syncRouteOnPoints(
    routeId: Types.ObjectId,
    pointIds: string[],
  ): Promise<void> {
    if (!pointIds?.length) return;
    await this.pointModel
      .updateMany(
        { _id: { $in: pointIds } },
        { $addToSet: { routes: routeId } },
      )
      .exec();
  }

  /**
   * Removes route reference from stops (fixes missing service.removeRouteFromPoints from legacy server.js)
   */
  async removeRouteFromPoints(
    routeId: Types.ObjectId,
    pointIds: string[],
  ): Promise<void> {
    if (!pointIds?.length) return;
    await this.pointModel
      .updateMany({ _id: { $in: pointIds } }, { $pull: { routes: routeId } })
      .exec();
  }
}
