import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Typography, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
// import { clientsAPI, Client } from '../services/api';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';

const { Title } = Typography;

// Временные типы пока нет API
interface Client {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  isActive: boolean;
  createdAt: string;
}

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 20,
    showSizeChanger: true,
    showTotal: (total) => `Всего: ${total}`,
    pageSizeOptions: ['10', '20', '50'],
  });
  const [form] = Form.useForm();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      // const response = await clientsAPI.getAll();
      // setClients(response.data);
      setClients([]); // Временно пустой массив
      message.info('API клиентов не реализован');
    } catch (error) {
      message.error('Ошибка загрузки клиентов');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingClient(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    form.setFieldsValue(client);
    setModalVisible(true);
  };

  const handleDelete = async (_id: string) => {
    try {
      // await clientsAPI.delete(id);
      message.success('Клиент удалён');
      fetchClients();
    } catch (error) {
      message.error('Ошибка удаления клиента');
    }
  };

  const handleSubmit = async (_values: any) => {
    try {
      if (editingClient) {
        // await clientsAPI.update(editingClient.id, values);
        message.success('Клиент обновлён');
      } else {
        // await clientsAPI.create(values);
        message.success('Клиент создан');
      }
      setModalVisible(false);
      fetchClients();
    } catch (error) {
      message.error('Ошибка сохранения клиента');
    }
  };

  const columns: ColumnsType<Client> = [
    {
      title: '№',
      key: 'index',
      width: 60,
      fixed: 'left',
      render: (_: any, __: any, index: number) => {
        const current = pagination.current || 1;
        const pageSize = pagination.pageSize || 20;
        return (current - 1) * pageSize + index + 1;
      },
    },
    {
      title: 'Telegram ID',
      dataIndex: 'telegramId',
      key: 'telegramId',
      width: 120,
    },
    {
      title: 'Имя пользователя',
      dataIndex: 'username',
      key: 'username',
      responsive: ['md'] as any,
      render: (text) => text || '—',
    },
    {
      title: 'Имя',
      dataIndex: 'firstName',
      key: 'firstName',
      responsive: ['lg'] as any,
      render: (text) => text || '—',
    },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Активен' : 'Неактивен'}
        </Tag>
      ),
    },
    {
      title: 'Дата создания',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      responsive: ['xl'] as any,
      render: (date: string) => new Date(date).toLocaleString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button 
            type="primary" 
            ghost 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Удалить клиента?"
            onConfirm={() => handleDelete(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: 16 
      }}>
        <Title level={2} style={{ margin: 0 }}>Клиенты</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Добавить клиента
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={clients}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={(newPagination) => setPagination(newPagination)}
        scroll={{ x: 600 }}
        size="small"
        sticky
      />

      <Modal
        title={editingClient ? 'Редактировать клиента' : 'Добавить клиента'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="telegramId"
            label="Telegram ID"
            rules={[{ required: true, message: 'Введите Telegram ID' }]}
          >
            <Input disabled={!!editingClient} />
          </Form.Item>
          <Form.Item name="username" label="Имя пользователя">
            <Input />
          </Form.Item>
          <Form.Item name="firstName" label="Имя">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClientsPage;
