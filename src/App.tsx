import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import Router from './routes/index';
import TokenManager from './components/TokenManager';

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
