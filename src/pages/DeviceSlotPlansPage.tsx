import { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Table,
  Tag,
  Space,
  Popconfirm,
  message,
  Typography,
  Tooltip,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { deviceSlotPlansAPI, DeviceSlotPlan, CreateDeviceSlotPlanDto } from '../services/api';

const { Title } = Typography;

export default function DeviceSlotPlansPage() {
  const [plans, setPlans] = useState<DeviceSlotPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DeviceSlotPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await deviceSlotPlansAPI.getAll();
      setPlans(res.data);
    } catch {
      message.error('Ошибка загрузки тарифов слотов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, sortOrder: 0, slotsCount: 1, price: 0 });
    setModalOpen(true);
  };

  const openEdit = (plan: DeviceSlotPlan) => {
    setEditing(plan);
    form.setFieldsValue({ ...plan });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deviceSlotPlansAPI.remove(id);
      message.success('Тариф удалён');
      fetchPlans();
    } catch {
      message.error('Ошибка удаления');
    }
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const dto: CreateDeviceSlotPlanDto = {
        label: values.label,
        slotsCount: values.slotsCount,
        price: values.price,
        isActive: values.isActive ?? true,
        sortOrder: values.sortOrder ?? 0,
      };
      if (editing) {
        await deviceSlotPlansAPI.update(editing.id, dto);
        message.success('Тариф обновлён');
      } else {
        await deviceSlotPlansAPI.create(dto);
        message.success('Тариф создан');
      }
      setModalOpen(false);
      fetchPlans();
    } catch {
      message.error('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: 'Кол-во слотов',
      dataIndex: 'slotsCount',
      key: 'slotsCount',
      render: (v: number) => `+${v}`,
    },
    {
      title: 'Цена, ₽',
      dataIndex: 'price',
      key: 'price',
      render: (v: number) => `${v} ₽`,
    },
    {
      title: 'Сортировка',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
    },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v: boolean) =>
        v ? <Tag color="green">Активен</Tag> : <Tag color="red">Скрыт</Tag>,
    },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, p: DeviceSlotPlan) => (
        <Space>
          <Tooltip title="Редактировать">
            <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(p)} />
          </Tooltip>
          <Popconfirm
            title="Удалить тариф?"
            description="Действие необратимо."
            onConfirm={() => handleDelete(p.id)}
            okText="Удалить"
            cancelText="Отмена"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Слоты устройств</Title>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: 13 }}>
            Базовый лимит — 5 устройств. Пользователи могут докупать до 10 устройств.
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Добавить тариф
        </Button>
      </div>

      <Table
        loading={loading}
        dataSource={plans}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
        locale={{ emptyText: 'Нет тарифов. Нажмите «Добавить тариф».' }}
      />

      <Modal
        open={modalOpen}
        title={editing ? 'Редактировать тариф' : 'Новый тариф'}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText={editing ? 'Сохранить' : 'Создать'}
        cancelText="Отмена"
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item
            name="label"
            label="Название"
            rules={[{ required: true, message: 'Введите название' }]}
            extra='Отображается в боте, напр. "+1 устройство"'
          >
            <Input placeholder="+1 устройство" />
          </Form.Item>

          <Form.Item
            name="slotsCount"
            label="Количество добавляемых слотов"
            rules={[{ required: true }]}
            extra="Сколько устройств добавится к текущему лимиту (лимит не превысит 10)"
          >
            <InputNumber min={1} max={9} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="price"
            label="Цена"
            rules={[{ required: true, message: 'Введите цену' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} addonAfter="₽" />
          </Form.Item>

          <Form.Item name="sortOrder" label="Порядок сортировки" extra="Меньше = выше в списке">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="isActive" label="Активен" valuePropName="checked">
            <Switch checkedChildren="Виден в боте" unCheckedChildren="Скрыт" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
