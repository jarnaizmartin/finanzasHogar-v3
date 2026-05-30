interface Props {
  T: any;
}

export function TrendsEmptyState({ T }: Props) {
  return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem', color: T.muted }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>📉</div>
      <p style={{ fontSize: '1.125rem', fontWeight: 800, color: T.title, marginBottom: '0.5rem' }}>
        Todavía no hay datos suficientes
      </p>
      <p style={{ fontSize: '0.875rem', color: T.muted }}>
        Registra movimientos reales durante al menos un mes para ver los
        gráficos de tendencias.
      </p>
    </div>
  );
}
