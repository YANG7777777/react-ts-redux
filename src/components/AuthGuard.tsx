import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { store } from '@/store';

// 定义RootState类型
type RootState = ReturnType<typeof store.getState>;

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  // 从Redux store获取认证状态
  const { token, isAuthenticated } = useSelector((state: RootState) => {
    // 处理类型安全，确保state.auth存在
    return (state as any).auth || { token: null, isAuthenticated: false };
  });

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 延迟检查，给Redux Persist时间恢复状态
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 检查是否已认证
  const hasValidToken = token && isAuthenticated;

  if (isChecking) {
    // 正在检查，显示加载状态或空白
    return null;
  }

  if (!hasValidToken) {
    // 未认证，重定向到登录页面
    return <Navigate to="/login" replace />;
  }

  // 已认证，渲染子组件
  return <>{children}</>;
};

export default AuthGuard;
