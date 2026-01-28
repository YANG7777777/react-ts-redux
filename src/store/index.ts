import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // 默认使用localStorage
import counterReducer from './features/counterSlice';
import authReducer from './features/authSlice';

const persistConfig = {
    key: 'root',
    storage,
};

// 创建持久化的reducer
const persistedCounterReducer = persistReducer({
    ...persistConfig,
    key: 'counter'
}, counterReducer);

const persistedAuthReducer = persistReducer({
    ...persistConfig,
    key: 'auth'
}, authReducer);

// 创建根reducer
const rootReducer = {
    counter: persistedCounterReducer,
    auth: persistedAuthReducer,
};

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false, // 避免持久化相关的序列化检查警告
    }),
});

export const persistor = persistStore(store);
