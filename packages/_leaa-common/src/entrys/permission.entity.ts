import { Index, Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { ObjectType, Field, Int } from 'type-graphql';

import { Role } from './role.entity';

@Entity('permissions')
@Index('permissions_name_unique', ['name'], { unique: true })
@Index('permissions_slug_unique', ['slug'], { unique: true })
@ObjectType()
export class Permission {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column({ type: 'varchar', length: 32, unique: true })
  @Field()
  name!: string;

  @Column({ type: 'varchar', length: 32, unique: true })
  @Field()
  slug!: string;

  @Field()
  slugGroup!: string;

  @ManyToMany(() => Role, role => role.permissions)
  @Field(() => [Role], { nullable: true })
  roles?: Role[];

  //
  //

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  @Field(() => Date)
  createdAt!: Date;

  @Column({ nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true })
  deletedAt?: Date;
}
