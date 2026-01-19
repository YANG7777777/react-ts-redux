import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {persistor, store} from './store';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import {PersistGate} from "redux-persist/integration/react";
import 'antd/dist/reset.css'; // Ant Design 5.x+ 推荐使用 reset.css

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </PersistGate>
        </Provider>
    </React.StrictMode>
);
