import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setToken, setUnauthorizedHandler } from '../utils/request';
import { logout } from '../store/features/authSlice';
import type { RootState } from '@/store';

const TokenManager = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();

  useEffect(() => {
    setToken(token);
  }, [token]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      dispatch(logout());
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    });
    return () => setUnauthorizedHandler(null);
  }, [dispatch]);

  return null;
};

export default TokenManager;
