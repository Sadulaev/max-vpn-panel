import { useState, useEffect } from 'react';
import { Button, DatePicker, message, Tag, InputNumber, Modal, Input, Pagination } from 'antd';
import { SearchOutlined, ReloadOutlined, SwapOutlined, SendOutlined, DownloadOutlined } from '@ant-design/icons';
import { paymentsAPI, PaymentSession } from '../services/api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const PaymentsPage = () => {
  const [sessions, setSessions] = useState<PaymentSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [randomCount, setRandomCount] = useState<number>(10);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState<PaymentSession | null>(null);
  const [messageText, setMessageText] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [isRandomMode, setIsRandomMode] = useState(false);

  useEffect(() => {
    if (!isRandomMode) {
      fetchSessions();
    }
  }, [page, pageSize]);

  const fetchSessions = async () => {
    setLoading(true);
    setIsRandomMode(false);
    try {
      const params: any = { page, limit: pageSize };
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.dateFrom = dateRange[0].toISOString();
        params.dateTo = dateRange[1].toISOString();
      }
      const response = await paymentsAPI.getPaidSessions(params);
      setSessions(response.data.data);
      setTotal(response.data.total);
      message.success(`Загружено ${response.data.data.length} из ${response.data.total} оплаченных платежей`);
    } catch {
      message.error('Ошибка загрузки платежей');
    } finally {
      setLoading(false);
    }
  };

  const handleRandomSelection = async () => {
    if (!randomCount || randomCount < 1) {
      message.error('Укажите количество записей больше 0');
      return;
    }

    setLoading(true);
    setIsRandomMode(true);
    try {
      const params: any = { count: randomCount };
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.dateFrom = dateRange[0].toISOString();
        params.dateTo = dateRange[1].toISOString();
      }
      const response = await paymentsAPI.getRandomPaidSessions(params);
      setSessions(response.data);
      setTotal(response.data.length);
      message.success(`Выбрано случайно ${response.data.length} из доступных платежей`);
    } catch {
      message.error('Ошибка случайного отбора');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const params: any = {};
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.dateFrom = dateRange[0].toISOString();
        params.dateTo = dateRange[1].toISOString();
      }
      const response = await paymentsAPI.exportCsv(params);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-sessions-${dayjs().format('YYYY-MM-DD')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      message.success('CSV файл скачан');
    } catch {
      message.error('Ошибка экспорта');
    }
  };

  const handleSendMessage = (session: PaymentSession) => {
    setSelectedSession(session);
    setMessageText('');
    setMessageModalVisible(true);
  };

  const sendMessage = async () => {
    if (!selectedSession || !messageText.trim()) {
      message.error('Введите текст сообщения');
      return;
    }

    try {
      const response = await paymentsAPI.sendTelegramMessage({
        maxId: selectedSession.maxId,
        message: messageText,
      });

      if (response.data.success) {
        message.success(`Сообщение отправлено пользователю ${selectedSession.maxId}`);
        setMessageModalVisible(false);
        setSelectedSession(null);
        setMessageText('');
      } else {
        message.error(response.data.message || 'Ошибка отправки сообщения');
      }
    } catch (error) {
      message.error('Ошибка отправки сообщения');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'pending':
        return 'orange';
      case 'failed':
        return 'red';
      case 'expired':
        return 'gray';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Оплачено';
      case 'pending':
        return 'Ожидание';
      case 'failed':
        return 'Ошибка';
      case 'expired':
        return 'Истёк';
      default:
        return status;
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, marginBottom: 12 }}>Оплаченные платежи</h2>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            placeholder={['Дата от', 'Дата до']}
            style={{ flex: 1, minWidth: 250, maxWidth: 350 }}
          />
          <Button icon={<SearchOutlined />} loading={loading} onClick={fetchSessions} type="primary">
            Поиск
          </Button>
          <Button icon={<ReloadOutlined />} loading={loading} onClick={() => { 
            setDateRange(null); 
            setPage(1); 
            setIsRandomMode(false);
            fetchSessions(); 
          }}>
            Сбросить
          </Button>
        </div>

        {/* Random selection */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <span>Случайный отбор:</span>
          <InputNumber
            min={1}
            max={1000}
            value={randomCount}
            onChange={(value) => setRandomCount(value || 10)}
            style={{ width: 120 }}
          />
          <Button icon={<SwapOutlined />} loading={loading} onClick={handleRandomSelection}>
            Выбрать случайно
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExportCsv}>
            Экспорт CSV
          </Button>
        </div>

        {/* Пагинация только для обычного режима */}
        {!isRandomMode && total > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={(newPage, newPageSize) => {
                setPage(newPage);
                if (newPageSize !== pageSize) {
                  setPageSize(newPageSize);
                  setPage(1);
                }
              }}
              showSizeChanger
              showTotal={(total) => `Всего ${total} записей`}
              pageSizeOptions={[10, 20, 50, 100]}
            />
          </div>
        )}
      </div>

      {/* Sessions list */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
        {sessions.map((session) => (
          <div
            key={session.id}
            style={{
              border: '1px solid #e8e8e8',
              borderRadius: 8,
              padding: 16,
              background: '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <Tag color={getStatusColor(session.status)}>{getStatusText(session.status)}</Tag>
              <Button
                size="small"
                icon={<SendOutlined />}
                onClick={() => handleSendMessage(session)}
              >
                Сообщение
              </Button>
            </div>

            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              <div><strong>Max ID:</strong> <code>{session.maxId}</code></div>
              <div><strong>Invoice ID:</strong> <code>{session.invId}</code></div>
              <div><strong>Период:</strong> {session.period} мес.</div>
              <div><strong>Сумма:</strong> {session.amount} ₽</div>
              <div><strong>Создан:</strong> {dayjs(session.createdAt).format('DD.MM.YYYY HH:mm')}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {sessions.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
          Нет данных. Используйте фильтры для поиска платежей.
        </div>
      )}

      {/* Пагинация внизу для обычного режима */}
      {!isRandomMode && total > 0 && sessions.length > 0 && (
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={(newPage, newPageSize) => {
              setPage(newPage);
              if (newPageSize !== pageSize) {
                setPageSize(newPageSize);
                setPage(1);
              }
            }}
            showSizeChanger
            showTotal={(total) => `Всего ${total} записей`}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </div>
      )}

      {/* Message Modal */}
      <Modal
        title={`Отправить сообщение пользователю ${selectedSession?.maxId}`}
        open={messageModalVisible}
        onOk={sendMessage}
        onCancel={() => {
          setMessageModalVisible(false);
          setSelectedSession(null);
          setMessageText('');
        }}
        okText="Отправить"
        cancelText="Отмена"
      >
        <Input.TextArea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Введите текст сообщения..."
          rows={6}
          style={{ marginTop: 16 }}
        />
      </Modal>
    </div>
  );
};

export default PaymentsPage;
