import fs from 'fs';
import _ from 'lodash';
import { Express } from 'express';
import { Repository, In } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attachment } from '@leaa/common/src/entrys';
import {
  DeleteAttachmentsObject,
  UpdateAttachmentInput,
  UpdateAttachmentsInput,
  BatchUpdateAttachmentsSortInput,
} from '@leaa/common/src/dtos/attachment';
import { ISaveInOssSignature, ISaveInLocalSignature, IAttachmentParams } from '@leaa/common/src/interfaces';
import { logger, getAt2xPath, filenameAt1xToAt2x } from '@leaa/api/src/utils';
import { ConfigService } from '@leaa/api/src/modules/v1/config/config.service';
import { SaveInOssService } from '@leaa/api/src/modules/v1/attachment/save-in-oss.service';
import { SaveInLocalService } from '@leaa/api/src/modules/v1/attachment/save-in-local.service';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

const CLS_NAME = 'AttachmentService';

// @Injectable()
// export class AttachmentService {
@Injectable()
export class AttachmentService extends TypeOrmCrudService<Attachment> {
  constructor(
    @InjectRepository(Attachment) private readonly attachmentRepo: Repository<Attachment>,
    private readonly configService: ConfigService,
    private readonly saveInLocalServer: SaveInLocalService,
    private readonly saveInOssServer: SaveInOssService,
  ) {
    super(attachmentRepo);
  }

  getSignature(): Promise<ISaveInOssSignature | ISaveInLocalSignature> | null {
    if (this.configService.ATTACHMENT_SAVE_IN_OSS) return this.saveInOssServer.getSignature();
    if (this.configService.ATTACHMENT_SAVE_IN_LOCAL) return this.saveInLocalServer.getSignature();

    const errorMsg = 'Signature Missing SAVE_IN... Params';

    logger.warn(errorMsg, CLS_NAME);
    throw new NotFoundException(errorMsg);
  }

  // async attachments(args: IAttachmentsArgs): Promise<AttachmentsWithPaginationObject> {
  //   const nextArgs = argsFormat(args, gqlCtx);
  //
  //   const moduleFilter: IAttachmentDbFilterField = {};
  //
  //   if (nextArgs.moduleName) {
  //     moduleFilter.module_name = nextArgs.moduleName;
  //   }
  //
  //   if (nextArgs.moduleId) {
  //     moduleFilter.module_id = nextArgs.moduleId;
  //   }
  //
  //   if (nextArgs.typeName) {
  //     moduleFilter.type_name = nextArgs.typeName;
  //   }
  //
  //   if (nextArgs.typePlatform) {
  //     moduleFilter.type_platform = nextArgs.typePlatform;
  //   }
  //
  //   const qb = this.attachmentRepo.createQueryBuilder();
  //   qb.select().orderBy(nextArgs.orderBy || 'created_at', nextArgs.orderSort);
  //   qb.where(moduleFilter);
  //
  //   if (nextArgs.q) {
  //     const aliasName = new SelectQueryBuilder(qb).alias;
  //
  //     ['title', 'slug'].forEach((q) => {
  //       qb.orWhere(`${aliasName}.${q} LIKE :${q}`, { [q]: `%${nextArgs.q}%` });
  //     });
  //   }
  //
  //   if (!gqlCtx?.user || (gqlCtx.user && !can(gqlCtx.user, 'attachment.list-read--all-status'))) {
  //     qb.andWhere('status = :status', { status: 1 });
  //   }
  //
  //   if (nextArgs.orderBy && nextArgs.orderSort) {
  //     qb.orderBy({ [nextArgs.orderBy]: nextArgs.orderSort });
  //   } else {
  //     qb.orderBy({ sort: 'ASC' }).addOrderBy('created_at', 'ASC');
  //   }
  //
  //   return calcQbPageInfo({ qb, page: nextArgs.page, pageSize: nextArgs.pageSize });
  // }
  //
  // async attachment(uuid: string, args?: IAttachmentArgs): Promise<Attachment | undefined> {
  //   const { t } = gqlCtx;
  //
  //   if (!uuid) throw errorMsg(t('_error:notFoundId'), { gqlCtx });
  //
  //   let nextArgs: IAttachmentArgs = {};
  //
  //   if (args) nextArgs = args;
  //
  //   const whereQuery: { uuid: string; status?: number } = { uuid };
  //
  //   if (!gqlCtx?.user || (gqlCtx.user && !can(gqlCtx.user, 'attachment.item-read--all-status'))) {
  //     whereQuery.status = 1;
  //   }
  //
  //   return this.attachmentRepo.findOne({
  //     ...nextArgs,
  //     where: whereQuery,
  //   });
  // }

