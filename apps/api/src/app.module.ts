import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { GuideModule } from './guide/guide.module';
import { PointsModule } from './points/points.module';
import { RoutesModule } from './routes/routes.module';
import { TransportModule } from './transport/transport.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGODB_URI') ??
          'mongodb://localhost:27017/livecity',
      }),
    }),
    PointsModule,
    RoutesModule,
    TransportModule,
    GuideModule,
    AuthModule,
  ],
})
export class AppModule {}
