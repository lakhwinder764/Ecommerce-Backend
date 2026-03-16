import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private repo: Repository<Product>,
  ) {}

  create(dto: CreateProductDto, image?: Buffer, imageType?: string) {
    const { categoryId, ...rest } = dto;
    const product = this.repo.create({
      ...rest,
      image,
      imageType,
      ...(categoryId && { category: { id: categoryId } }),
    });
    return this.repo.save(product);
  }

  async findAll() {
    const products = await this.repo.find();
    return products.map((p) => this.toProductResponse(p));
  }

  async findOne(id: number) {
    const product = await this.repo.findOneBy({ id });
    return product ? this.toProductResponse(product) : null;
  }

  async findOneWithImage(id: number) {
    return this.repo.findOneBy({ id });
  }

  private toProductResponse(product: Product) {
    const { image, ...rest } = product;
    return {
      ...rest,
      hasImage: !!image,
      imageUrl: image ? `/products/image/${product.id}` : null,
    };
  }

  async update(id: number, dto: UpdateProductDto, image?: Buffer, imageType?: string) {
    const { categoryId, ...rest } = dto;
    const updateData: Partial<Product> = { ...rest };
    if (image) updateData.image = image;
    if (imageType) updateData.imageType = imageType;
    if (categoryId !== undefined) {
      (updateData as Record<string, unknown>).categoryId = categoryId || null;
    }
    await this.repo.update(id, updateData);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
