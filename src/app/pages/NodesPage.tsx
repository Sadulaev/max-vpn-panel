import { useEffect, useState } from 'react';
import { miniappAPI, NodesResponse, NodeData } from '../../services/miniapp-api';

type NodeStatus = NodeData['status'];

const statusConfig: Record<NodeStatus, { label: string; color: string; dot: string }> = {
  connected: { label: 'Подключён', color: '#4caf50', dot: '🟢' },
  connecting: { label: 'Подключение…', color: '#ff9800', dot: '🟡' },
  error: { label: 'Ошибка', color: '#f44336', dot: '🔴' },
  disabled: { label: 'Отключён', color: '#9e9e9e', dot: '⚫' },
};

const s: Record<string, React.CSSProperties> = {
  page: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  heading: { fontSize: '20px', fontWeight: 700, marginBottom: '0' },
  statsRow: { display: 'flex', gap: '8px' },
  statCard: {
    flex: 1, padding: '10px 12px', borderRadius: '10px',
    backgroundColor: 'var(--tg-theme-secondary-bg-color, #232e3c)',
    textAlign: 'center',
  },
  statNum: { fontSize: '22px', fontWeight: 700, lineHeight: 1.2 },
  statLabel: { fontSize: '11px', color: 'var(--tg-theme-hint-color, #7c8a94)', marginTop: '2px' },
  nodeCard: {
    backgroundColor: 'var(--tg-theme-secondary-bg-color, #232e3c)',
    borderRadius: '12px',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  dot: { fontSize: '18px', flexShrink: 0 },
  nodeInfo: { flex: 1, minWidth: 0 },
  nodeName: { fontSize: '15px', fontWeight: 600, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  nodeStatus: { fontSize: '12px', fontWeight: 500 },
  nodeMsg: { fontSize: '11px', color: 'var(--tg-theme-hint-color, #7c8a94)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  badge: { padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, flexShrink: 0 },
};

export default function NodesPage() {
  const [data, setData] = useState<NodesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    miniappAPI.getNodes()
      .then(setData)
      .catch((e: any) => setError(e?.response?.data?.message ?? 'Ошибка загрузки'));
  }, []);

  if (error) {
    return (
      <div style={s.page}>
        <h1 style={s.heading}>Серверы</h1>
        <div style={{ ...s.nodeCard, justifyContent: 'center', color: '#f44336', padding: '32px' }}>{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ ...s.page, alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: '16px', color: 'var(--tg-theme-hint-color, #7c8a94)' }}>Загрузка…</div>
      </div>
    );
  }

  const { nodes, onlineUsers, activeUsers } = data;
  const connected = nodes.filter((n) => n.status === 'connected').length;

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Серверы</h1>

      <div style={s.statsRow}>
        <div style={s.statCard}>
          <div style={s.statNum}>{connected}/{nodes.length}</div>
          <div style={s.statLabel}>Нод онлайн</div>
        </div>
        {onlineUsers != null && (
          <div style={s.statCard}>
            <div style={{ ...s.statNum, color: '#4caf50' }}>{onlineUsers}</div>
            <div style={s.statLabel}>Онлайн сейчас</div>
          </div>
        )}
        {activeUsers != null && (
          <div style={s.statCard}>
            <div style={s.statNum}>{activeUsers}</div>
            <div style={s.statLabel}>Активных</div>
          </div>
        )}
      </div>

      {nodes.map((node: NodeData) => {
        const cfg = statusConfig[node.status] ?? { label: node.status, color: '#9e9e9e', dot: '⚫' };
        return (
          <div key={node.id} style={s.nodeCard}>
            <span style={s.dot}>{cfg.dot}</span>
            <div style={s.nodeInfo}>
              <div style={s.nodeName}>{node.name}</div>
              {node.message && node.status !== 'connected' && (
                <div style={s.nodeMsg}>{node.message}</div>
              )}
            </div>
            <span style={{ ...s.badge, backgroundColor: cfg.color + '22', color: cfg.color }}>
              {cfg.label}
            </span>
          </div>
        );
      })}

      {nodes.length === 0 && (
        <div style={{ ...s.nodeCard, justifyContent: 'center', padding: '32px', color: 'var(--tg-theme-hint-color,#7c8a94)' }}>
          Нет доступных серверов
        </div>
      )}
    </div>
  );
}
