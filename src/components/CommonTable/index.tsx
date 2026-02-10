import { Table } from "antd";
import type { TableProps } from "antd";

interface CommonTableProps<T extends object> extends TableProps<T> {
  className?: string;
}

const CommonTable = <T extends object>({
  className,
  ...props
}: CommonTableProps<T>) => {
  return <Table<T> className={className} {...props} />;
};

export default CommonTable;
