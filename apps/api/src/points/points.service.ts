import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Point, PointDocument } from './schemas/point.schema';

export interface UpsertPointInput {
  title: string;
  lat: number;
  lng: number;
  googlePlaceId?: string;
}

@Injectable()
export class PointsService {
  constructor(
    @InjectModel(Point.name) private readonly pointModel: Model<PointDocument>,
  ) {}

  async findAll(): Promise<PointDocument[]> {
    return this.pointModel.find().exec();
  }

  async findById(id: string): Promise<PointDocument> {
    const point = await this.pointModel.findById(id).exec();
    if (!point) {
      throw new NotFoundException(`Point ${id} not found`);
    }
    return point;
  }

  async create(dto: UpsertPointInput): Promise<PointDocument> {
    const point = new this.pointModel({
      title: dto.title,
      lat: dto.lat,
      lng: dto.lng,
      googlePlaceId: dto.googlePlaceId,
      routes: [],
    });
    return point.save();
  }

  /**
   * Resolves an existing stop linked to a Google Maps Place ID, or creates it on the fly
   * when an admin/user clicks a transit stop POI directly on Google Maps.
   */
  async upsertFromGooglePlace(dto: {
    googlePlaceId: string;
    title: string;
    lat: number;
    lng: number;
  }): Promise<PointDocument> {
    const existing = await this.pointModel
      .findOne({ googlePlaceId: dto.googlePlaceId })
      .exec();

    if (existing) {
      existing.title = dto.title || existing.title;
      existing.lat = dto.lat;
      existing.lng = dto.lng;
      return existing.save();
    }

    return this.create(dto);
  }

  async update(id: string, dto: Partial<UpsertPointInput>): Promise<PointDocument> {
    const point = await this.findById(id);
    if (dto.title !== undefined) point.title = dto.title;
    if (dto.lat !== undefined) point.lat = dto.lat;
    if (dto.lng !== undefined) point.lng = dto.lng;
    if (dto.googlePlaceId !== undefined) point.googlePlaceId = dto.googlePlaceId;
    return point.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.pointModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Point ${id} not found`);
    }
  }

  /**
   * Native MongoDB 2dsphere geospatial search (replaces legacy Points.statics.findNear loop)
   */
  async findNear(
    lat: number,
    lng: number,
    maxDistanceMeters = 500,
  ): Promise<PointDocument[]> {
    return this.pointModel
      .find({
        location: {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            $maxDistance: maxDistanceMeters,
          },
        },
      })
      .exec();
  }
}
