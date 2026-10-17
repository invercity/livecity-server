import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PointsService, UpsertPointInput } from './points.service';

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get()
  findAll() {
    return this.pointsService.findAll();
  }

  @Get('near')
  findNear(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    return this.pointsService.findNear(
      Number(lat),
      Number(lng),
      radius ? Number(radius) : 500,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const point = await this.pointsService.findById(id);
    return { point };
  }

  @Post()
  async create(@Body() body: UpsertPointInput) {
    const point = await this.pointsService.create(body);
    return { point };
  }

  /**
   * Endpoint to register or fetch a stop directly from a Google Maps transit stop POI click
   */
  @Post('from-google-place')
  async upsertFromGooglePlace(
    @Body()
    body: {
      googlePlaceId: string;
      title: string;
      lat: number;
      lng: number;
    },
  ) {
    const point = await this.pointsService.upsertFromGooglePlace(body);
    return { point };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<UpsertPointInput>) {
    const point = await this.pointsService.update(id, body);
    return { point };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.pointsService.remove(id);
    return { status: 'OK' };
  }
}
