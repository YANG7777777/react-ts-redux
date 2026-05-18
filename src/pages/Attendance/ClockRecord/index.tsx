import { useState, useEffect } from "react";
import { Space, Form, Input, Button, message, Modal } from "antd";
import styles from "../attendance.module.scss";
import CommonTable from "@/components/CommonTable";
import CommonForm from "@/components/CommonForm";
import { getClockRecordList, ClockRecordParams, ClockRecordResponse, deleteClockRecord } from "@/api/attendance";
import CommonTitle from "@/components/CommonTitle";

interface DataType extends ClockRecordResponse {
  key: string;
}

interface FormType {
  user_name?: string;
  id?: number;
}

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

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

  const onClockRecordDelete = (record: DataType) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除打卡记录 "${record.user_name}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteClockRecord(record.id);
          message.success('删除成功');
          fetchClockRecordList(searchParams);
        } catch (error) {
          console.error('删除打卡记录失败:', error);
          message.error('删除失败');
        }
      },
    });
  };

  const fetchClockRecordList = async (params: ClockRecordParams = {}) => {
    setLoading(true);
    try {
      const res = await getClockRecordList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...params
      });
      const formattedData = res.list.map((item) => ({
        ...item,
        key: String(item.id),
      }));
      setData(formattedData);
      setPagination((prev) => ({
        ...prev,
        total: res.total,
      }));
    } catch (error) {
      console.error('获取打卡记录列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClockRecordList(searchParams);
  }, [pagination.current, pagination.pageSize, searchParams]);

  const onFinish = async (values: FormType) => {
    setSearchParams(values);
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('表单验证失败:', errorInfo);
    message.error('请检查表单填写！');
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize,
    }));
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "员工姓名",
      dataIndex: "user_name",
      key: "user_name",
      width: 120,
    },
    {
      title: "上班打卡时间",
      dataIndex: "clock_in_time",
      key: "clock_in_time",
      width: 180,
    },
    {
      title: "下班打卡时间",
      dataIndex: "clock_out_time",
      key: "clock_out_time",
      width: 180,
    },
    {
      title: "工作日期",
      dataIndex: "work_date",
      key: "work_date",
      width: 120,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (text: number) => (
        <span className={text === 1 ? 'status-active' : 'status-inactive'}>
          {text === 1 ? '正常' : '异常'}
        </span>
      ),
      width: 100,
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: DataType) => (
        <Space size="middle">
          <Button onClick={() => onClockRecordDelete(record)} color="danger" variant="text">删除</Button>
        </Space>
      ),
      width: 120,
    },
  ];

  return (
    <div className={styles.attendance}>
      <CommonTitle title="打卡记录"></CommonTitle>

      <div className={styles.searchBox} style={{ marginBottom: 20 }}>
        <CommonForm<FormType>
          form={form}
          layout="inline"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          className={styles.searchForm}
        >
          <Form.Item<FormType>
            name="user_name"
            label="员工姓名"
          >
            <Input placeholder="请输入员工姓名" />
          </Form.Item>

          <Form.Item<FormType>
            name="id"
            label="记录ID"
          >
            <Input placeholder="请输入记录ID" />
          </Form.Item>

          <Form.Item className={styles.searchItem}>
            <Button type="primary" htmlType="submit">搜索</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => {
              form.resetFields();
              setSearchParams({});
              setPagination((prev) => ({ ...prev, current: 1 }));
            }}>重置</Button>
          </Form.Item>
        </CommonForm>
      </div>

      <div className={styles.tableBox}>
        <CommonTable<DataType>
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