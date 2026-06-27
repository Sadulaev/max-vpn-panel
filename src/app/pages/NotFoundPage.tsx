export default function NotFoundPage() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100dvh', backgroundColor: '#f5f5f5', color: '#333', fontFamily: 'sans-serif',
    }}>
      <div style={{ fontSize: '96px', fontWeight: 700, color: '#ccc', lineHeight: 1 }}>404</div>
      <div style={{ fontSize: '18px', marginTop: '16px', color: '#666' }}>Страница не найдена</div>
    </div>
  );
}
