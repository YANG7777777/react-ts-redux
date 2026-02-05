import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { setToken } from '../utils/request';
import { store } from '../store';
import { logout } from '../store/features/authSlice';

// 定义RootState类型
type RootState = ReturnType<typeof store.getState>;

const TokenManager = () => {
  // 从Redux store获取token
  const token = useSelector((state: RootState) => (state as any).auth?.token || null);
  
  useEffect(() => {
    // 当token变化时，更新请求工具中的token
    setToken(token);
    console.log('Token updated in request tool:', token);
  }, [token]);
  
  useEffect(() => {
    // 监听浏览器关闭/刷新事件
    const handleBeforeUnload = (_e: BeforeUnloadEvent) => {
      // 调用logout action清空缓存
      store.dispatch(logout());
    };
    
    // 添加事件监听
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // 组件卸载时移除事件监听
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  // 该组件不需要渲染任何内容
  return null;
};

export default TokenManager;
