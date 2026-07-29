import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Form, Input, Modal, Row, Space, Table, Tag, Typography, message } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { subscriptionsAPI, Subscription } from '../services/api';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

type UserRow = {
  key: string;
  maxId: string;
  totalSubscriptions: number;
  activeSubscriptions: number;
  lastPurchaseAt: string;
};

const QUICK_MONTHS = [1, 3, 6, 12];

const ClientsPage = () => {
  const [allSubscriptions, setAllSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [quickCreateLoading, setQuickCreateLoading] = useState<string | null>(null);
  const [manualCreateLoading, setManualCreateLoading] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [selectedMaxId, setSelectedMaxId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await subscriptionsAPI.getAll();
      setAllSubscriptions(response.data);
    } catch {
      message.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const users = useMemo<UserRow[]>(() => {
    const grouped = new Map<string, Subscription[]>();

    for (const sub of allSubscriptions) {
      if (!sub.maxId) continue;
      const list = grouped.get(sub.maxId) ?? [];
      list.push(sub);
      grouped.set(sub.maxId, list);
    }

    return Array.from(grouped.entries())
      .map(([maxId, subs]) => {
        const activeSubscriptions = subs.filter((s) => s.remnawaveStatus?.toLowerCase() === 'active').length;
        const sorted = [...subs].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        return {
          key: maxId,
          maxId,
          totalSubscriptions: subs.length,
          activeSubscriptions,
          lastPurchaseAt: sorted[0]?.createdAt ?? '',
        };
      })
      .sort((a, b) => new Date(b.lastPurchaseAt).getTime() - new Date(a.lastPurchaseAt).getTime());
  }, [allSubscriptions]);

  const filteredUsers = useMemo(() => {
    const q = search.trim();
    if (!q) return users;
    return users.filter((u) => u.maxId.includes(q));
  }, [users, search]);

  const createQuickSubscription = async (maxId: string, months: number) => {
    setQuickCreateLoading(`${maxId}-${months}`);
    try {
      await subscriptionsAPI.create({
        maxId,
        days: months * 30,
        source: 'admin',
        note: `Быстрое создание: ${months} мес.`,
      });
      message.success(`Подписка на ${months} мес. создана для ${maxId}`);
      await fetchData();
    } catch {
      message.error('Не удалось создать подписку');
    } finally {
      setQuickCreateLoading(null);
    }
  };

  const openManualModal = (maxId?: string) => {
    const value = maxId ?? '';
    setSelectedMaxId(value || null);
    form.setFieldsValue({ maxId: value });
    setManualModalOpen(true);
  };

  const handleManualCreate = async (values: { maxId?: string; note?: string }, months: number) => {
    const maxId = values.maxId?.trim() || undefined;

    setManualCreateLoading(true);
    try {
      await subscriptionsAPI.create({
        maxId,
        days: months * 30,
        source: 'admin',
        note: values.note?.trim() || `Быстрое создание: ${months} мес.`,
      });
      message.success(
        maxId
          ? `Подписка на ${months} мес. создана для ${maxId}`
          : `Подписка на ${months} мес. создана без Max ID`,
      );
      setManualModalOpen(false);
      form.resetFields();
      await fetchData();
    } catch {
      message.error('Не удалось создать подписку');
    } finally {
      setManualCreateLoading(false);
    }
  };

  const columns: ColumnsType<UserRow> = [
    {
      title: 'Max ID',
      dataIndex: 'maxId',
      key: 'maxId',
      width: 180,
      render: (value: string) => <Text strong>{value}</Text>,
    },
    {
      title: 'Подписок',
      dataIndex: 'totalSubscriptions',
      key: 'totalSubscriptions',
      width: 110,
    },
    {
      title: 'Активных',
      dataIndex: 'activeSubscriptions',
      key: 'activeSubscriptions',
      width: 120,
      render: (count: number) => <Tag color={count > 0 ? 'green' : 'default'}>{count}</Tag>,
    },
    {
      title: 'Последняя покупка',
      dataIndex: 'lastPurchaseAt',
      key: 'lastPurchaseAt',
      width: 170,
      render: (value: string) => (value ? new Date(value).toLocaleString('ru-RU') : '—'),
    },
    {
      title: 'Быстро создать',
      key: 'quickCreate',
      render: (_, record) => (
        <Space wrap>
          {QUICK_MONTHS.map((months) => (
            <Button
              key={`${record.maxId}-${months}`}
              size="small"
              type="primary"
              ghost
              loading={quickCreateLoading === `${record.maxId}-${months}`}
              onClick={() => createQuickSubscription(record.maxId, months)}
            >
              {months} мес.
            </Button>
          ))}
          <Button size="small" onClick={() => openManualModal(record.maxId)}>
            Другое
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '0 16px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>Управление пользователями</Title>
        <Space wrap>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            Обновить
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openManualModal()}>
            Быстро создать подписку
          </Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={12}>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск пользователя по Max ID"
              allowClear
            />
          </Col>
          <Col xs={24} md={12}>
            <Text type="secondary">
              Найдено пользователей: {filteredUsers.length}
            </Text>
          </Col>
        </Row>
      </Card>

      <Table
        rowKey="key"
        loading={loading}
        columns={columns}
        dataSource={filteredUsers}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        scroll={{ x: 980 }}
      />

      <Modal
        title={selectedMaxId ? `Создание подписки для ${selectedMaxId}` : 'Быстрое создание подписки'}
        open={manualModalOpen}
        onCancel={() => setManualModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ maxId: selectedMaxId ?? '', note: '' }}>
          <Form.Item
            label="Max ID (необязательно)"
            name="maxId"
          >
            <Input placeholder="Например: 23531120" />
          </Form.Item>
          <Form.Item label="Примечание (необязательно)" name="note">
            <Input placeholder="Например: Выдано менеджером" />
          </Form.Item>

          <Text type="secondary">Выберите срок:</Text>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {QUICK_MONTHS.map((months) => (
              <Button
                key={months}
                type="primary"
                loading={manualCreateLoading}
                onClick={async () => {
                  const values = await form.validateFields();
                  await handleManualCreate(values, months);
                }}
              >
                {months} мес.
              </Button>
            ))}
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ClientsPage;
