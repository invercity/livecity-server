import { Module } from '@nestjs/common';
import { PointsModule } from '../points/points.module';
import { RoutesModule } from '../routes/routes.module';
import { GuideController } from './guide.controller';
import { GuideService } from './guide.service';

@Module({
  imports: [PointsModule, RoutesModule],
  controllers: [GuideController],
  providers: [GuideService],
})
export class GuideModule {}
