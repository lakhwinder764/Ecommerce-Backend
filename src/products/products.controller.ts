import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as express from 'express';
import { ProductService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductController {
  constructor(private service: ProductService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() dto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.create(dto, file?.buffer, file?.mimetype);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('image/:id')
  async getImage(@Param('id') id: number, @Res() res: express.Response) {
    const product = await this.service.findOneWithImage(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.image) {
      const imageType = product.imageType ?? 'image/jpeg';
      res.set({ 'Content-Type': imageType, 'Content-Length': product.image.length });
      res.send(product.image);
    } else if (product.imageUrl) {
      res.redirect(302, product.imageUrl);
    } else {
      throw new NotFoundException('Product image not found');
    }
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: number,
    @Body() dto: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.update(id, dto, file?.buffer, file?.mimetype);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
