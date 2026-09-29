import { useEffect, useRef, useState } from 'react';
import { Button, Input, message, Tag } from 'antd';
import {
  ClearOutlined,
  RobotOutlined,
  SendOutlined,
  StopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import CommonTitle from '../../components/CommonTitle';
import { askAIStream } from '../../api/ai';
import styles from './ai.module.scss';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  '请假流程是怎样的？',
  '加班申请需要注意什么？',
  '打卡记录有哪些状态？',
  '如何区分登录名和员工姓名？',
];

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const AIPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const stopGenerating = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  };

  const sendQuestion = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: createId(),
      role: 'user',
      content: trimmed,
    };
    const assistantId = createId();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await askAIStream(
        trimmed,
        (chunk) => {
          setMessages((prev) =>
            prev.map((item) =>
              item.id === assistantId
                ? { ...item, content: item.content + chunk }
                : item
            )
          );
        },
        controller.signal
      );
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        setMessages((prev) =>
          prev.map((item) =>
            item.id === assistantId && !item.content
              ? { ...item, content: '（已停止生成）' }
              : item
          )
        );
      } else {
        const errText = error instanceof Error ? error.message : '请求失败';
        message.error(errText);
        setMessages((prev) =>
          prev.map((item) =>
            item.id === assistantId
              ? { ...item, content: item.content || `抱歉，出错了：${errText}` }
              : item
          )
        );
      }
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (loading) {
      stopGenerating();
    }
    setMessages([]);
    setInput('');
  };

  return (
    <div className={styles.page}>
      <CommonTitle title="AI 助手">
        <Button icon={<ClearOutlined />} onClick={handleClear} disabled={!messages.length && !input}>
          清空对话
        </Button>
      </CommonTitle>

      <div className={styles.chatPanel}>
        <div className={styles.messages}>
          {messages.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>人事考勤 AI 助手</div>
              <div className={styles.emptyDesc}>
                可咨询请假、加班、打卡、组织架构等问题。回答由大模型生成，具体操作以系统功能为准。
              </div>
              <div className={styles.suggestions}>
                {SUGGESTIONS.map((text) => (
                  <Tag
                    key={text}
                    style={{ cursor: 'pointer', padding: '4px 10px' }}
                    onClick={() => sendQuestion(text)}
                  >
                    {text}
                  </Tag>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.bubbleRow} ${
                  msg.role === 'user' ? styles.user : styles.assistant
                }`}
              >
                <div
                  className={`${styles.avatar} ${
                    msg.role === 'user' ? styles.userAvatar : ''
                  }`}
                >
                  {msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                </div>
                <div
                  className={`${styles.bubble} ${
                    msg.role === 'user' ? styles.userBubble : styles.assistantBubble
                  }`}
                >
                  {msg.content ||
                    (loading ? <span className={styles.typing}>正在思考…</span> : '')}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.composer}>
          <div className={styles.inputRow}>
            <Input.TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的问题，Enter 发送，Shift+Enter 换行"
              autoSize={{ minRows: 2, maxRows: 6 }}
              disabled={loading}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  void sendQuestion(input);
                }
              }}
            />
            <div className={styles.actions}>
              {loading ? (
                <Button danger icon={<StopOutlined />} onClick={stopGenerating}>
                  停止
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => void sendQuestion(input)}
                  disabled={!input.trim()}
                >
                  发送
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPage;
