import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RouteDocument = HydratedDocument<Route>;

@Schema({ _id: false })
export class RouteSegmentRef {
  @Prop({ type: Types.ObjectId, ref: 'RouteNode', required: true })
  node: Types.ObjectId;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  start: string;

  @Prop({ required: true })
  end: string;

  @Prop({ required: false })
  encodedPolyline?: string;
}

@Schema({ timestamps: true, collection: 'routes' })
export class Route {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Point', required: true })
  start: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Point', required: true })
  end: Types.ObjectId;

  @Prop({ type: [RouteSegmentRef], default: [] })
  nodes: RouteSegmentRef[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Point' }], default: [] })
  points: Types.ObjectId[];

  @Prop({ required: true })
  total: number;
}

export const RouteSchema = SchemaFactory.createForClass(Route);
