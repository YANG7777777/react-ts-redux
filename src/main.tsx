import React, { Suspense } from 'react'; // React 18.x+ 推荐使用 Suspense 来处理异步组件加载（如懒加载路由）
import ReactDOM from 'react-dom/client'; // React 18.x+ 推荐使用 ReactDOM.createRoot 来创建根节点
import './index.css'; // 项目样式文件
import App from './App'; // 根组件
import { persistor, store } from './store'; // 导入 Redux 的 store（状态管理）和 persistor（用于 redux-persist 状态持久化）。
import { Provider } from 'react-redux'; // Redux 的 Provider，使整个应用能访问 Redux store。
import { PersistGate } from "redux-persist/integration/react"; // redux-persist 的组件，用于在状态恢复期间延迟渲染子组件。
import 'antd/dist/reset.css'; // Ant Design 5.x+ 推荐使用 reset.css

// 创建根节点
const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
// 渲染应用
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <Suspense fallback={<div>Loading...</div>}>
                    <App />
                </Suspense>
            </PersistGate>
        </Provider>
    </React.StrictMode>,
);
