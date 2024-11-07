import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Product } from './Product';
import { Document } from './Document';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'jsonb' })
  taxInfo!: any;

  @Column({ default: false })
  status!: boolean;

  @OneToMany(() => User, user => user.company)
  users!: User[];

  @OneToMany(() => Product, product => product.company)
  products!: Product[];

  @OneToMany(() => Document, document => document.company)
  documents!: Document[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}