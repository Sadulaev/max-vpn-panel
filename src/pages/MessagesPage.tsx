import { useState } from 'react';
import { Form, Input, Button, message, Upload } from 'antd';
import { SendOutlined, UserOutlined, PictureOutlined, DeleteOutlined } from '@ant-design/icons';
import { subscriptionsAPI } from '../services/api';

const { TextArea } = Input;

interface SendResult {
  sent: number;
  failed: number;
  errors: string[];
}

export default function MessagesPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<SendResult | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoSelect = (file: File) => {
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    return false; // prevent auto-upload
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSend = async (values: { message: string; maxId?: string }) => {
    setLoading(true);
    setLastResult(null);

    try {
      const response = await subscriptionsAPI.sendMessage({
        message: values.message,
        maxId: values.maxId?.trim() || undefined,
      }, photo ?? undefined);

      if (response.data.success) {
        if (response.data.message) {
          message.success('Рассылка запущена! Результаты в логах сервера.', 10);
          form.resetFields(['message', 'maxId']);
          setPhoto(null);
          setPhotoPreview(null);
        } else {
          const result = response.data.data;
          if (result) {
            setLastResult(result);
            if (result.failed === 0) {
              message.success('Отправлено!');
              form.resetFields(['message', 'maxId']);
              setPhoto(null);
              setPhotoPreview(null);
            } else {
              message.error('Ошибка отправки');
            }
          }
        }
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>Рассылка</h2>
      <p style={{ color: '#999', margin: '0 0 20px', fontSize: 13 }}>
        Отправка сообщений через Telegram бота
      </p>

      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <Form form={form} layout="vertical" onFinish={handleSend}>
          <Form.Item
            label="Сообщение"
            name="message"
            rules={[{ required: true, message: 'Введите сообщение' }]}
          >
            <TextArea
              rows={5}
              placeholder="Текст сообщения (поддерживается HTML)"
              showCount
              maxLength={4096}
            />
          </Form.Item>

          <Form.Item
            label="Max ID"
            name="maxId"
            extra="Пусто = рассылка всем пользователям"
          >
            <Input
              placeholder="ID пользователя (опционально)"
              prefix={<UserOutlined style={{ color: '#bbb' }} />}
            />
          </Form.Item>

          <Form.Item label="Фото (опционально)">
            {photoPreview ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={photoPreview}
                  alt="preview"
                  style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, display: 'block' }}
                />
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleRemovePhoto}
                  style={{ position: 'absolute', top: 4, right: 4 }}
                />
              </div>
            ) : (
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={handlePhotoSelect}
              >
                <Button icon={<PictureOutlined />}>Выбрать фото</Button>
              </Upload>
            )}
          </Form.Item>

          <div style={{ display: 'flex', gap: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SendOutlined />}
              style={{ flex: 1 }}
            >
              Отправить
            </Button>
            <Button onClick={() => { form.resetFields(); handleRemovePhoto(); }} disabled={loading}>
              Очистить
            </Button>
          </div>
        </Form>
      </div>

      {lastResult && (
        <div style={{ marginTop: 16, background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Результат</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#f6ffed', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>{lastResult.sent}</div>
              <div style={{ fontSize: 12, color: '#999' }}>Отправлено</div>
            </div>
            <div style={{ background: lastResult.failed > 0 ? '#fff2f0' : '#f6ffed', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: lastResult.failed > 0 ? '#ff4d4f' : '#52c41a' }}>{lastResult.failed}</div>
              <div style={{ fontSize: 12, color: '#999' }}>Ошибок</div>
            </div>
          </div>

          {lastResult.errors.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Ошибки:</div>
              {lastResult.errors.map((error, i) => (
                <div key={i} style={{ fontSize: 12, color: '#ff4d4f', marginBottom: 4 }}>• {error}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
