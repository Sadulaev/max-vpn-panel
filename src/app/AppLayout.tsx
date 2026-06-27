import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { setStoredAccessToken, miniappAPI } from '../services/miniapp-api';
import SubscriptionPage from './pages/SubscriptionPage';
import AntiThrottlingPage from './pages/AntiThrottlingPage';
import NodesPage from './pages/NodesPage';
import InstructionsPage from './pages/InstructionsPage';
import { TabContext, type Tab } from './TabContext';

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100dvh',
    backgroundColor: 'var(--tg-theme-bg-color, #17212b)',
    color: 'var(--tg-theme-text-color, #ffffff)',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: '68px',
  },
  tabBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    backgroundColor: 'var(--tg-theme-secondary-bg-color, #232e3c)',
    display: 'flex',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    zIndex: 100,
  },
  tabItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--tg-theme-hint-color, #7c8a94)',
    fontSize: '11px',
    fontWeight: 500,
    transition: 'color 0.15s',
  },
  tabItemActive: {
    color: 'var(--tg-theme-button-color, #2ea6ff)',
  },
  tabIcon: {
    fontSize: '22px',
    lineHeight: 1,
  },
};

const TAB_CONTENT: Record<Tab, React.FC> = {
  standard: SubscriptionPage,
  anti: AntiThrottlingPage,
  nodes: NodesPage,
  instructions: InstructionsPage,
};

export default function AppLayout() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [tab, setTab] = useState<Tab>('standard');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    miniappAPI.verifyToken(token)
      .then(({ valid }) => {
        if (valid) {
          setStoredAccessToken(token);
          setStatus('ok');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [token]);

  useEffect(() => {
    if (status === 'error') navigate('/404', { replace: true });
  }, [status, navigate]);

  if (status !== 'ok') {
    return <div style={{ minHeight: '100dvh', backgroundColor: '#f5f5f5' }} />;
  }

  const ActivePage = TAB_CONTENT[tab];

  return (
    <TabContext.Provider value={{ setTab }}>
    <div style={styles.wrapper}>
      <div style={styles.content}>
        <ActivePage />
      </div>

      <nav style={styles.tabBar}>
        <button
          style={{ ...styles.tabItem, ...(tab === 'standard' ? styles.tabItemActive : {}) }}
          onClick={() => setTab('standard')}
        >
          <span style={styles.tabIcon}>🔑</span>
          <span>Стандарт</span>
        </button>

        <button
          style={{ ...styles.tabItem, ...(tab === 'anti' ? styles.tabItemActive : {}) }}
          onClick={() => setTab('anti')}
        >
          <span style={styles.tabIcon}>🛡️</span>
          <span>Антиглушилка <span style={{ fontSize: '9px', backgroundColor: '#f9a825', color: '#000', borderRadius: '4px', padding: '1px 4px', fontWeight: 700, verticalAlign: 'middle' }}>BETA</span></span>
        </button>

        <button
          style={{ ...styles.tabItem, ...(tab === 'nodes' ? styles.tabItemActive : {}) }}
          onClick={() => setTab('nodes')}
        >
          <span style={styles.tabIcon}>🖥</span>
          <span>Серверы</span>
        </button>

        <button
          style={{ ...styles.tabItem, ...(tab === 'instructions' ? styles.tabItemActive : {}) }}
          onClick={() => setTab('instructions')}
        >
          <span style={styles.tabIcon}>📍</span>
          <span>Инструкции</span>
        </button>
      </nav>
    </div>
    </TabContext.Provider>
  );
}
