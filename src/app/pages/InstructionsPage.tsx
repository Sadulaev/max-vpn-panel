const s: Record<string, React.CSSProperties> = {
  page: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' },
  heading: { fontSize: '20px', fontWeight: 700, marginBottom: '0' },
  sectionTitle: { fontSize: '16px', fontWeight: 700, marginBottom: '0' },
  card: {
    backgroundColor: 'var(--tg-theme-secondary-bg-color, #232e3c)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  cardTitle: { fontSize: '15px', fontWeight: 700 },
  step: { fontSize: '13px', lineHeight: 1.6, color: 'var(--tg-theme-text-color, #fff)' },
  hint: { fontSize: '12px', color: 'var(--tg-theme-hint-color, #7c8a94)', lineHeight: 1.5 },
  link: {
    color: 'var(--tg-theme-button-color, #2ea6ff)',
    textDecoration: 'none',
    fontWeight: 500,
  },
  divider: { height: '1px', backgroundColor: 'rgba(255,255,255,0.07)' },
  downloadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: 'var(--tg-theme-button-color, #2ea6ff)',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '13px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
  },
};

interface AppInfo {
  name: string;
  url: string;
  steps: string[];
}

interface DeviceSection {
  title: string;
  icon: string;
  apps: AppInfo[];
}

const devices: DeviceSection[] = [
  {
    title: 'Windows',
    icon: '💻',
    apps: [
      {
        name: 'Nekobox',
        url: 'https://github.com/qr243vbi/nekobox/releases/download/5.10.22/nekobox-5.10.22-windows64-installer.exe',
        steps: [
          'Скачайте и установите Nekobox.',
          'Скопируйте ссылку на подписку.',
          'В Nekobox: Preferences → Groups → New Group → «Subscription» → вставьте URL.',
          'Нажмите «Update Subscription», выберите сервер и подключитесь.',
        ],
      },
      {
        name: 'Happ',
        url: 'https://github.com/Happ-proxy/happ-desktop/releases/latest/download/setup-Happ.x64.exe',
        steps: [
          'Скачайте и установите Happ.',
          'На странице подписки нажмите кнопку «Happ» — приложение откроется автоматически с добавленной подпиской.',
          'Или скопируйте ссылку на подписку и вставьте в приложении: нажмите «+» → «Добавить из буфера обмена».',
          'Нажмите кнопку подключения.',
        ],
      },
      {
        name: 'Hiddify',
        url: 'https://github.com/hiddify/hiddify-app/releases/download/v2.5.7/Hiddify-Windows-Setup-x64.exe',
        steps: [
          'Скачайте и установите Hiddify.',
          'Скопируйте ссылку на подписку и вставьте в приложении: нажмите «+» → «Добавить из буфера обмена».',
          'Нажмите кнопку подключения (большая кнопка в центре).',
        ],
      },
    ],
  },
  {
    title: 'Android',
    icon: '📱',
    apps: [
      {
        name: 'Happ',
        url: 'https://play.google.com/store/apps/details?id=com.happproxy',
        steps: [
          'Скачайте Happ из Google Play.',
          'На странице подписки нажмите кнопку «Happ» — приложение откроется автоматически с добавленной подпиской.',
          'Или скопируйте ссылку на подписку и вставьте в приложении: нажмите «+» → «Добавить из буфера обмена».',
          'Нажмите кнопку подключения.',
        ],
      },
      {
        name: 'V2raytun',
        url: 'https://play.google.com/store/apps/details?id=com.v2raytun.android',
        steps: [
          'Скачайте V2raytun из Google Play.',
          'На странице подписки нажмите кнопку «V2raytun» — приложение откроется и добавит подписку.',
          'Или скопируйте ссылку и добавьте вручную в приложении.',
          'Выберите сервер из списка и нажмите кнопку подключения.',
        ],
      },
    ],
  },
  {
    title: 'iOS',
    icon: '🍏',
    apps: [
      {
        name: 'Happ',
        url: 'https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973',
        steps: [
          'Скачайте Happ из App Store.',
          'На странице подписки нажмите кнопку «Happ» — приложение откроется автоматически с добавленной подпиской.',
          'Или скопируйте ссылку на подписку и вставьте в приложении: нажмите «+» → «Добавить из буфера обмена».',
          'Нажмите кнопку подключения.',
        ],
      },
      {
        name: 'V2raytun',
        url: 'https://apps.apple.com/ru/app/v2raytun/id6476628951',
        steps: [
          'Скачайте V2raytun из App Store.',
          'На странице подписки нажмите кнопку «V2raytun» — приложение откроется и добавит подписку.',
          'Или скопируйте ссылку и добавьте вручную в приложении.',
          'Выберите сервер и нажмите кнопку подключения.',
        ],
      },
      {
        name: 'Clash Mi',
        url: 'https://apps.apple.com/ru/app/clash-mi/id6744321968',
        steps: [
          'Скачайте Clash Mi из App Store.',
          'Скопируйте ссылку на подписку со страницы подписки.',
          'Откройте Clash Mi → добавьте подписку → вставьте URL.',
          'Выберите сервер и подключитесь.',
        ],
      },
      {
        name: 'Shadowrocket',
        url: 'https://apps.apple.com/ru/app/shadowrocket/id932747118',
        steps: [
          'Скачайте Shadowrocket из App Store.',
          'Скопируйте ссылку на подписку со страницы подписки.',
          'Откройте Shadowrocket → «+» → тип «Subscribe» → вставьте URL → сохраните.',
          'Выберите сервер и нажмите переключатель для подключения.',
        ],
      },
    ],
  },
];

function openLink(url: string) {
  window.open(url, '_blank');
}

export default function InstructionsPage() {
  return (
    <div style={s.page}>
      <h1 style={s.heading}>Инструкции по установке</h1>

      <div style={s.card}>
        <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
          <strong>Как подключить VPN:</strong>
          <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>Оформите подписку на странице «Подписка»</li>
            <li>Скачайте одно из приложений ниже</li>
            <li>Добавьте ссылку на подписку в приложение</li>
            <li>Подключитесь — готово!</li>
          </ol>
        </div>
        <div style={s.hint}>
          💡 Используйте кнопки авто-вставки на странице подписки для быстрого добавления
          в поддерживаемые приложения.
        </div>
      </div>

      {devices.map((device) => (
        <div key={device.title}>
          <h2 style={s.sectionTitle}>{device.icon} {device.title}</h2>
          {device.apps.map((app) => (
            <div key={app.name} style={{ ...s.card, marginTop: '8px' }}>
              <div style={s.cardTitle}>{app.name}</div>
              <div style={s.divider} />
              <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {app.steps.map((step, i) => (
                  <li key={i} style={s.step}>{step}</li>
                ))}
              </ol>
              <button
                style={s.downloadBtn}
                onClick={(e) => {
                  e.preventDefault();
                  openLink(app.url);
                }}
              >
                📥 Скачать {app.name}
              </button>
            </div>
          ))}
        </div>
      ))}

      <div style={s.card}>
        <div style={s.hint}>
          ⚠️ Если подписка не добавляется автоматически, скопируйте ссылку вручную со страницы
          «Подписка» и вставьте в приложение.
          <br /><br />
          Для вопросов обратитесь в{' '}
          <button
            style={{ ...s.downloadBtn, display: 'inline' }}
            onClick={(e) => {
              e.preventDefault();
              openLink('https://t.me/hyper_vpn_help');
            }}
          >
            техподдержку
          </button>.
        </div>
      </div>
    </div>
  );
}
