import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Company } from './Company';
import { DPC } from './DPC';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'jsonb' })
  details!: any;

  @Column({ default: true })
  status!: boolean;

  @ManyToOne(() => Company, company => company.products)
  company!: Company;

  @Column()
  companyId!: string;

  @OneToMany(() => DPC, dpc => dpc.product)
  dpcs!: DPC[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}