import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PointDocument = HydratedDocument<Point>;

@Schema({ _id: false })
export class GeoPoint {
  @Prop({ type: String, enum: ['Point'], default: 'Point' })
  type: 'Point';

  /**
   * GeoJSON coordinates: [longitude, latitude]
   */
  @Prop({ type: [Number], required: true })
  coordinates: [number, number];
}

@Schema({ timestamps: true, collection: 'points' })
export class Point {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lng: number;

  /**
   * Google Maps Place ID when linked to an existing Google Maps transit stop POI
   */
  @Prop({ index: true, sparse: true })
  googlePlaceId?: string;

  @Prop({ type: GeoPoint, index: '2dsphere' })
  location: GeoPoint;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Route' }], default: [] })
  routes: Types.ObjectId[];
}

export const PointSchema = SchemaFactory.createForClass(Point);

PointSchema.pre('validate', function (next) {
  if (typeof this.lng === 'number' && typeof this.lat === 'number') {
    this.location = {
      type: 'Point',
      coordinates: [this.lng, this.lat],
    };
  }
  next();
});
