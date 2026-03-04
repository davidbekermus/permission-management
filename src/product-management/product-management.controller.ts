import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProductManagementService } from './product-management.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/utils/roles.util';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductManagementController {
  constructor(private readonly service: ProductManagementService) {}

  /**
   * GET /products
   * Both PRODUCT_ADMIN and PRODUCT_USER can view products.
   */
  @Get()
  @Roles(Role.PRODUCT_ADMIN, Role.PRODUCT_USER)
  findAll() {
    return this.service.findAll();
  }

  /**
   * POST /products
   * PRODUCT_ADMIN only — add a product.
   */
  @Post()
  @Roles(Role.PRODUCT_ADMIN)
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  /**
   * DELETE /products/:id
   * PRODUCT_ADMIN only — remove a product.
   */
  @Delete(':id')
  @Roles(Role.PRODUCT_ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
