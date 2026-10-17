import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PointsModule } from '../points/points.module';
import { RoutesModule } from '../routes/routes.module';
import { Transport, TransportSchema } from './schemas/transport.schema';
import { TransportController } from './transport.controller';
import { TransportService } from './transport.service';

@Module({
  imports: [
    PointsModule,
    RoutesModule,
    MongooseModule.forFeature([
      { name: Transport.name, schema: TransportSchema },
    ]),
  ],
  controllers: [TransportController],
  providers: [TransportService],
  exports: [TransportService],
})
export class TransportModule {}
