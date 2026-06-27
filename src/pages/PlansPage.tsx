import { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Table,
  Tag,
  Space,
  Popconfirm,
  message,
  Tabs,
  Typography,
  Tooltip,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { plansAPI, Plan, CreatePlanDto } from '../services/api';

const { Title } = Typography;


export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'standard' | 'anti-throttling' | 'additional'>('standard');
  const [form] = Form.useForm();

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await plansAPI.getAll();
      setPlans(res.data);
    } catch {
      message.error('Ошибка загрузки тарифов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    const isAdditionalTab = activeTab === 'additional';
    const planType = isAdditionalTab ? 'standard' : activeTab;
    form.setFieldsValue({
      planType,
      months: planType === 'standard' ? 1 : 0,
      dataLimitGB: planType === 'anti-throttling' ? 10 : 0,
      isActive: true,
      isMain: !isAdditionalTab,
      sortOrder: 0,
    });
    setModalOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditing(plan);
    form.setFieldsValue({ ...plan });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await plansAPI.remove(id);
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
    const dto: CreatePlanDto = {
        ...values,
        // Для Базового dataLimitGB всегда 0
        dataLimitGB: values.planType === 'standard' ? 0 : (values.dataLimitGB ?? 0),
        // Для Антиглушилка months всегда 0
        months: values.planType === 'anti-throttling' ? 0 : (values.months ?? 1),
        isMain: values.isMain ?? true,
      };

      if (editing) {
        await plansAPI.update(editing.id, dto);
        message.success('Тариф обновлён');
      } else {
        await plansAPI.create(dto);
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

  const isAnti = activeTab === 'anti-throttling';
  const filtered = activeTab === 'additional'
    ? plans.filter((p) => !p.isMain)
    : plans.filter((p) => p.planType === activeTab && p.isMain);

  const columns = [
    {
      title: 'Тип',
      dataIndex: 'planType',
      key: 'planType',
      render: (v: string, p: Plan) => {
        if (!p.isMain) return <Tag color="purple">Доп.</Tag>;
        return v === 'anti-throttling' ? <Tag color="orange">Антиглушилка</Tag> : <Tag color="blue">Базовый</Tag>;
      },
    },
    {
      title: 'Название',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: isAnti ? 'Трафик' : 'Срок',
      key: 'period',
      render: (_: unknown, p: Plan) =>
        isAnti
          ? `${p.dataLimitGB} ГБ`
          : `${p.months} мес.`,
    },
    {
      title: 'Цена, ₽',
      dataIndex: 'price',
      key: 'price',
      render: (v: number) => `${v} ₽`,
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      render: (v: string | null) => v || '—',
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
      render: (_: unknown, p: Plan) => (
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

  const tabItems = [
    {
      key: 'standard' as const,
      label: '🌐 Базовый (безлимитный трафик)',
    },
    {
      key: 'anti-throttling' as const,
      label: '⚡ Антиглушилка (пакеты ГБ)',
    },
    {
      key: 'additional' as const,
      label: '🔧 Дополнительные',
    },
  ];

  const watchedType = Form.useWatch('planType', form);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Тарифы</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Добавить тариф
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(k) => setActiveTab(k as 'standard' | 'anti-throttling' | 'additional')}
        items={tabItems}
      />

      <Table
        loading={loading}
        dataSource={filtered}
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
          <Form.Item name="planType" label="Тип подписки" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'standard', label: '🌐 Базовый — безлимитный трафик, ограничен по времени' },
                { value: 'anti-throttling', label: '⚡ Антиглушилка — ограничен по ГБ, время неограниченно' },
              ]}
            />
          </Form.Item>

          <Form.Item name="label" label="Название тарифа" rules={[{ required: true, message: 'Введите название' }]}>
            <Input placeholder="Например: 1 месяц" />
          </Form.Item>

          {watchedType === 'standard' && (
            <Form.Item name="months" label="Количество месяцев" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          )}

          {watchedType === 'anti-throttling' && (
            <Form.Item
              name="dataLimitGB"
              label="Трафик (ГБ)"
              rules={[{ required: true, message: 'Укажите объём трафика' }]}
              extra="При продлении ГБ добавляются к остатку"
            >
              <InputNumber min={1} style={{ width: '100%' }} addonAfter="ГБ" />
            </Form.Item>
          )}

          <Form.Item name="price" label="Цена" rules={[{ required: true, message: 'Введите цену' }]}>
            <InputNumber min={0} style={{ width: '100%' }} addonAfter="₽" />
          </Form.Item>

          <Form.Item name="description" label="Описание (необязательно)">
            <Input placeholder="Отображается в боте под названием тарифа" />
          </Form.Item>

          <Form.Item name="sortOrder" label="Порядок сортировки" extra="Меньше = выше в списке">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="isActive" label="Активен" valuePropName="checked">
            <Switch checkedChildren="Виден в боте" unCheckedChildren="Скрыт" />
          </Form.Item>
          <Form.Item name="isMain" label="Тип" valuePropName="checked">
            <Switch checkedChildren="Основная" unCheckedChildren="Дополнительная" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
