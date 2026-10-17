import {
  BadRequestException,
  Body,
  Controller,
  Get,
  MessageEvent,
  Param,
  Post,
  Query,
  Sse,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TransportService } from './transport.service';

@Controller()
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Get('transport')
  findAll() {
    return this.transportService.findAll();
  }

  /**
   * Native Server-Sent Events (SSE) endpoint replacing Socket.IO
   */
  @Sse('transport/stream')
  streamTransportEvents(): Observable<MessageEvent> {
    return this.transportService.getEventsStream();
  }

  @Get('service/arrival/:id')
  getArrival(@Param('id') id: string) {
    return this.transportService.getPointArrivalInfo(id);
  }

  @Post('service/transport')
  handleTransportAction(
    @Query('act') act: 'init' | 'end' | 'report',
    @Body()
    body: {
      _id?: string;
      route?: string;
      lat?: number;
      lng?: number;
    },
  ) {
    if (act === 'init') {
      return this.transportService.initTransport(
        Number(body.lat),
        Number(body.lng),
      );
    }
    if (act === 'end') {
      if (!body._id) {
        throw new BadRequestException('_id is required');
      }
      return this.transportService.endTransport(body._id);
    }
    if (act === 'report') {
      if (!body._id || !body.route) {
        throw new BadRequestException('_id and route are required');
      }
      return this.transportService.updateTransportData(
        body._id,
        body.route,
        Number(body.lat),
        Number(body.lng),
      );
    }
    throw new BadRequestException('Unsupported action');
  }
}
