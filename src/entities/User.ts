import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Company } from './Company';

export enum UserRole {
  ADMIN = 'admin',
  COMPANY_ADMIN = 'company_admin',
  USER = 'user'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role!: UserRole;

  @Column({ type: 'jsonb', nullable: true })
  personalInfo?: any;

  @ManyToOne(() => Company, company => company.users)
  company!: Company;

  @Column()
  companyId!: string;

  @Column({ default: true })
  status!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}