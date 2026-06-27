import { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, InputNumber, message, Tag, Select, Empty, Spin, Pagination, Badge } from 'antd';
import { PlusOutlined, CopyOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, DownloadOutlined, SyncOutlined, TeamOutlined } from '@ant-design/icons';
import { subscriptionsAPI, Subscription } from '../services/api';
import dayjs from 'dayjs';

const { TextArea } = Input;

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [processLoading, setProcessLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [urlModalVisible, setUrlModalVisible] = useState(false);
  const [subscriptionUrl, setSubscriptionUrl] = useState('');
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [creationResult, setCreationResult] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSubscriptions();
  }, [searchValue, sourceFilter]);

  useEffect(() => {
    fetchUnsyncedCount();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchValue) params.search = searchValue;
      if (sourceFilter) params.source = sourceFilter;
      const response = await subscriptionsAPI.getAll(params);
      setSubscriptions(response.data);
    } catch {
      message.error('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnsyncedCount = async () => {
    try {
      const res = await subscriptionsAPI.getUnsynced();
      setUnsyncedCount(res.data.length);
    } catch {
      // ignore
    }
  };

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      const res = await subscriptionsAPI.sync();
      const { synced, failed } = res.data.data;
      if (failed > 0) {
        message.warning(`Синхронизировано: ${synced}, ошибок: ${failed}`);
      } else {
        message.success(`Синхронизировано: ${synced}`);
      }
      fetchSubscriptions();
      setUnsyncedCount(0);
    } catch {
      message.error('Ошибка синхронизации');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleCreate = () => {
    form.resetFields();
    form.setFieldsValue({ days: 30 });
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const response = await subscriptionsAPI.create(values);
      setCreationResult(response.data);
      setModalVisible(false);
      setResultModalVisible(true);
      message.success('Подписка создана');
      fetchSubscriptions();
    } catch {
      message.error('Ошибка создания');
    }
  };

  const handleProcessExpired = async () => {
    setProcessLoading(true);
    try {
      const response = await subscriptionsAPI.processExpired();
      const data = response.data.data || response.data;
      message.success(`Обработано: ${data.expired} истёкших`);
      fetchSubscriptions();
    } catch {
      message.error('Ошибка обработки');
    } finally {
      setProcessLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const params: any = {};
      if (searchValue) params.search = searchValue;
      if (sourceFilter) params.source = sourceFilter;
      const response = await subscriptionsAPI.exportCsv(params);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscriptions-${dayjs().format('YYYY-MM-DD')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      message.success('CSV файл скачан');
    } catch {
      message.error('Ошибка экспорта');
    }
  };

  const handleExportUniqueTg = async () => {
    try {
      const response = await subscriptionsAPI.exportUniqueTelegramIds();
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `unique-telegram-ids-${dayjs().format('YYYY-MM-DD')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      message.success('CSV файл скачан');
    } catch {
      message.error('Ошибка экспорта');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Скопировано');
  };

  const showSubscriptionUrl = async (id: string) => {
    try {
      const response = await subscriptionsAPI.getUrl(id);
      setSubscriptionUrl(response.data.data.subscriptionUrl);
      setUrlModalVisible(true);
    } catch {
      message.error('Ошибка получения URL');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await subscriptionsAPI.delete(id);
      message.success('Удалено');
      fetchSubscriptions();
    } catch {
      message.error('Ошибка удаления');
    }
  };

  const paginatedData = subscriptions.slice((page - 1) * pageSize, page * pageSize);

  const getStatusColor = (status: string | null) => {
    if (status === 'active') return '#52c41a';
    if (status === 'expired' || status === 'limited') return '#ff4d4f';
    if (status === 'disabled' || status === 'on_hold') return '#faad14';
    return '#999';
  };

  const getStatusText = (status: string | null) => {
    if (status === 'active') return 'Активна';
    if (status === 'expired') return 'Истекла';
    if (status === 'disabled') return 'Отключена';
    if (status === 'limited') return 'Лимит трафика';
    if (status === 'on_hold') return 'На паузе';
    return 'Неизвестно';
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Подписки</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Создать
          </Button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Input
            placeholder="Поиск по username / telegramId..."
            prefix={<SearchOutlined style={{ color: '#bbb' }} />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ flex: 1, minWidth: 150, maxWidth: 300 }}
            allowClear
          />
          <Select
            value={sourceFilter}
            onChange={setSourceFilter}
            style={{ width: 100 }}
            allowClear
            placeholder="Все"
          >
            <Select.Option value="admin">Админ</Select.Option>
            <Select.Option value="bot">Бот</Select.Option>
          </Select>
          <Button icon={<ReloadOutlined />} loading={processLoading} onClick={handleProcessExpired}>
            Истёкшие
          </Button>
          <Badge count={unsyncedCount} size="small" offset={[-4, 4]}>
            <Button icon={<SyncOutlined />} loading={syncLoading} onClick={handleSync}>
              Синхронизировать
            </Button>
          </Badge>
          <Button icon={<DownloadOutlined />} onClick={handleExportCsv}>
            Экспорт CSV
          </Button>
          <Button icon={<TeamOutlined />} onClick={handleExportUniqueTg}>
            Уник. TG ID
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : subscriptions.length === 0 ? (
        <Empty description="Нет подписок" />
      ) : (
        <>
          {/* Card List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {paginatedData.map((sub, index) => (
              <div
                key={sub.id}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <span style={{ color: '#999', fontSize: 12 }}>#{(page - 1) * pageSize + index + 1}</span>
                    <div style={{ fontWeight: 600, fontSize: 14, marginTop: 2 }}>
                      {sub.name
                        ? sub.name
                        : `${(sub.username ?? sub.id.replace(/-/g, '')).slice(0, 8)}...`
                      }
                      <CopyOutlined
                        style={{ marginLeft: 8, color: '#667eea', cursor: 'pointer' }}
                        onClick={() => copyToClipboard(sub.username ?? sub.id)}
                      />
                    </div>
                  </div>
                  {!sub.username ? (
                    <Tag color="orange" style={{ margin: 0 }}>Не синхронизирована</Tag>
                  ) : (
                    <Tag color={getStatusColor(sub.remnawaveStatus)} style={{ margin: 0 }}>
                      {getStatusText(sub.remnawaveStatus)}
                    </Tag>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, color: '#666', marginBottom: 12 }}>
                  <div>
                    <span style={{ color: '#999' }}>Период:</span>{' '}
                    <strong>{sub.days} дн.</strong>
                  </div>
                  <div>
                    <span style={{ color: '#999' }}>До:</span>{' '}
                    <strong style={{ color: sub.remnawaveExpire && sub.remnawaveExpire * 1000 < Date.now() ? '#ff4d4f' : undefined }}>
                      {sub.remnawaveExpire ? dayjs.unix(sub.remnawaveExpire).format('DD.MM.YYYY') : '—'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#999' }}>Источник:</span>{' '}
                    <Tag color={sub.source === 'admin' ? 'blue' : 'green'} style={{ marginLeft: 4 }}>
                      {sub.source === 'admin' ? 'Админ' : 'Бот'}
                    </Tag>
                  </div>
                  <div>
                    <span style={{ color: '#999' }}>Создан:</span>{' '}
                    {dayjs(sub.createdAt).format('DD.MM.YYYY')}
                  </div>
                  {sub.maxId && (
                    <div>
                      <span style={{ color: '#999' }}>Max ID:</span>{' '}
                      <strong>{sub.maxId}</strong>
                    </div>
                  )}
                </div>

                {sub.subscriptionUrl && (
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 12, padding: '8px', background: '#f0f5ff', borderRadius: 6 }}>
                    <div style={{ marginBottom: 4, fontWeight: 600, color: '#667eea' }}>🔗 URL подписки:</div>
                    <div
                      style={{ fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-all', cursor: 'pointer' }}
                      onClick={() => copyToClipboard(sub.subscriptionUrl!)}
                    >
                      {sub.subscriptionUrl}
                    </div>
                  </div>
                )}

                {sub.note && (
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 12, padding: '8px', background: '#f9f9f9', borderRadius: 6 }}>
                    {sub.note}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    type="primary"
                    icon={<CopyOutlined />}
                    onClick={() => {
                      if (sub.subscriptionUrl) {
                        copyToClipboard(sub.subscriptionUrl);
                      } else {
                        showSubscriptionUrl(sub.id);
                      }
                    }}
                    style={{ flex: 1 }}
                  >
                    {sub.subscriptionUrl ? 'Копировать URL' : 'URL'}
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      Modal.confirm({
                        title: 'Удалить подписку?',
                        content: 'Пользователь будет удален из Remnawave',
                        okText: 'Удалить',
                        cancelText: 'Отмена',
                        onOk: () => handleDelete(sub.id),
                      });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={subscriptions.length}
              onChange={(p, ps) => { setPage(p); setPageSize(ps); }}
              showSizeChanger
              pageSizeOptions={['20', '50', '100', '500']}
              size="small"
              showTotal={(total) => `${total} шт.`}
            />
          </div>
        </>
      )}

      {/* Create Modal */}
      <Modal
        title="Новая подписка"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="Создать"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="maxId" label="Max ID">
            <Input placeholder="123456789" />
          </Form.Item>
         <Form.Item name="days" label="Период (дней)" rules={[{ required: true }]}>
            <InputNumber min={1} max={365} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label="Примечание">
            <TextArea rows={2} maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* Result Modal */}
      <Modal
        title="Подписка создана"
        open={resultModalVisible}
        onCancel={() => setResultModalVisible(false)}
        footer={<Button type="primary" onClick={() => setResultModalVisible(false)}>OK</Button>}
      >
        {creationResult && (
          <div>
            <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              {creationResult.data?.username ? (
                <div><strong>Username:</strong> {creationResult.data.username}</div>
              ) : (
                <div style={{ color: '#d46b08' }}>
                  ⚠️ Remnawave сервер не настроен. Подписка создана без привязки. Используйте &laquo;Синхронизировать&raquo; когда сервер будет доступен.
                </div>
              )}
            </div>
            {creationResult.subscriptionUrl && (
              <div style={{ marginTop: 8, fontSize: 13 }}>
                <div style={{ marginBottom: 4 }}><strong>URL подписки:</strong></div>
                <div
                  style={{ fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-all', background: '#f5f5f5', padding: 8, borderRadius: 6, cursor: 'pointer' }}
                  onClick={() => { navigator.clipboard.writeText(creationResult.subscriptionUrl); message.success('URL скопирован'); }}
                >
                  {creationResult.subscriptionUrl}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* URL Modal */}
      <Modal
        title="URL подписки"
        open={urlModalVisible}
        onCancel={() => setUrlModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setUrlModalVisible(false)}>Закрыть</Button>,
          <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={() => copyToClipboard(subscriptionUrl)}>
            Копировать
          </Button>,
        ]}
      >
        <TextArea
          value={subscriptionUrl}
          readOnly
          autoSize={{ minRows: 3, maxRows: 6 }}
          style={{ fontFamily: 'monospace', fontSize: 11 }}
        />
        <div style={{ marginTop: 12, padding: 12, background: '#e6f7ff', borderRadius: 8, fontSize: 12 }}>
          Отправьте эту ссылку пользователю для добавления в v2ray приложение
        </div>
      </Modal>
    </div>
  );
};

export default SubscriptionsPage;
