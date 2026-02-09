import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { setToken } from '../utils/request';
import { store } from '@/store';

// 定义RootState类型
type RootState = ReturnType<typeof store.getState>;

const TokenManager = () => {
  // 从Redux store获取token
  const token = useSelector((state: RootState) => (state as any).auth?.token || null);

  useEffect(() => {
    // 当token变化时，更新请求工具中的token
    setToken(token);
  }, [token]);

  // 该组件不需要渲染任何内容
  return null;
};

export default TokenManager;
