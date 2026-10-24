import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ProductService } from './products.service';

// Read-only product routes in the shape the React storefront expects.
@Controller('api/products')
export class StorefrontProductController {
  constructor(private service: ProductService) {}

  // The storefront loads a single product with /api/products/?id=<id>.
  @Get()
  findAll(@Query('id', new ParseIntPipe({ optional: true })) id?: number) {
    if (id !== undefined) return this.service.findOneForStorefront(id);
    return this.service.findAllForStorefront();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneForStorefront(id);
  }
}
