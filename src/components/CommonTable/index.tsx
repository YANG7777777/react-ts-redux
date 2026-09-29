import { useEffect, useRef, useState } from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import styles from './commonTable.module.scss';

interface CommonTableProps<T extends object> extends TableProps<T> {
  className?: string;
  /** 撑满父容器剩余高度，表体超出时内部滚动 */
  fillHeight?: boolean;
}

const CommonTable = <T extends object>({
  className,
  fillHeight = false,
  scroll,
  pagination,
  ...props
}: CommonTableProps<T>) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState<number>();

  useEffect(() => {
    if (!fillHeight) return;
    const el = wrapRef.current;
    if (!el) return;

    const update = () => {
      // 优先用表格区域实际高度（flex 已扣除分页），再减去表头
      const tableEl = el.querySelector('.ant-table') as HTMLElement | null;
      const headerEl =
        (el.querySelector('.ant-table-header') as HTMLElement | null) ||
        (el.querySelector('.ant-table-thead') as HTMLElement | null);

      if (tableEl && headerEl) {
        const y = tableEl.clientHeight - headerEl.offsetHeight;
        setScrollY(Math.max(Math.floor(y), 80));
        return;
      }

      // 首屏尚未渲染出表格结构时的兜底
      const paginationEl = el.querySelector('.ant-table-pagination') as HTMLElement | null;
      let paginationH = pagination === false ? 0 : 64;
      if (paginationEl) {
        const cs = getComputedStyle(paginationEl);
        paginationH =
          paginationEl.offsetHeight +
          (parseFloat(cs.marginTop) || 0) +
          (parseFloat(cs.marginBottom) || 0);
      }
      const headerH = headerEl?.offsetHeight ?? 39;
      setScrollY(Math.max(Math.floor(el.clientHeight - headerH - paginationH), 80));
    };

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(update);
    });
    ro.observe(el);
    update();
    const t1 = window.setTimeout(update, 0);
    const t2 = window.setTimeout(update, 50);

    return () => {
      ro.disconnect();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [fillHeight, pagination, props.dataSource, props.loading]);

  const mergedScroll = fillHeight
    ? {
        ...scroll,
        y: scrollY ?? (typeof scroll === 'object' ? scroll?.y : undefined),
      }
    : scroll;

  if (!fillHeight) {
    return (
      <Table<T>
        className={className}
        scroll={scroll}
        pagination={pagination}
        {...props}
      />
    );
  }

  return (
    <div ref={wrapRef} className={styles.fillWrap}>
      <Table<T>
        className={className}
        scroll={mergedScroll}
        pagination={pagination}
        {...props}
      />
    </div>
  );
};

export default CommonTable;
