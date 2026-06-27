import { useState, useEffect } from 'react';
import { Card, Switch, Typography, Spin, message } from 'antd';
import api from '../services/api';

const { Title, Text } = Typography;

interface Settings {
  standardEnabled: boolean;
  antiThrottlingEnabled: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    api.get<Settings>('/auth/settings')
      .then((r) => setSettings(r.data))
      .catch(() => message.error('Не удалось загрузить настройки'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (key: keyof Settings, value: boolean) => {
    setSaving(key);
    try {
      const { data } = await api.put<Settings>('/auth/settings', { [key]: value });
      setSettings(data);
      message.success(value ? 'Продажа включена' : 'Продажа отключена');
    } catch {
      message.error('Ошибка сохранения');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <Spin style={{ display: 'block', margin: '60px auto' }} />;

  return (
    <div style={{ maxWidth: 480 }}>
      <Title level={3}>Настройки</Title>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>Стандартные подписки</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 13 }}>
                Разрешить покупку и продление стандартных подписок
              </Text>
            </div>
            <Switch
              checked={settings?.standardEnabled ?? true}
              loading={saving === 'standardEnabled'}
              onChange={(v) => toggle('standardEnabled', v)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>Антиглушилка</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 13 }}>
                Разрешить покупку и продление подписок антиглушилки
              </Text>
            </div>
            <Switch
              checked={settings?.antiThrottlingEnabled ?? true}
              loading={saving === 'antiThrottlingEnabled'}
              onChange={(v) => toggle('antiThrottlingEnabled', v)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
