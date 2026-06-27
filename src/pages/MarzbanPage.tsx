import { Button, Card, Typography } from 'antd';
import { LinkOutlined, NodeIndexOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const MARZBAN_URL = import.meta.env.VITE_MARZBAN_URL as string | undefined;

const MarzbanPage = () => {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', paddingTop: 24 }}>
      <Title level={3} style={{ color: '#667eea', marginBottom: 4 }}>
        <NodeIndexOutlined style={{ marginRight: 8 }} />
        Marzban
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Управление серверами, нодами и инбаундами теперь осуществляется через панель Marzban.
        Пулы серверов и 3x-ui заменены единым Marzban-инстансом.
      </Paragraph>

      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0, marginBottom: 8 }}>Панель Marzban</Title>
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          Ноды, инбаунды, шаблоны хостов и настройки конфигурации Xray — всё доступно в панели Marzban.
        </Paragraph>
        {MARZBAN_URL ? (
          <Button
            type="primary"
            icon={<LinkOutlined />}
            href={MARZBAN_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Открыть Marzban
          </Button>
        ) : (
          <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8, padding: 12 }}>
            <Text type="warning">
              <strong>VITE_MARZBAN_URL</strong> не задан.{' '}
              Добавьте переменную в <Text code>.env</Text> и пересоберите фронтенд.
            </Text>
          </div>
        )}
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Title level={5} style={{ margin: 0, marginBottom: 8 }}>Как это работает</Title>
        <ul style={{ paddingLeft: 16, color: '#555', lineHeight: 2 }}>
          <li>Подписки создаются в Marzban автоматически при создании через бот или admin-панель</li>
          <li>URL подписки берётся напрямую из Marzban (<Text code>subscription_url</Text>)</li>
          <li>Истёкшие подписки отключаются в Marzban (<Text code>status: disabled</Text>)</li>
          <li>При продлении дата окончания обновляется в Marzban через API</li>
        </ul>
      </Card>
    </div>
  );
};

export default MarzbanPage;
