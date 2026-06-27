import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Col,
  Collapse,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PaperClipOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { botPagesAPI, BotPage, BotButton, CreateBotPageDto } from '../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ─── Вспомогательные компоненты ─────────────────────────────────────────────

/** Мини-превью кнопок как они выглядят в Telegram */
function ButtonPreview({ buttons }: { buttons: BotButton[][] }) {
  if (!buttons || buttons.length === 0) return <Text type="secondary">Нет кнопок</Text>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
      {buttons.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {row.map((btn, bi) => (
            <Tag
              key={bi}
              color={btn.url ? 'blue' : 'default'}
              style={{ cursor: 'default', margin: 0 }}
            >
              {btn.text}
              {btn.url && <span style={{ fontSize: 10, marginLeft: 4 }}>🔗</span>}
            </Tag>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Редактор кнопок (матрица строк и столбцов) */
function ButtonsEditor({ value, onChange }: {
  value?: BotButton[][];
  onChange?: (v: BotButton[][]) => void;
}) {
  const rows: BotButton[][] = value ?? [];

  const updateRow = (ri: number, newRow: BotButton[]) => {
    const next = rows.map((r, i) => (i === ri ? newRow : r));
    onChange?.(next);
  };

  const addRow = () => onChange?.([...rows, [{ text: '' }]]);
  const removeRow = (ri: number) => onChange?.(rows.filter((_, i) => i !== ri));

  const addBtn = (ri: number) => updateRow(ri, [...rows[ri], { text: '' }]);
  const removeBtn = (ri: number, bi: number) =>
    updateRow(ri, rows[ri].filter((_, i) => i !== bi));

  const setField = (ri: number, bi: number, field: keyof BotButton, val: string) => {
    const newRow = rows[ri].map((b, i) =>
      i === bi ? { ...b, [field]: val || undefined } : b,
    );
    updateRow(ri, newRow);
  };

  return (
    <div>
      {rows.map((row, ri) => (
        <Card
          key={ri}
          size="small"
          style={{ marginBottom: 8, background: '#fafafa' }}
          title={<Text type="secondary" style={{ fontSize: 12 }}>Строка {ri + 1}</Text>}
          extra={
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => removeRow(ri)}
            />
          }
        >
          {row.map((btn, bi) => (
            <div
              key={bi}
              style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 6 }}
            >
              <Input
                size="small"
                placeholder="Текст кнопки"
                value={btn.text}
                onChange={e => setField(ri, bi, 'text', e.target.value)}
                style={{ flex: 2 }}
              />
              <Input
                size="small"
                placeholder="callbackData или оставьте пустым"
                value={btn.callbackData ?? ''}
                onChange={e => setField(ri, bi, 'callbackData', e.target.value)}
                style={{ flex: 3 }}
              />
              <Input
                size="small"
                placeholder="URL (необязательно)"
                value={btn.url ?? ''}
                onChange={e => setField(ri, bi, 'url', e.target.value)}
                style={{ flex: 3 }}
              />
              <Button
                type="text"
                danger
                size="small"
                icon={<MinusCircleOutlined />}
                onClick={() => removeBtn(ri, bi)}
              />
            </div>
          ))}
          <Button
            type="dashed"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => addBtn(ri)}
          >
            Добавить кнопку
          </Button>
        </Card>
      ))}
      <Button type="dashed" icon={<PlusOutlined />} onClick={addRow} block>
        Добавить строку кнопок
      </Button>
    </div>
  );
}

// ─── Основная страница ───────────────────────────────────────────────────────

export default function BotPagesPage() {
  const [pages, setPages] = useState<BotPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BotPage | null>(null);
  const [saving, setSaving] = useState(false);
  const [mediaUploading, setMediaUploading] = useState<number | null>(null);
  const [form] = Form.useForm();

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await botPagesAPI.getAll();
      setPages(res.data);
    } catch {
      message.error('Ошибка загрузки страниц');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ mediaType: 'none', buttons: [], sortOrder: 0 });
    setModalOpen(true);
  };

  const openEdit = (page: BotPage) => {
    setEditing(page);
    form.setFieldsValue({
      key: page.key,
      title: page.title,
      description: page.description ?? '',
      text: page.text,
      mediaType: page.mediaType,
      buttons: page.buttons,
      sortOrder: page.sortOrder,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    let values: CreateBotPageDto;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await botPagesAPI.update(editing.id, values);
        message.success('Страница сохранена');
      } else {
        await botPagesAPI.create(values);
        message.success('Страница создана');
      }
      setModalOpen(false);
      fetchPages();
    } catch {
      message.error('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await botPagesAPI.remove(id);
      message.success('Страница удалена');
      fetchPages();
    } catch {
      message.error('Ошибка удаления');
    }
  };

  const handleUploadMedia = async (pageId: number, file: File, mediaType: 'photo' | 'video') => {
    setMediaUploading(pageId);
    try {
      await botPagesAPI.uploadMedia(pageId, file, mediaType);
      message.success('Медиафайл загружен');
      fetchPages();
    } catch {
      message.error('Ошибка загрузки файла');
    } finally {
      setMediaUploading(null);
    }
  };

  const handleDeleteMedia = async (pageId: number) => {
    try {
      await botPagesAPI.deleteMedia(pageId);
      message.success('Медиафайл удалён');
      fetchPages();
    } catch {
      message.error('Ошибка удаления файла');
    }
  };

  const mediaTypeLabel = (mt: BotPage['mediaType']) => {
    if (mt === 'photo') return <Tag color="green">Фото</Tag>;
    if (mt === 'video') return <Tag color="blue">Видео</Tag>;
    return <Tag>Нет</Tag>;
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>📄 Страницы бота</Title>
          <Text type="secondary">Управление текстами и кнопками сообщений Telegram-бота</Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Новая страница
          </Button>
        </Col>
      </Row>

      {/* Список страниц в виде карточек (визуальная последовательность) */}
      <Spin spinning={loading}>
      <Collapse accordion defaultActiveKey={[]}>
        {pages.map((page, idx) => (
          <Panel
            key={page.id}
            header={
              <Row justify="space-between" align="middle" style={{ width: '100%' }}>
                <Col>
                  <Space>
                    <Text strong>{idx + 1}. {page.title}</Text>
                    <Tag>{page.key}</Tag>
                    {mediaTypeLabel(page.mediaType)}
                    {page.buttons.length > 0 && (
                      <Tag color="purple">{page.buttons.flat().length} кн.</Tag>
                    )}
                  </Space>
                </Col>
                <Col onClick={e => e.stopPropagation()}>
                  <Space>
                    <Tooltip title="Редактировать">
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => openEdit(page)}
                      />
                    </Tooltip>
                    <Popconfirm
                      title="Удалить эту страницу?"
                      okText="Да"
                      cancelText="Нет"
                      onConfirm={() => handleDelete(page.id)}
                    >
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                </Col>
              </Row>
            }
          >
            <Row gutter={16}>
              {/* Текст сообщения */}
              <Col xs={24} md={14}>
                {page.description && (
                  <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                    {page.description}
                  </Text>
                )}
                <div
                  style={{
                    background: '#f0f2f5',
                    padding: 12,
                    borderRadius: 8,
                    fontFamily: 'monospace',
                    fontSize: 13,
                    whiteSpace: 'pre-wrap',
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                  dangerouslySetInnerHTML={{ __html: page.text.replace(/\n/g, '<br/>') }}
                />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Кнопки:</Text>
                  <ButtonPreview buttons={page.buttons} />
                </div>
              </Col>

              {/* Медиафайл */}
              <Col xs={24} md={10}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Медиафайл</Text>
                </div>
                {page.mediaType !== 'none' && page.mediaPath ? (
                  <div>
                    {page.mediaType === 'photo' ? (
                      <img
                        src={`${API_URL}/bot-pages/${page.id}/media/file`}
                        alt="preview"
                        style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 6, marginBottom: 8 }}
                      />
                    ) : (
                      <video
                        src={`${API_URL}/bot-pages/${page.id}/media/file`}
                        style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 6, marginBottom: 8 }}
                        controls
                      />
                    )}
                    <br />
                    <Popconfirm
                      title="Удалить медиафайл?"
                      okText="Да"
                      cancelText="Нет"
                      onConfirm={() => handleDeleteMedia(page.id)}
                    >
                      <Button
                        size="small"
                        danger
                        icon={<CloseCircleOutlined />}
                        loading={mediaUploading === page.id}
                      >
                        Удалить файл
                      </Button>
                    </Popconfirm>
                  </div>
                ) : (
                  <div>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                      Медиафайл не прикреплён
                    </Text>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={file => {
                          handleUploadMedia(page.id, file, 'photo');
                          return false;
                        }}
                      >
                        <Button
                          size="small"
                          icon={<PaperClipOutlined />}
                          loading={mediaUploading === page.id}
                        >
                          Прикрепить фото
                        </Button>
                      </Upload>
                      <Upload
                        accept="video/*"
                        showUploadList={false}
                        beforeUpload={file => {
                          handleUploadMedia(page.id, file, 'video');
                          return false;
                        }}
                      >
                        <Button
                          size="small"
                          icon={<PaperClipOutlined />}
                          loading={mediaUploading === page.id}
                        >
                          Прикрепить видео
                        </Button>
                      </Upload>
                    </Space>
                  </div>
                )}
              </Col>
            </Row>
          </Panel>
        ))}
      </Collapse>
      </Spin>

      {/* Модальное окно редактирования */}
      <Modal
        title={editing ? `Редактировать: ${editing.title}` : 'Новая страница'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={saving}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Название (для панели управления)"
                rules={[{ required: true, message: 'Введите название' }]}
              >
                <Input placeholder="Например: Главное меню" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="key"
                label={
                  <span>
                    Ключ{' '}
                    <Text type="secondary" style={{ fontSize: 11 }}>(уникальный идентификатор)</Text>
                  </span>
                }
                rules={[
                  { required: true, message: 'Введите ключ' },
                  { pattern: /^[a-z0-9_]+$/, message: 'Только строчные буквы, цифры и _' },
                ]}
              >
                <Input
                  placeholder="menu, welcome, buy_additional..."
                  disabled={!!editing}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Описание (подсказка для администратора)">
            <Input placeholder="Когда показывается это сообщение?" />
          </Form.Item>

          <Form.Item
            name="text"
            label={
              <span>
                Текст сообщения{' '}
                <Text type="secondary" style={{ fontSize: 11 }}>
                  (HTML: &lt;b&gt;, &lt;i&gt;, &lt;code&gt;. Переменные: {'{{имя}}'}))
                </Text>
              </span>
            }
          >
            <TextArea
              rows={8}
              placeholder="Текст с HTML-разметкой. Поддерживаются переменные: {{subscriptionUrl}}, {{period}} и др."
              style={{ fontFamily: 'monospace', fontSize: 13 }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="sortOrder" label="Порядок сортировки">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="mediaType" label="Тип медиа">
                <Select>
                  <Select.Option value="none">Без медиа (только текст)</Select.Option>
                  <Select.Option value="photo">Фото</Select.Option>
                  <Select.Option value="video">Видео</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="buttons"
            label={
              <span>
                Кнопки{' '}
                <Text type="secondary" style={{ fontSize: 11 }}>
                  (каждая строка — отдельный ряд кнопок)
                </Text>
              </span>
            }
          >
            <ButtonsEditor />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
