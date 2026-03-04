import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';

export interface StoreItem {
  id: number;
  name: string;
  price: number;
  description?: string;
}

/**
 * In-memory store — no database.
 * Demonstrates a flow protected by STORE_ADMIN / STORE_USER roles.
 */
@Injectable()
export class StoreManagementService {
  private nextId = 1;

  /** Seed data so the GET endpoint returns something interesting immediately. */
  private readonly items: StoreItem[] = [
    { id: this.nextId++, name: 'Widget A', price: 9.99, description: 'A standard widget' },
    { id: this.nextId++, name: 'Widget B', price: 19.99, description: 'A premium widget' },
    { id: this.nextId++, name: 'Gadget X', price: 49.99, description: 'A useful gadget' },
  ];

  findAll(): StoreItem[] {
    return this.items;
  }

  create(dto: CreateItemDto): StoreItem {
    const item: StoreItem = { id: this.nextId++, ...dto };
    this.items.push(item);
    return item;
  }

  remove(id: number): { deleted: boolean; id: number } {
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) throw new NotFoundException(`Store item ${id} not found`);
    this.items.splice(index, 1);
    return { deleted: true, id };
  }
}
