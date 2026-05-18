import { useState, useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import styles from "../attendance.module.scss";
import CommonTable from "@/components/CommonTable";
import CommonForm from "@/components/CommonForm";
import { getClockRecordList, ClockRecordParams, ClockRecordResponse } from "@/api/attendance";
import CommonTitle from "@/components/CommonTitle";

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
    setSearchParams(values as ClockRecordParams);
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
      title: "员工ID",
      dataIndex: "employee_id",
      key: "employee_id",
      width: 80,
    },
    {
      title: "员工姓名",
      dataIndex: "employee_name",
      key: "employee_name",
    },
    {
      title: "上班打卡时间",
      dataIndex: "clock_in_time",
      key: "clock_in_time",
    },
    {
      title: "下班打卡时间",
      dataIndex: "clock_out_time",
      key: "clock_out_time",
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
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      key: "created_at",
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
            name="employee_name"
            label="员工姓名"
          >
            <Input placeholder="请输入员工姓名" />
          </Form.Item>

          <Form.Item<FormType>
            name="employee_id"
            label="员工ID"
          >
            <Input placeholder="请输入员工ID" />
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