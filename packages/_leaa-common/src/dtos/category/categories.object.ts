import { ObjectType, Field } from 'type-graphql';

import { Category } from '@leaa/common/entrys';
import { PaginationObject } from '@leaa/common/dtos/_common';

@ObjectType()
export class CategoriesObject extends PaginationObject {
  @Field(() => [Category])
  readonly items: Category[] = [];
}
