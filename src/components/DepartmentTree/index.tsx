import React, { useMemo } from 'react';
import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import type { DepartmentResponse } from '@/api/department';

interface DepartmentTreeProps {
  departments: DepartmentResponse[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

const buildTreeData = (
  departments: DepartmentResponse[],
  parentId: number | undefined = undefined
): DataNode[] => {
  return departments
    .filter((dept) => {
      if (parentId === undefined) {
        return dept.parent_id === undefined || dept.parent_id === null || dept.parent_id === 0;
      }
      return dept.parent_id === parentId;
    })
    .map((dept) => {
      const children = buildTreeData(departments, dept.id);
      return {
        title: dept.dept_name,
        key: String(dept.id),
        children: children.length > 0 ? children : undefined,
      };
    });
};

const DepartmentTree: React.FC<DepartmentTreeProps> = ({
  departments,
  selectedId,
  onSelect,
}) => {
  const treeData = useMemo(() => buildTreeData(departments), [departments]);

  const onTreeSelect = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length > 0) {
      onSelect(Number(selectedKeys[0]));
    } else {
      onSelect(null);
    }
  };

  if (treeData.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>暂无部门数据</div>
    );
  }

  return (
    <Tree
      showLine
      defaultExpandAll
      selectedKeys={selectedId ? [String(selectedId)] : []}
      onSelect={onTreeSelect}
      treeData={treeData}
    />
  );
};

export default DepartmentTree;
