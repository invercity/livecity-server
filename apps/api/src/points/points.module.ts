import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Point, PointSchema } from './schemas/point.schema';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Point.name, schema: PointSchema }]),
  ],
  controllers: [PointsController],
  providers: [PointsService],
  exports: [PointsService, MongooseModule],
})
export class PointsModule {}
