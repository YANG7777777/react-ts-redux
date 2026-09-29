import { useState, useEffect } from 'react';
import { Form, Input, Button, InputNumber, message } from 'antd';
import styles from '../attendance.module.scss';
import CommonTable from '@/components/CommonTable';
import CommonForm from '@/components/CommonForm';
import {
  getClockRecordList,
  type ClockRecordParams,
  type ClockRecordResponse,
} from '@/api/attendance';
import CommonTitle from '@/components/CommonTitle';

interface DataType extends ClockRecordResponse {
  key: string;
}

interface FormType {
  employee_name?: string;
  employee_id?: number;
}

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

const statusMap: Record<number, string> = {
  0: '未完成',
  1: '已上班',
  2: '已完成',
};

const ClockRecordPage = () => {
  const [form] = Form.useForm<FormType>();
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<ClockRecordParams>({});
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchClockRecordList = async (params: ClockRecordParams = {}) => {
    setLoading(true);
    try {
      const res = await getClockRecordList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...params,
      });
      setData(
        res.list.map((item) => ({
          ...item,
          key: String(item.id),
        }))
      );
      setPagination((prev) => ({
        ...prev,
        total: res.total,
      }));
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取打卡记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClockRecordList(searchParams);
  }, [pagination.current, pagination.pageSize, searchParams]);

  const onFinish = (values: FormType) => {
    setSearchParams(values);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  };

  const columns = [
    {
      title: '员工ID',
      dataIndex: 'employee_id',
      key: 'employee_id',
      width: 100,
    },
    {
      title: '员工姓名',
      dataIndex: 'employee_name',
      key: 'employee_name',
    },
    {
      title: '工作日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '上班打卡',
      dataIndex: 'clock_in_time',
      key: 'clock_in_time',
      render: (text?: string) => text || '-',
    },
    {
      title: '下班打卡',
      dataIndex: 'clock_out_time',
      key: 'clock_out_time',
      render: (text?: string) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text: number, record: DataType) => (
        <span
          className={
            text === 2
              ? styles['status-active']
              : text === 1
                ? styles['status-pending']
                : styles['status-inactive']
          }
        >
          {record.status_name || statusMap[text] || '未知'}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
  ];

  return (
    <div className={styles.attendance}>
      <CommonTitle title="打卡记录" />

      <div className={styles.searchBox}>
        <CommonForm<FormType>
          form={form}
          layout="inline"
          onFinish={onFinish}
          className={styles.searchForm}
        >
          <Form.Item<FormType> name="employee_name" label="员工姓名">
            <Input placeholder="请输入员工姓名" allowClear />
          </Form.Item>

          <Form.Item<FormType> name="employee_id" label="员工ID">
            <InputNumber placeholder="请输入员工ID" style={{ width: 160 }} min={1} />
          </Form.Item>

          <Form.Item className={styles.searchItem}>
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
            <Button
              onClick={() => {
                form.resetFields();
                setSearchParams({});
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
            >
              重置
            </Button>
          </Form.Item>
        </CommonForm>
      </div>

      <div className={styles.tableBox}>
        <CommonTable<DataType>
          fillHeight
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `共 ${total} 条`,
            onChange: handlePaginationChange,
          }}
        />
      </div>
    </div>
  );
};

export default ClockRecordPage;
