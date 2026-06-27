import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button, Drawer } from 'antd';
import {
  FileTextOutlined,
  MessageOutlined,
  DollarOutlined,
  LogoutOutlined,
  MenuOutlined,
  SettingOutlined,
  UnorderedListOutlined,
  LaptopOutlined,
  RobotOutlined,
  NodeIndexOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { key: '/admin/subscriptions', icon: <FileTextOutlined />, label: 'Подписки' },
    { key: '/admin/clients', icon: <TeamOutlined />, label: 'Клиенты' },
    { key: '/admin/marzban', icon: <NodeIndexOutlined />, label: 'Сервера (Marzban)' },
    { key: '/admin/plans', icon: <UnorderedListOutlined />, label: 'Тарифы' },
    { key: '/admin/device-slots', icon: <LaptopOutlined />, label: 'Слоты устройств' },
    { key: '/admin/messages', icon: <MessageOutlined />, label: 'Рассылка' },
    { key: '/admin/payments', icon: <DollarOutlined />, label: 'Платежи' },
    { key: '/admin/bot-pages', icon: <RobotOutlined />, label: 'Страницы бота' },
    { key: '/admin/settings', icon: <SettingOutlined />, label: 'Настройки' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleNav = (key: string) => {
    navigate(key);
    setDrawerOpen(false);
  };

  const isActive = (key: string) => location.pathname === key || location.pathname.startsWith(key + '/');

  // Mobile Layout
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        {/* Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#fff',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #eee',
        }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#667eea' }}>Панель управления</span>
          <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />
        </div>

        {/* Content */}
        <div style={{ padding: '12px', paddingBottom: 80 }}>
          <Outlet />
        </div>

        {/* Bottom Navigation */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderTop: '1px solid #eee',
          display: 'flex',
          padding: '8px 0',
          paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
          zIndex: 100,
        }}>
          {menuItems.map(item => (
            <div
              key={item.key}
              onClick={() => handleNav(item.key)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '4px 0',
                color: isActive(item.key) ? '#667eea' : '#999',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 10, marginTop: 2 }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Drawer Menu */}
        <Drawer
          title="Меню"
          placement="right"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          width={280}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {menuItems.map(item => (
              <Button
                key={item.key}
                type={isActive(item.key) ? 'primary' : 'text'}
                icon={item.icon}
                onClick={() => handleNav(item.key)}
                style={{ justifyContent: 'flex-start', height: 48 }}
                block
              >
                {item.label}
              </Button>
            ))}
            <div style={{ borderTop: '1px solid #eee', marginTop: 8, paddingTop: 8 }}>
              <Button
                type="text"
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{ justifyContent: 'flex-start', height: 48 }}
                block
              >
                Выйти
              </Button>
            </div>
          </div>
        </Drawer>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: 240,
        background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          color: '#fff',
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 32,
          textAlign: 'center',
        }}>
          Панель управления
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {menuItems.map(item => (
            <div
              key={item.key}
              onClick={() => handleNav(item.key)}
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                color: '#fff',
                background: isActive(item.key) ? 'rgba(255,255,255,0.2)' : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 14 }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div
          onClick={handleLogout}
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: 'rgba(255,255,255,0.8)',
            marginTop: 'auto',
          }}
        >
          <LogoutOutlined />
          <span>Выйти</span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, background: '#f5f5f5' }}>
        <div style={{ padding: '24px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
