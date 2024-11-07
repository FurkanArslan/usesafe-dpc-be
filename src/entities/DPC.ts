import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Product } from './Product';

export enum DPCStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

@Entity('dpcs')
export class DPC {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Product, product => product.dpcs)
  product!: Product;

  @Column()
  productId!: string;

  @Column({ type: 'jsonb' })
  certificationDetails!: any;

  @Column({ nullable: true })
  blockchainHash?: string;

  @Column({
    type: 'enum',
    enum: DPCStatus,
    default: DPCStatus.PENDING
  })
  status!: DPCStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}