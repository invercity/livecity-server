import { Body, Controller, Post } from '@nestjs/common';
import { GuideService, LatLngInput } from './guide.service';

@Controller('service/guide')
export class GuideController {
  constructor(private readonly guideService: GuideService) {}

  @Post()
  getPersonalRoute(
    @Body()
    body: {
      start: LatLngInput;
      end: LatLngInput;
      mode?: string;
    },
  ) {
    return this.guideService.getPersonalRoute(body.start, body.end);
  }
}
