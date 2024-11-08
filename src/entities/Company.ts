import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Product } from './Product';
import { CompanyDocument } from './CompanyDocument';
import { CompanyAddress } from './CompanyAddress';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'jsonb' })
  taxInfo!: {
    taxNumber: string;
    tradeRegistryNo?: string;
    mersisNo?: string;
  };

  @Column({ default: false })
  status!: boolean;

  @OneToMany(() => User, user => user.company)
  users!: User[];

  @OneToMany(() => Product, product => product.company)
  products!: Product[];

  @OneToMany(() => CompanyDocument, document => document.company)
  documents!: CompanyDocument[];

  @OneToMany(() => CompanyAddress, address => address.company)
  addresses!: CompanyAddress[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}