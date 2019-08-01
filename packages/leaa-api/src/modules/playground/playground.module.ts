import { Module } from '@nestjs/common';

import { PermissionModule } from '@leaa/api/modules/permission/permission.module';
import { RoleModule } from '@leaa/api/modules/role/role.module';
import { UserModule } from '@leaa/api/modules/user/user.module';

import { PlaygroundService } from '@leaa/api/modules/playground/playground.service';
import { PlaygroundController } from '@leaa/api/modules/playground/playground.controller';

@Module({
  imports: [PermissionModule, RoleModule, UserModule],
  providers: [PlaygroundService],
  controllers: [PlaygroundController],
  exports: [PlaygroundService],
})
export class PlaygroundModule {}
