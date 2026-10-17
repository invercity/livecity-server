import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RouteNodeDocument = HydratedDocument<RouteNode>;

@Schema({ timestamps: true, collection: 'nodes' })
export class RouteNode {
  @Prop({ type: Types.ObjectId, ref: 'Point', required: true })
  start: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Point', required: true })
  end: Types.ObjectId;

  /**
   * Distance in meters between start and end stop
   */
  @Prop({ required: true })
  total: number;

  /**
   * Google Maps encoded polyline (replaces legacy serialized DirectionsResult in data)
   */
  @Prop({ required: false })
  encodedPolyline?: string;

  /**
   * Legacy JSON data field kept for backward compatibility with old DB dumps
   */
  @Prop({ required: false })
  data?: string;

  @Prop({ required: false })
  points?: string;
}

export const RouteNodeSchema = SchemaFactory.createForClass(RouteNode);
