import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // 默认使用localStorage
import counterReducer from './features/counterSlice';

const persistConfig = {
    key: 'root',
    storage,
    // 可以选择哪些reducer需要持久化
    whitelist: ['counter']
};

const persistedReducer = persistReducer(persistConfig, counterReducer);

export const store = configureStore({
    reducer: {
        counter: persistedReducer, // 替换原来的counterReducer
        // 其他reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false, // 避免持久化相关的序列化检查警告
    }),
});

export const persistor = persistStore(store);
