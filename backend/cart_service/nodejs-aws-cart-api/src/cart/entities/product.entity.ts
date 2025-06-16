import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { CartItemEntity } from './cart-item.entity';

@Entity('products')
export class ProductEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @OneToMany(() => CartItemEntity, (cartItem) => cartItem.product)
  cartItems: CartItemEntity[];
}