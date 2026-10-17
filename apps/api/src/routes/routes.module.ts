import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PointsModule } from '../points/points.module';
import { RouteNode, RouteNodeSchema } from './schemas/node.schema';
import { Route, RouteSchema } from './schemas/route.schema';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';

@Module({
  imports: [
    PointsModule,
    MongooseModule.forFeature([
      { name: Route.name, schema: RouteSchema },
      { name: RouteNode.name, schema: RouteNodeSchema },
    ]),
  ],
  controllers: [RoutesController],
  providers: [RoutesService],
  exports: [RoutesService, MongooseModule],
})
export class RoutesModule {}