  async createAttachmentByLocal(body: IAttachmentParams, file: Express.Multer.File): Promise<Attachment | undefined> {
    return this.saveInLocalServer.createAttachmentByLocal(body, file);
  }

  async batchUpdate(dto: UpdateAttachmentsInput): Promise<string> {
    const safeAttas = dto.attachments.map((att) => _.pick(att, ['id', 'link', 'status', 'title', 'sort']));
    const batchUpdate = safeAttas.map((att) => this.attachmentRepo.update(att.id, att));

    return Promise.all(batchUpdate)
      .then((data) => {
        return `Batch Updated ${data.length} Attachment`;
      })
      .catch(() => {
        throw new NotFoundException();
      });
  }

  async batchUpdateSort(dto: BatchUpdateAttachmentsSortInput): Promise<string> {
    const safeAttas = dto.attachments.map((att) => _.pick(att, ['id', 'sort']));
    const batchUpdate = safeAttas.map((att) => this.attachmentRepo.update(att.id, { sort: att.sort }));

    return Promise.all(batchUpdate)
      .then(() => {
        return 'OK';
      })
      .catch(() => {
        throw new NotFoundException();
      });
  }

  // async updateAttachment(uuid: string, args: UpdateAttachmentInput): Promise<Attachment | undefined> {
  //   const { t } = gqlCtx;
  //
  //   if (!args) throw errorMsg(t('_error:notFoundArgs'), { gqlCtx });
  //
  //   let prevItem = await this.attachmentRepo.findOne({ uuid });
  //   if (!prevItem) throw errorMsg(t('_error:notFoundItem'), { gqlCtx });
  //
  //   prevItem = { ...prevItem, ...args };
  //   const nextItem = await this.attachmentRepo.save(prevItem);
  //
  //   logger.updateLog({ id: uuid, prevItem, nextItem, constructorName: CLS_NAME });
  //
  //   return nextItem;
  // }
  //
  // async updateAttachments(attachments: UpdateAttachmentsInput[]): Promise<AttachmentsObject> {
  //   const { t } = gqlCtx;
  //
  //   if (!attachments) throw errorMsg(t('_error:notFoundItems'), { gqlCtx });
  //
  //   const batchUpdate = attachments.map(async (attachment) => {
  //     await this.attachmentRepo.update({ uuid: attachment.uuid }, _.omit(attachment, ['uuid']));
  //   });
  //
  //   let items: Attachment[] = [];
  //
  //   await Promise.all(batchUpdate)
  //     .then(async () => {
  //       logger.log(JSON.stringify(attachments), CLS_NAME);
  //
  //       items = await this.attachmentRepo.find({ uuid: In(attachments.map((a) => a.uuid)) });
  //     })
  //     .catch(() => {
  //       logger.error(JSON.stringify(attachments), CLS_NAME);
  //     });
  //
  //   return {
  //     items,
  //   };
  // }

  async deleteAttachments(ids: string[]): Promise<DeleteAttachmentsObject | undefined> {
    const prevItems = await this.attachmentRepo.find({ id: In(ids) });
    if (!prevItems) throw new NotFoundException();

    const nextItem = await this.attachmentRepo.remove(prevItems);
    if (!nextItem) throw new NotFoundException();

    prevItems.forEach((i) => {
      if (i.at2x) {
        try {
          // delete local
          fs.unlinkSync(`${this.configService.PUBLIC_DIR}${getAt2xPath(i.path)}`);

          // delete oss
          logger.log(`delete local 2x file ${i.path}\n\n`, CLS_NAME);

          if (i.in_oss) {
            this.saveInOssServer.client.delete(filenameAt1xToAt2x(i.path.substr(1)));

            logger.log(`delete oss 2x file ${i.path}\n\n`, CLS_NAME);
          }
        } catch (err) {
          logger.error(`delete _2x item ${i.path} fail: ${JSON.stringify(i)}\n\n`, CLS_NAME, err);
        }
      }

      try {
        // delete local
        fs.unlinkSync(`${this.configService.PUBLIC_DIR}${i.path}`);
        logger.log(`delete local 1x file ${i.path}\n\n`, CLS_NAME);

        // delete oss
        if (i.in_oss) {
          this.saveInOssServer.client.delete(i.path.substr(1));

          logger.log(`delete oss 1x file ${i.path}\n\n`, CLS_NAME);
        }
      } catch (err) {
        logger.error(`delete file ${i.path} fail: ${JSON.stringify(i)}\n\n`, CLS_NAME, err);
      }
    });

    logger.log(`delete all-file ${ids} successful: ${JSON.stringify(nextItem)}\n\n`, CLS_NAME);

    return {
      items: nextItem.map((i) => i.id),
    };
  }
}
