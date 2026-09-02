import { useState, useEffect } from 'react';
import { Card, Switch, Typography, Spin, message, Input, Button, Space, Divider } from 'antd';
import api from '../services/api';

const { Title, Text } = Typography;

interface Settings {
  standardEnabled: boolean;
  antiThrottlingEnabled: boolean;
  supportContact: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [supportDraft, setSupportDraft] = useState('');

  useEffect(() => {
    api.get<Settings>('/auth/settings')
      .then((r) => {
        setSettings(r.data);
        setSupportDraft(r.data.supportContact ?? '');
      })
      .catch(() => message.error('Не удалось загрузить настройки'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (key: keyof Settings, value: boolean) => {
    setSaving(key);
    try {
      const { data } = await api.put<Settings>('/auth/settings', { [key]: value });
      setSettings(data);
      setSupportDraft(data.supportContact ?? '');
      message.success(value ? 'Продажа включена' : 'Продажа отключена');
    } catch {
      message.error('Ошибка сохранения');
    } finally {
      setSaving(null);
    }
  };

  const saveSupportContact = async () => {
    const next = supportDraft.trim();
    if (!next) {
      message.warning('Укажите ссылку на поддержку');
      return;
    }
    setSaving('supportContact');
    try {
      const { data } = await api.put<Settings>('/auth/settings', { supportContact: next });
      setSettings(data);
      setSupportDraft(data.supportContact ?? '');
      message.success('Ссылка поддержки обновлена');
    } catch {
      message.error('Ошибка сохранения');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <Spin style={{ display: 'block', margin: '60px auto' }} />;

  const supportChanged = supportDraft.trim() !== (settings?.supportContact ?? '').trim();

  return (
    <div style={{ maxWidth: 560 }}>
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

          <Divider style={{ margin: '4px 0' }} />

          <div>
            <Text strong>Ссылка на поддержку</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 13 }}>
              URL кнопки «Написать в поддержку» в боте. Изменение применяется сразу, без перезапуска.
            </Text>
            <Space.Compact style={{ width: '100%', marginTop: 10 }}>
              <Input
                value={supportDraft}
                placeholder="https://max.ru/..."
                onChange={(e) => setSupportDraft(e.target.value)}
                onPressEnter={() => void saveSupportContact()}
              />
              <Button
                type="primary"
                loading={saving === 'supportContact'}
                disabled={!supportChanged}
                onClick={() => void saveSupportContact()}
              >
                Сохранить
              </Button>
            </Space.Compact>
          </div>
        </div>
      </Card>
    </div>
  );
}
