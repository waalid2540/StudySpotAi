import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('parent_child_links')
export class ParentChildLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  parent_id: string;

  @Column('uuid')
  student_id: string;

  @Column({ length: 6 })
  link_code: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  linked_at: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'parent_id' })
  parent: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;
}
