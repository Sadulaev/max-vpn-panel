import { useEffect, useState, useCallback } from 'react';
import { miniappAPI, SubscriptionItem, SubscriptionPlan } from '../../services/miniapp-api';
import { useTabContext } from '../TabContext';

const BYTES_IN_GB = 1024 * 1024 * 1024;

function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null) return '—';
  const gb = bytes / BYTES_IN_GB;
  return gb >= 1 ? `${gb.toFixed(2)} GB` : `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}

function formatExpire(expire: number | null | undefined): string {
  if (!expire) return 'Бессрочно';
  const date = new Date(expire * 1000);
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
}

function daysUntil(expire: number | null | undefined): number | null {
  if (!expire) return null;
  const diff = expire * 1000 - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function statusLabel(status: string | undefined | null): { text: string; color: string } {
  switch (status) {
    case 'active': return { text: 'Активна', color: '#4caf50' };
    case 'disabled': return { text: 'Отключена', color: '#f44336' };
    case 'expired': return { text: 'Истекла', color: '#ff9800' };
    case 'limited': return { text: 'Лимит трафика', color: '#ff5722' };
    default: return { text: status ?? '—', color: '#9e9e9e' };
  }
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  heading: { fontSize: '20px', fontWeight: 700, marginBottom: '0' },
  card: {
    backgroundColor: 'var(--tg-theme-secondary-bg-color, #232e3c)',
    borderRadius: '12px',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: '14px', fontWeight: 600, opacity: 0.6 },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: 'var(--tg-theme-hint-color, #7c8a94)', fontSize: '13px' },
  value: { fontSize: '13px', fontWeight: 500, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' },
  divider: { height: '1px', backgroundColor: 'rgba(255,255,255,0.07)' },
  statusBadge: { padding: '2px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 },
  urlRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  urlText: {
    flex: 1, fontSize: '11px', color: 'var(--tg-theme-hint-color, #7c8a94)',
    overflowX: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  btn: {
    padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: 600, flexShrink: 0,
  },
  btnPrimary: { backgroundColor: 'var(--tg-theme-button-color, #2ea6ff)', color: 'var(--tg-theme-button-text-color, #fff)' },
  btnDanger: { backgroundColor: 'rgba(244,67,54,0.15)', color: '#f44336' },
  btnGhost: { backgroundColor: 'rgba(255,255,255,0.07)', color: 'var(--tg-theme-text-color, #fff)' },
  actions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  newSubBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', width: '100%',
    backgroundColor: 'var(--tg-theme-button-color, #2ea6ff)',
    color: 'var(--tg-theme-button-text-color, #fff)',
    fontSize: '15px', fontWeight: 600,
  },
  emptyCard: {
    backgroundColor: 'var(--tg-theme-secondary-bg-color, #232e3c)',
    borderRadius: '12px', padding: '32px 16px', textAlign: 'center',
  },
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'flex-end', zIndex: 200,
  },
  sheet: {
    width: '100%', borderRadius: '16px 16px 0 0', padding: '20px 16px 32px',
    backgroundColor: 'var(--tg-theme-bg-color, #17212b)',
    display: 'flex', flexDirection: 'column', gap: '12px',
  },
  sheetTitle: { fontSize: '18px', fontWeight: 700 },
  planGrid: { display: 'flex', flexDirection: 'column', gap: '8px' },
  planRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
    border: '1.5px solid transparent',
  },
  planLabel: { fontSize: '15px', fontWeight: 600 },
  planPrice: { fontSize: '15px', fontWeight: 700, color: 'var(--tg-theme-button-color, #2ea6ff)' },
};

function PaymentSheet({
  plans,
  subscriptionId,
  suggestedName,
  onClose,
}: {
  plans: SubscriptionPlan[];
  subscriptionId?: string;
  suggestedName?: string;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subName, setSubName] = useState(suggestedName ?? '');

  const pay = async (plan: SubscriptionPlan) => {
    setLoading(true);
    setError(null);
    // iOS Safari блокирует window.open() после await — открываем окно синхронно,
    // до запроса, затем задаём URL когда он будет готов.
    const win = window.open('', '_blank');
    try {
      const name = subName.trim() || undefined;
      const { paymentUrl } = await miniappAPI.createPayment(plan.months, plan.price, subscriptionId, name);
      if (win) {
        win.location.href = paymentUrl;
      } else {
        window.location.href = paymentUrl;
      }
      onClose();
    } catch {
      win?.close();
      setError('Не удалось создать платёж. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const renderPlanButton = (plan: SubscriptionPlan) => (
    <button
      key={`${plan.planType}-${plan.months}-${plan.dataLimitGB}`}
      disabled={loading}
      onClick={() => pay(plan)}
      style={{
        ...s.planRow,
        backgroundColor: plan.planType === 'anti-throttling'
          ? 'rgba(76, 175, 80, 0.1)'
          : 'var(--tg-theme-secondary-bg-color, #232e3c)',
        border: plan.planType === 'anti-throttling'
          ? '1.5px solid rgba(76, 175, 80, 0.3)'
          : '1.5px solid rgba(255,255,255,0.08)',
        opacity: loading ? 0.6 : 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '4px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <span style={s.planLabel}>{plan.label}</span>
        <span style={s.planPrice}>{plan.price} ₽</span>
      </div>
      {plan.description && (
        <span style={{ fontSize: '11px', color: 'var(--tg-theme-hint-color, #7c8a94)' }}>
          {plan.description}
        </span>
      )}
    </button>
  );

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={s.sheetTitle}>
          {subscriptionId ? 'Продлить подписку' : 'Новая подписка'}
        </div>
        {!subscriptionId && (
          <input
            type="text"
            placeholder="Название подписки (необязательно)"
            value={subName}
            onChange={(e) => setSubName(e.target.value)}
            maxLength={100}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1.5px solid rgba(255,255,255,0.12)',
              backgroundColor: 'var(--tg-theme-secondary-bg-color, #232e3c)',
              color: 'var(--tg-theme-text-color, #fff)',
              fontSize: '14px',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        )}
        {error && <div style={{ color: '#f44336', fontSize: '13px' }}>{error}</div>}
        <div style={s.planGrid}>
          {plans.map(renderPlanButton)}
        </div>
        <button style={{ ...s.btn, ...s.btnGhost, width: '100%', marginTop: '8px' }} onClick={onClose}>
          Отмена
        </button>
      </div>
    </div>
  );
}

function SubscriptionCard({
  sub,
  index,
  plans,
  onDelete,
  canPurchase,
  canDelete,
}: {
  sub: SubscriptionItem;
  index: number;
  plans: SubscriptionPlan[];
  onDelete: (id: string) => void;
  canPurchase: boolean;
  canDelete: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { text: statusText, color: statusColor } = statusLabel(sub.status);
  const days = daysUntil(sub.expire);
  const limitGb = sub.dataLimit ? sub.dataLimit / BYTES_IN_GB : null;
  const usedGb = sub.usedTraffic != null ? sub.usedTraffic / BYTES_IN_GB : null;
  const trafficPct = usedGb != null && limitGb ? Math.min(100, (usedGb / limitGb) * 100) : null;

  // Определяем тип подписки по лимиту трафика
  const isAntiThrottling = limitGb && limitGb > 0;
  const fallbackType = isAntiThrottling ? 'Антиглушилка' : 'Стандарт';
  const subType = sub.note ? sub.note.slice(0, 30) : `${fallbackType} — ${index}`;
  const subTypeIcon = isAntiThrottling ? '🔒' : '📱';

  const handleCopy = () => {
    if (!sub.subscriptionUrl) return;
    navigator.clipboard.writeText(sub.subscriptionUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await miniappAPI.deleteSubscription(sub.id);
      onDelete(sub.id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={s.cardTitle}>{subTypeIcon} {subType}</span>
          <span style={{ ...s.statusBadge, backgroundColor: statusColor + '22', color: statusColor }}>
            {statusText}
          </span>
        </div>

        <div style={s.divider} />

        <div style={s.row}>
          <span style={s.label}>Истекает</span>
          <span style={s.value}>
            {formatExpire(sub.expire)}
            {days != null && (
              <span style={{ color: days <= 3 ? '#f44336' : 'var(--tg-theme-hint-color,#7c8a94)', fontSize: '11px', marginLeft: '6px' }}>
                ({days} дн.)
              </span>
            )}
          </span>
        </div>

        <div style={s.row}>
          <span style={s.label}>Трафик</span>
          <span style={s.value}>
            {formatBytes(sub.usedTraffic)} / {limitGb ? `${limitGb.toFixed(0)} GB` : '∞'}
          </span>
        </div>

        {trafficPct != null && (
          <div style={{ height: '5px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${trafficPct}%`, borderRadius: '3px',
              backgroundColor: trafficPct > 85 ? '#f44336' : 'var(--tg-theme-button-color, #2ea6ff)',
              transition: 'width 0.3s',
            }} />
          </div>
        )}

        {sub.subscriptionUrl && (
          <>
            <div style={s.divider} />
            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Ссылка на подписку</div>
            <div style={s.urlRow}>
              <span style={s.urlText}>{sub.subscriptionUrl}</span>
              <button style={{ ...s.btn, ...s.btnPrimary }} onClick={handleCopy}>
                {copied ? '✓' : 'Копировать'}
              </button>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>Добавить в приложение</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                style={{ ...s.btn, ...s.btnGhost, fontSize: '12px', padding: '6px 10px' }}
                onClick={() => {
                  window.location.href = `happ://add/${sub.subscriptionUrl!}`;
                }}
              >
                Happ
              </button>
              <button
                style={{ ...s.btn, ...s.btnGhost, fontSize: '12px', padding: '6px 10px' }}
                onClick={() => {
                  window.location.href = `v2raytun://import/${sub.subscriptionUrl!}`;
                }}
              >
                V2raytun
              </button>
            </div>
          </>
        )}

        <div style={s.divider} />

        <div style={s.actions}>
          <button
            disabled={!canPurchase}
            style={{ ...s.btn, ...s.btnPrimary, flex: 1, opacity: canPurchase ? 1 : 0.4 }}
            onClick={() => canPurchase && setShowPayment(true)}
          >
            Продлить
          </button>
          {canDelete && (
            <button
              disabled={deleting}
              style={{ ...s.btn, ...s.btnDanger, opacity: deleting ? 0.6 : 1 }}
              onClick={handleDelete}
            >
              {confirmDelete ? 'Подтвердить удаление' : 'Удалить'}
            </button>
          )}
        </div>
        {confirmDelete && !deleting && canDelete && (
          <button style={{ ...s.btn, ...s.btnGhost, textAlign: 'center' }} onClick={() => setConfirmDelete(false)}>
            Отмена
          </button>
        )}
      </div>

      {showPayment && (
        <PaymentSheet
          plans={plans}
          subscriptionId={sub.id}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
}

export function SubscriptionListPage({ subscriptionType = 'standard' }: { subscriptionType?: 'standard' | 'anti-throttling' }) {
  const isAnti = subscriptionType === 'anti-throttling';
  const [allSubs, setAllSubs] = useState<SubscriptionItem[] | null>(null);
  const [allPlans, setAllPlans] = useState<SubscriptionPlan[]>([]);
  const [canPurchase, setCanPurchase] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewPayment, setShowNewPayment] = useState(false);
  const { setTab } = useTabContext();

  const load = useCallback(() => {
    setError(null);
    Promise.all([
      miniappAPI.getSubscriptions(),
      miniappAPI.getPlans(),
      miniappAPI.getSettings(),
    ])
      .then(([subsData, plansData, settings]) => {
        setAllSubs(subsData);
        setAllPlans(plansData);
        setCanPurchase(isAnti ? settings.antiThrottlingEnabled : settings.standardEnabled);
      })
      .catch((e: any) => setError(e?.response?.data?.message ?? 'Ошибка загрузки данных'));
  }, [isAnti]);

  useEffect(() => { load(); }, [load]);

  const subs = allSubs?.filter((sub) =>
    isAnti ? sub.isAntiThrottling : !sub.isAntiThrottling
  ) ?? null;
  const plans = allPlans.filter((p) =>
    isAnti ? p.planType === 'anti-throttling' : !p.planType || p.planType === 'standard'
  );

  const handleDelete = (id: string) => {
    setAllSubs((prev) => prev?.filter((s) => s.id !== id) ?? null);
  };

  if (error) {
    return (
      <div style={s.page}>
        <div style={s.emptyCard}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
          <div style={{ color: '#f44336', fontSize: '14px' }}>{error}</div>
        </div>
      </div>
    );
  }

  if (!subs) {
    return (
      <div style={{ ...s.page, alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: '16px', color: 'var(--tg-theme-hint-color, #7c8a94)' }}>Загрузка…</div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <h1 style={s.heading}>{isAnti ? '🛡️ Антиглушилка' : '📶 Стандарт — безлимит'}</h1>

      {subs.length === 0 && (
        <div style={s.emptyCard}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>{isAnti ? '🛡️' : '📭'}</div>
          <div style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color, #7c8a94)' }}>
            {isAnti
              ? <>Нет подписок антиглушилки.<br />Оформите для обхода блокировок.</>
              : <>У вас пока нет подписок.<br />Оформите первую ниже.</>
            }
          </div>
        </div>
      )}

      {subs.map((sub, idx) => (
        <SubscriptionCard
          key={sub.id}
          sub={sub}
          index={idx + 1}
          plans={plans}
          onDelete={handleDelete}
          canPurchase={canPurchase}
          canDelete={sub.canDelete}
        />
      ))}

      {plans.length > 0 && (
        canPurchase ? (
          <button style={s.newSubBtn} onClick={() => setShowNewPayment(true)}>
            + Новая подписка
          </button>
        ) : (
          <div style={{
            ...s.emptyCard,
            borderRadius: '12px',
            border: '1px solid rgba(249,168,37,0.3)',
            backgroundColor: 'rgba(249,168,37,0.08)',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔒</div>
            <div style={{ fontSize: '14px', color: '#f9a825', fontWeight: 600 }}>Продажа временно приостановлена</div>
            <div style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color, #7c8a94)', marginTop: '4px' }}>Попробуйте позже</div>
          </div>
        )
      )}

      <button
        style={{
          ...s.newSubBtn,
          backgroundColor: 'var(--tg-theme-secondary-bg-color, #232e3c)',
          color: 'var(--tg-theme-text-color, #fff)',
        }}
        onClick={() => setTab('instructions')}
      >
        📍 Инструкция по установке
      </button>

      {showNewPayment && (
        <PaymentSheet
          plans={plans}
          suggestedName={isAnti ? `Антиглушилка-${subs.length + 1}` : `Стандарт-${subs.length + 1}`}
          onClose={() => setShowNewPayment(false)}
        />
      )}
    </div>
  );
}

export default function SubscriptionPage() {
  return <SubscriptionListPage subscriptionType="standard" />;
}
