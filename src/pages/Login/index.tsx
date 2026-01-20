import { Form, Input, Button, Card, Typography, Divider, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import styles from './login.module.scss';
import { login } from '../../api/login';
import type { LoginParams } from '../../api/login';
import { encryptRSA, fetchAndSetPublicKey } from '../../utils/encrypt';
import { loginSuccess } from '../../store/features/authSlice';

const { Title } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingKey, setFetchingKey] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // 组件加载时获取公钥
  useEffect(() => {
    const fetchKey = async () => {
      try {
        await fetchAndSetPublicKey();
      } catch (error) {
        console.error('获取公钥失败:', error);
        message.error('获取公钥失败，请刷新页面重试');
      } finally {
        setFetchingKey(false);
      }
    };

    fetchKey();
  }, []);

  const onFinish = async (values: LoginParams) => {
    setLoading(true);
    try {
      // 这里可以添加登录逻辑
      console.log('Login values:', values);
      
      // 检查密码长度并截断到最大72字节
      let password = values.password;
      const maxPasswordLength = 72;
      
      // 计算密码的字节长度（考虑多字节字符）
      const passwordByteLength = new Blob([password]).size;
      
      if (passwordByteLength > maxPasswordLength) {
        console.warn(`密码超过${maxPasswordLength}字节，将截断`);
        // 截断密码
        let truncatedPassword = password;
        while (new Blob([truncatedPassword]).size > maxPasswordLength && truncatedPassword.length > 0) {
          truncatedPassword = truncatedPassword.slice(0, -1);
        }
        password = truncatedPassword;
        console.log('截断后的密码:', password);
      }
      
      // 对密码进行RSA加密
      const encryptedValues = {
        ...values,
        password: encryptRSA(password)
      };
      console.log('Encrypted values:', encryptedValues);
      
      // 使用新的login API接口
      const data = await login(encryptedValues);
      console.log('Login success:', data);
      
      // 将token和用户信息保存到Redux store
      dispatch(loginSuccess({
        token: data.token,
        userInfo: data.userInfo
      }));
      
      // 登录成功后的处理
      message.success('登录成功');
      // 跳转到首页
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
      message.error(error instanceof Error ? error.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Card className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <Title level={2} className={styles.loginTitle}>登录</Title>
          <Divider />
        </div>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
          className={styles.loginForm}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="用户名"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item className={styles.loginButtonContainer}>
            <Button type="primary" htmlType="submit" loading={loading || fetchingKey} disabled={fetchingKey} block>
              {fetchingKey ? '加载中...' : '登录'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
