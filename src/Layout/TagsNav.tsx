import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tag } from 'antd';
import { HomeOutlined, PushpinFilled } from '@ant-design/icons';
import { BaseRoutes } from '../routes/routes';
import styles from './tagsNav.module.scss';

interface RouteMeta {
  path: string;
  title: string;
  icon?: ReactNode;
  affix?: boolean;
}

interface TagItem extends RouteMeta {
  closable: boolean;
}

const flattenRoutes = (routes: typeof BaseRoutes): RouteMeta[] => {
  const result: RouteMeta[] = [];
  routes.forEach((route) => {
    if (route.meta?.title && route.path) {
      if ('element' in route && route.element) {
        result.push({
          path: route.path,
          title: route.meta.title,
          icon: route.meta.icon,
          affix: route.path === '/home',
        });
      }
    }
    if (route.children?.length) {
      result.push(...flattenRoutes(route.children as typeof BaseRoutes));
    }
  });
  return result;
};

const HOME_TAG: TagItem = {
  path: '/home',
  title: '首页',
  icon: <HomeOutlined />,
  affix: true,
  closable: false,
};

const TagsNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const routeMap = useMemo(() => {
    const map = new Map<string, RouteMeta>();
    flattenRoutes(BaseRoutes).forEach((item) => map.set(item.path, item));
    return map;
  }, []);

  const [tags, setTags] = useState<TagItem[]>([HOME_TAG]);

  useEffect(() => {
    const path = location.pathname;
    const meta = routeMap.get(path);
    if (!meta) return;

    setTags((prev) => {
      if (prev.some((t) => t.path === path)) return prev;
      return [
        ...prev,
        {
          ...meta,
          closable: !meta.affix,
        },
      ];
    });
  }, [location.pathname, routeMap]);

  const handleClick = (path: string) => {
    if (path !== location.pathname) {
      navigate(path);
    }
  };

  const handleClose = (e: MouseEvent<HTMLElement>, targetPath: string) => {
    e.preventDefault();
    e.stopPropagation();

    setTags((prev) => {
      const next = prev.filter((t) => t.path !== targetPath);
      if (location.pathname === targetPath) {
        const closedIndex = prev.findIndex((t) => t.path === targetPath);
        const fallback = next[closedIndex - 1] ?? next[closedIndex] ?? HOME_TAG;
        navigate(fallback.path);
      }
      return next.length ? next : [HOME_TAG];
    });
  };

  return (
    <div className={styles.tagsNav}>
      <div className={styles.tagsList}>
        {tags.map((tag) => {
          const active = tag.path === location.pathname;
          return (
            <Tag
              key={tag.path}
              className={`${styles.tag} ${active ? styles.active : ''}`}
              closable={tag.closable}
              onClose={(e) => handleClose(e, tag.path)}
              onClick={() => handleClick(tag.path)}
              icon={tag.icon}
            >
              <span className={styles.title}>{tag.title}</span>
              {tag.affix && !tag.closable && (
                <PushpinFilled className={styles.pin} />
              )}
            </Tag>
          );
        })}
      </div>
    </div>
  );
};

export default TagsNav;
