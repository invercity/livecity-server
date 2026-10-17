import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TransportDocument = HydratedDocument<Transport>;

@Schema({ _id: false })
export class TransportStopSnapshot {
  @Prop({ type: Types.ObjectId, ref: 'Point' })
  _id?: Types.ObjectId;

  @Prop()
  title?: string;

  @Prop()
  lat?: number;

  @Prop()
  lng?: number;
}

@Schema({ timestamps: true, collection: 'transports' })
export class Transport {
  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lng: number;

  @Prop({ type: Types.ObjectId, ref: 'Route', index: true })
  route?: Types.ObjectId;

  @Prop({ type: TransportStopSnapshot })
  current?: TransportStopSnapshot;

  @Prop({ type: TransportStopSnapshot })
  next?: TransportStopSnapshot;

  /**
   * Distance in meters to the next stop (0 when at current stop)
   */
  @Prop({ default: 0 })
  distance?: number;
}

export const TransportSchema = SchemaFactory.createForClass(Transport);
