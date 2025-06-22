import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Cart, CartStatuses } from '../models';
import { PutCartPayload } from 'src/order/type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartEntity, CartItemEntity } from '../entities';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private cartRepository: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private cartItemRepository: Repository<CartItemEntity>,
  ) {}

  async findByUserId(userId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { userId, status: CartStatuses.OPEN },
      relations: ['items'],
    });

    if (!cart) return null;

    return this.mapEntityToModel(cart);
  }

  async createByUserId(userId: string): Promise<Cart> {
    const cart = new CartEntity();
    cart.id = randomUUID();
    cart.userId = userId;
    cart.status = CartStatuses.OPEN;
    cart.items = [];

    const savedCart = await this.cartRepository.save(cart);
    return this.mapEntityToModel(savedCart);
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  async updateByUserId(userId: string, payload: PutCartPayload): Promise<Cart> {
    let cart = await this.findByUserId(userId);
    
    if (!cart) {
      cart = await this.createByUserId(userId);
    }

    // Find existing cart item
    const cartEntity = await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['items'],
    });

    const existingItemIndex = cartEntity.items.findIndex(
      (item) => item.product.id === payload.product.id,
    );

    // Handle item update or removal
    if (existingItemIndex !== -1) {
      if (payload.count === 0) {
        // Remove item if count is 0
        await this.cartItemRepository.remove(cartEntity.items[existingItemIndex]);
      } else {
        // Update count if item exists
        cartEntity.items[existingItemIndex].count = payload.count;
        await this.cartItemRepository.save(cartEntity.items[existingItemIndex]);
      }
    } else if (payload.count > 0) {
      // Add new item if it doesn't exist and count > 0
      const newItem = new CartItemEntity();
      newItem.cart = cartEntity;
      newItem.product = payload.product;
      newItem.count = payload.count;
      
      await this.cartItemRepository.save(newItem);
    }

    // Refresh cart data
    const updatedCart = await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['items'],
    });

    return this.mapEntityToModel(updatedCart);
  }

  async removeByUserId(userId: string): Promise<void> {
    const cart = await this.findByUserId(userId);
    if (cart) {
      await this.cartRepository.delete(cart.id);
    }
  }

  private mapEntityToModel(entity: CartEntity): Cart {
    return {
      id: entity.id,
      user_id: entity.userId,
      created_at: entity.createdAt.getTime(),
      updated_at: entity.updatedAt.getTime(),
      status: entity.status,
      items: entity.items.map(item => ({
        product: item.product,
        count: item.count,
      })),
    };
  }
}