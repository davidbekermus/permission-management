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

// Default roles for this controller come from its owning flow module
// (see flows/product-flow.module.ts) — add @Roles()/@FlowRoles() here only
// if this controller needs to diverge from that default.
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductManagementController {
  constructor(private readonly service: ProductManagementService) {}


  @Get()
  findAll() {
    return this.service.findAll();
  }


  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }


  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
