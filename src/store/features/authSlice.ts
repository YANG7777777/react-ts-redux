import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UserInfo {
  id: number;
  username: string;
  email?: string;
  [key: string]: any;
}

interface AuthState {
  token: string | null;
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: null,
  userInfo: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 登录成功
    loginSuccess: (state, action: PayloadAction<{ token: string; userInfo?: UserInfo }>) => {
      state.token = action.payload.token;
      state.userInfo = action.payload.userInfo || null;
      state.isAuthenticated = true;
    },
    // 注销
    logout: (state) => {
      state.token = null;
      state.userInfo = null;
      state.isAuthenticated = false;
    },
    // 更新用户信息
    updateUserInfo: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
    },
    // 设置token（用于刷新token等场景）
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
  },
});

export const { loginSuccess, logout, updateUserInfo, setToken } = authSlice.actions;

export default authSlice.reducer;
