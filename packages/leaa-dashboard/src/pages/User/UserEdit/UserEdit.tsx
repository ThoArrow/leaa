import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';

import { User, Tag, Role } from '@leaa/common/src/entrys';
import { IAttachmentBoxRef } from '@leaa/common/src/interfaces';
import { UPDATE_BUTTON_ICON } from '@leaa/dashboard/src/constants';
import { UpdateUserInput } from '@leaa/common/src/dtos/user';
import { IPage, ICommenFormRef, ISubmitData, IHttpRes, IHttpError, ICrudListRes } from '@leaa/dashboard/src/interfaces';
import { msg, errorMsg, ajax } from '@leaa/dashboard/src/utils';

import { envConfig } from '@leaa/dashboard/src/configs';
import { PageCard, HtmlMeta, WYSIWYGEditor, Rcon, SubmitBar } from '@leaa/dashboard/src/components';

import { UserInfoForm } from '../_components/UserInfoForm/UserInfoForm';
import { UserRolesForm } from '../_components/UserRolesForm/UserRolesForm';
// import { UserExtForm } from '../_components/UserExtForm/UserExtForm';

import style from './style.module.less';
// import { UploadUserAvatar } from '@leaa/dashboard/src/pages/User/_components/UploadUserAvatar/UploadUserAvatar';

const API_PATH = 'users';

export default (props: IPage) => {
  const { t } = useTranslation();
  const { id } = props.match.params as { id: string };

  const infoFormRef = useRef<ICommenFormRef<UpdateUserInput>>(null);
  const rolesFormRef = useRef<ICommenFormRef<UpdateUserInput>>(null);

  const [item, setItem] = useState<User | undefined>();
  const [itemLoading, setItemLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [roles, setRoles] = useState<Role[]>();
  const [rolesLoading, setRolesLoading] = useState(false);

  const userContentRef = useRef<any>(null);
  const attachmentBoxRef = useRef<IAttachmentBoxRef>(null);
  const selectTagIdRef = useRef<any>(null);
  const [userTags, setUserTags] = useState<Tag[]>();

  const onFetchItem = () => {
    setItemLoading(true);

    ajax
      .get(`${envConfig.API_URL}/${envConfig.API_VERSION}/${API_PATH}/${id}`)
      .then((res: IHttpRes<User>) => {
        setItem(res.data.data);
      })
      .catch((err: IHttpError) => errorMsg(err.response?.data?.message || err.message))
      .finally(() => setItemLoading(false));
  };

  const onFetchRoles = () => {
    setRolesLoading(true);

    ajax
      .get(`${envConfig.API_URL}/${envConfig.API_VERSION}/roles`)
      .then((res: IHttpRes<ICrudListRes<Role>>) => {
        // console.log(res.data.data?.data);
        setRoles(res.data.data?.data);

        // setItem(res.data.data);
      })
      .catch((err: IHttpError) => errorMsg(err.response?.data?.message || err.message))
      .finally(() => setRolesLoading(false));
  };

  const onUpdateItem = async () => {
    const infoData: ISubmitData<UpdateUserInput> = await infoFormRef.current?.onValidateForm();
    const userRolesData: ISubmitData<UpdateUserInput> = await rolesFormRef.current?.onValidateForm();

    if (!infoData) return;
    if (!userRolesData) return;

    const data: ISubmitData<UpdateUserInput> = {
      ...infoData,
      ...userRolesData,
    };

    setSubmitLoading(true);

    ajax
      .patch(`${envConfig.API_URL}/${envConfig.API_VERSION}/${API_PATH}/${id}`, data)
      .then((res: IHttpRes<User>) => {
        setItem(res.data.data);

        msg(t('_lang:updatedSuccessfully'));
      })
      .catch((err: IHttpError) => errorMsg(err.response?.data?.message || err.message))
      .finally(() => setSubmitLoading(false));

    // attachments
    await attachmentBoxRef.current?.onUpdateAttachments();
  };

  useEffect(() => {
    onFetchItem();
    onFetchRoles();
  }, []);

  return (
    <PageCard route={props.route} title="@EDIT" className={style['wapper']} loading={itemLoading || submitLoading}>
      <HtmlMeta title={t(`${props.route.namei18n}`)} />

      <UserInfoForm item={item} loading={itemLoading} ref={infoFormRef} />

      <UserRolesForm
        ref={rolesFormRef}
        item={item}
        loading={false}
        // roles={getRolesQuery.data?.roles?.items || []}
        roles={roles || []}
      />

      <SubmitBar full>
        <Button
          type="primary"
          size="large"
          icon={<Rcon type={UPDATE_BUTTON_ICON} />}
          className="g-submit-bar-button"
          loading={submitLoading}
          onClick={onUpdateItem}
        >
          {t('_lang:update')}
        </Button>
      </SubmitBar>
    </PageCard>
  );
};
