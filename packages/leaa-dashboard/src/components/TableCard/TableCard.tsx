import React, { useState } from 'react';
import _ from 'lodash';
import { v4 } from 'uuid';
import prettyBytes from 'pretty-bytes';
import cx from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  IKey,
  ITableColumns,
  ICrudListQueryParams,
  ICrudListRes,
  ITableColumn,
  IRouteItem,
} from '@leaa/dashboard/src/interfaces';

import { DEFAULT_PAGE_SIZE_OPTIONS } from '@leaa/dashboard/src/constants';
import { formatOrderSort, calcTableSortOrder, transUrlQueryToCrudState } from '@leaa/dashboard/src/utils';
import { Table, Tag } from 'antd';
import { TableProps } from 'antd/es/table/Table';
import {
  TableColumnDate,
  TableColumnStatusSwitch,
  TableColumnDeleteButton,
  TableColumnId,
  TagMiniSets,
  Rcon,
  UserAvatar,
} from '@leaa/dashboard/src/components';

import style from './style.module.less';

declare type IColumnField = string | { [key: string]: any };

interface IProps<T> extends TableProps<T> {
  list?: ICrudListRes<T>;
  selectedRowBar?: React.ReactNode;
  selectedRowKeys?: IKey[];
  // columnFields?: IColumnField[];
  columnFields?: IColumnField[];
  //
  routerName: string;
  crudQuery: ICrudListQueryParams;
  setCrudQuery: (obj: ICrudListQueryParams) => void;
  route: IRouteItem;
}

