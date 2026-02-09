import { ConfigProvider } from "antd"; // Ant Design 全局配置组件 对其子组件进行全局配置
import zhCN from "antd/locale/zh_CN";
import Router from '@/routes/index'; // 应用的路由配置
import TokenManager from '@/components/TokenManager'; // Token 管理组件

// 应用的根组件，负责渲染整个应用的结构
function App() {
    return (
        <>
            <TokenManager />
            <ConfigProvider locale={zhCN}>
                <Router />
            </ConfigProvider>
        </>
    );
}

export default App;
