import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  CreateNodeInput,
  RoutesService,
  UpsertRouteInput,
} from './routes.service';

@Controller()
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get('nodes')
  findAllNodes() {
    return this.routesService.findAllNodes();
  }

  @Get('nodes/:id')
  async findOneNode(@Param('id') id: string) {
    const node = await this.routesService.findNodeById(id);
    return { node };
  }

  @Post('nodes')
  async createNode(@Body() body: CreateNodeInput) {
    const node = await this.routesService.createNode(body);
    return { node };
  }

  @Delete('nodes/:id')
  async deleteNode(@Param('id') id: string) {
    await this.routesService.deleteNode(id);
    return { status: 'OK' };
  }

  @Get('routes')
  findAllRoutes() {
    return this.routesService.findAllRoutes();
  }

  @Get('routes/:id')
  async findOneRoute(@Param('id') id: string) {
    const route = await this.routesService.findRouteById(id);
    return { route };
  }

  @Post('routes')
  async createRoute(@Body() body: UpsertRouteInput) {
    const route = await this.routesService.createRoute(body);
    return { route };
  }

  @Put('routes/:id')
  async updateRoute(@Param('id') id: string, @Body() body: UpsertRouteInput) {
    const route = await this.routesService.updateRoute(id, body);
    return { route };
  }

  @Delete('routes/:id')
  async deleteRoute(@Param('id') id: string) {
    await this.routesService.deleteRoute(id);
    return { status: 'OK' };
  }
}