export const TableCard = <T extends object>(props: IProps<T>) => {
  const { t } = useTranslation();
  const { crudQuery } = props;

  const [selectedRowKeys, setSelectedRowKeys] = useState<IKey[]>([]);

  const genSimpleColumn = (colName: string) => ({
    title: t(`_lang:${colName}`),
    dataIndex: colName,
    sorter: true,
    sortOrder: calcTableSortOrder(colName, crudQuery.sort),
    render: (text: string, record: any) => record[colName],
  });

  const columnSet: { [key: string]: ITableColumn | any } = {
    id: () => ({
      title: 'ID',
      dataIndex: 'id',
      width: 80, // ID
      sorter: true,
      sortOrder: calcTableSortOrder('id', crudQuery.sort),
      render: (id: string) => <TableColumnId id={id} link={`${props.route?.path}/${id}`} />,
    }),
    title: () => ({
      title: t('_lang:title'),
      dataIndex: 'title',
      sorter: true,
      sortOrder: calcTableSortOrder('title', crudQuery.sort),
      render: (text: string, record: any) => (
        <>
          <Link to={`${props.route?.path}/${record.id}`}>{record.title}</Link>
          {record.slug && <small className={style['col-slug']}>{record.slug}</small>}

          {record.tags && <TagMiniSets tags={record.tags} />}
        </>
      ),
    }),
    name: () => ({
      title: t('_lang:name'),
      dataIndex: 'name',
      sorter: true,
      sortOrder: calcTableSortOrder('name', crudQuery.sort),
      render: (text: string, record: any) => <Link to={`${props.route.path}/${record.id}`}>{record.name}</Link>,
    }),
    email: () => ({
      title: t('_lang:email'),
      dataIndex: 'email',
      sorter: true,
      sortOrder: calcTableSortOrder('email', crudQuery.sort),
      render: (text: string, record: any) => <Link to={`${props.route.path}/${record.id}`}>{record.email}</Link>,
    }),
    roleList: () => ({
      title: t('_lang:role'),
      dataIndex: 'role',
      sortOrder: calcTableSortOrder('name', crudQuery.sort),
      render: (text: string, record: any) => (
        <div>{record.roles && record.roles.map((r: any) => <Tag key={r.name}>{r.name}</Tag>)}</div>
      ),
    }),
    avatar: () => ({
      title: t('_lang:avatar'),
      dataIndex: 'avatar_url',
      width: 60,
      render: (avatar: string) => <UserAvatar url={avatar} />,
    }),
    isAdmin: () => ({
      title: <Rcon type="ri-vip-crown-2-line" />,
      width: 30,
      dataIndex: 'is_admin',
      sorter: true,
      sortOrder: calcTableSortOrder('name', crudQuery.sort),
      render: (text: string, record: any) => (record.is_admin ? <Rcon type="ri-vip-crown-2-line" /> : null),
    }),
    category: () => ({
      title: t('_lang:category'),
      dataIndex: 'category',
      width: 100,
      render: (text: string, record: any) => (
        <span>{record.categories && record.categories.length > 0 ? record.categories[0].name : '----'}</span>
      ),
    }),
    views: () => ({
      title: t('_lang:views'),
      dataIndex: 'views',
      width: 100,
      render: (text: string, record: any) => <small className="g-col-number">{record.views}</small>,
    }),
    createdAt: () => ({
      title: t('_lang:createdAt'),
      dataIndex: 'created_at',
      sorter: true,
      sortOrder: calcTableSortOrder('created_at', crudQuery?.sort),
      render: (text: string) => <TableColumnDate date={text} size="small" />,
    }),
    status: () => ({
      title: t('_lang:status'),
      dataIndex: 'status',
      width: 60,
      render: (text: string, record: any) => (
        <TableColumnStatusSwitch id={record.id} value={record.status} apiPath={props.routerName} size="small" />
      ),
    }),
    action: (options?: { fieldName?: string }) => ({
      title: t('_lang:action'),
      dataIndex: 'operation',
      width: 60,
      render: (text: string, record: any) => (
        <TableColumnDeleteButton
          id={record.id}
          tipsTitle={options?.fieldName ? record[options?.fieldName] : record.title}
          apiPath={props.routerName}
          onSuccessCallback={() => props.setCrudQuery(transUrlQueryToCrudState(window))}
        />
      ),
    }),
    byte: (options?: { fieldName?: string }) => ({
      title: t('_lang:size'),
      dataIndex: 'size',
      width: 75,
      sorter: true,
      sortOrder: calcTableSortOrder('size', crudQuery?.sort),
      render: (text: string, record: any) =>
        options?.fieldName ? <small>{prettyBytes(record[options?.fieldName])}</small> : null,
    }),
  };

  /**
   * 接收这几种状态
   *
   * 1，undefined
   * 2，['id', 'action']
   * 3，['id', { action: { p1: '1', p2: 'B'} }] -  {} 部分是参数
   * 4，['id', { render: => (<p />) }] - 原生 TableColumn
   * */
  const genColumns = (columnFields?: IColumnField[] | 'all'): ITableColumns => {
    const columnSetKeys = Object.keys(columnSet);

    if (columnFields === 'all') return Object.keys(columnSet).map((c) => columnSet[c]());

    if (_.isEmpty(columnFields)) return undefined;

    return _.map(columnFields, (field) => {
      // 如果 columnSet 没有这个 field，生成一个简单 column
      if (_.isString(field) && !columnSetKeys.includes(field)) return genSimpleColumn(field);

      // keys 包含 render，可认为是原生 TableColumn 直接 return
      if (_.isObject(field) && Object.keys(field).includes('render')) return field;

      // Object，解开
      if (_.isObject(field)) return columnSet[Object.keys(field)[0]](Object.values(field)[0]);

      // String，直接 return
      if (_.isString(field)) return columnSet[field]();

      return undefined;
    });
  };

  const rowSelection = {
    columnWidth: 30,
    onChange: (keys: IKey[]) => setSelectedRowKeys(keys),
    selectedRowKeys,
  };

  return (
    <div
      className={cx(
        style['wrapper'],
        { [style['selected-row-bar']]: props.selectedRowKeys && props.selectedRowKeys.length > 0 },
        props.className,
      )}
    >
      <div className={style['container']}>
        <Table
          showSorterTooltip={false}
          rowKey={props.rowKey || 'id'}
          size={props.size || 'small'}
          rowSelection={rowSelection}
          columns={genColumns(props?.columnFields) || props?.columns || genColumns('all')}
          dataSource={props.list?.data || []}
          pagination={{
            total: props.list?.total,
            current: props.list?.page,
            pageSize: crudQuery?.limit,
            pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
            showSizeChanger: true,
          }}
          onChange={(pagination, filters, sorter: any) => {
            props.setCrudQuery({
              ...crudQuery,
              limit: pagination.pageSize,
              page: pagination.current,
              sort: formatOrderSort(sorter),
            });
          }}
        />

        {props.selectedRowKeys && props.selectedRowKeys.length > 0 && (
          <div className={cx(style['selected-row-bar-wrapper'])}>
            <div className={style['selected-row-bar-container']}>
              <div className={style['total']}>
                {t('_comp:TableCard.selectedItems', { length: props.selectedRowKeys.length })}
              </div>
              <div className={style['tools']}>{props.selectedRowBar}</div>
            </div>
          </div>
        )}

        <div className={style['items-length']}>{t('_comp:TableCard.totalLength', { length: props.list?.total })}</div>
      </div>
    </div>
  );
};
