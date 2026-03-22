import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';

export interface Product {
  id: number;
  name: string;
  price: number;
  category?: string;
}

/**
 * In-memory product catalog — no database.
 * Demonstrates a flow protected by PRODUCT_ADMIN / PRODUCT_USER roles.
 */
@Injectable()
export class ProductManagementService {
  private nextId = 1;

  /** Seed data so the GET endpoint returns something immediately. */
  private readonly products: Product[] = [
    { id: this.nextId++, name: 'Laptop Pro', price: 1299.99, category: 'Electronics' },
    { id: this.nextId++, name: 'Wireless Mouse', price: 29.99, category: 'Accessories' },
    { id: this.nextId++, name: 'Mechanical Keyboard', price: 79.99, category: 'Accessories' },
  ];

  findAll(): Product[] {
    return this.products;
  }

  create(dto: CreateProductDto): Product {
    const product: Product = { id: this.nextId++, ...dto };
    this.products.push(product);
    return product;
  }

  remove(id: number): { deleted: boolean; id: number } {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) throw new NotFoundException(`Product ${id} not found`);
    this.products.splice(index, 1);
    return { deleted: true, id };
  }
}
