import { Form, Input, Button, Card, Divider, message } from 'antd';
import { LockOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './login.module.scss';
import { login } from '../../api/login';
import type { LoginParams } from '../../api/login';
import { encryptRSA, fetchAndSetPublicKey } from '../../utils/encrypt';
import { loginSuccess } from '../../store/features/authSlice';
import type { RootState } from '../../store';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingKey, setFetchingKey] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchKey = async () => {
      try {
        await fetchAndSetPublicKey();
      } catch {
        message.error('获取公钥失败，请刷新页面重试');
      } finally {
        setFetchingKey(false);
      }
    };
    fetchKey();
  }, []);

  useEffect(() => {
    if (token && isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [token, isAuthenticated, navigate]);

  const onFinish = async (values: LoginParams) => {
    setLoading(true);
    try {
      let password = values.password;
      const maxPasswordLength = 72;
      const passwordByteLength = new Blob([password]).size;

      if (passwordByteLength > maxPasswordLength) {
        let truncatedPassword = password;
        while (new Blob([truncatedPassword]).size > maxPasswordLength && truncatedPassword.length > 0) {
          truncatedPassword = truncatedPassword.slice(0, -1);
        }
        password = truncatedPassword;
      }

      const data = await login({
        ...values,
        password: encryptRSA(password),
      });

      dispatch(
        loginSuccess({
          token: data.token,
          userInfo: data.userInfo,
        })
      );

      message.success('登录成功');
      navigate('/home');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Card className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.systemLogo}>
            <TeamOutlined />
          </div>
          <div className={styles.systemName}>员工管理系统</div>
          <Divider />
        </div>
        <Form name="login" onFinish={onFinish} autoComplete="off" className={styles.loginForm}>
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名!' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item className={styles.loginButtonContainer}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading || fetchingKey}
              disabled={fetchingKey}
              block
            >
              {fetchingKey ? '加载中...' : '登录'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
