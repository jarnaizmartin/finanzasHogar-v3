// src/lib/helpCenterData.ts
//
// Tipos y datos estáticos del Centro de Ayuda.
// Extraído de HelpCenter.tsx (refactor/help-center, commit 1/6).
//
// Este archivo es contenido puro — sin lógica, sin React.

import {
  Wallet,
  Receipt,
  BarChart2,
  Target,
  TrendingUp,
  Shield,
  Archive,
  ArrowLeftRight,
} from 'lucide-react';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type HelpSection = 'home' | 'manual' | 'faq' | 'shortcuts' | 'getting-started';

export interface ManualSection {
  id: string;
  icon: any;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  content: {
    heading: string;
    text: string;
    tip?: string;
  }[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  tags: string[];
}

export interface FAQCategory {
  id: string;
  emoji: string;
  label: string;
  color: string;
  items: FAQItem[];
}

export interface Shortcut {
  keys: string[];
  description: string;
}

// ─── Datos del Manual ─────────────────────────────────────────────────────────

export const MANUAL_SECTIONS: ManualSection[] = [
  {
    id: 'accounts',
    icon: Wallet,
    emoji: '🏦',
    title: 'Cuentas',
    subtitle: 'Gestiona tus cuentas bancarias y efectivo',
    color: '#2563eb',
    content: [
      {
        heading: '¿Qué es una cuenta?',
        text: 'Una cuenta representa cualquier lugar donde guardas dinero: cuenta corriente, cuenta de ahorro, efectivo, inversiones, etc. Cada cuenta tiene un saldo base y una fecha asociada.',
      },
      {
        heading: 'Saldo base vs Saldo real',
        text: 'El saldo base es el importe que introduces manualmente junto con su fecha. El saldo real es el resultado de sumar al saldo base todos los movimientos reales (gastos e ingresos) registrados con fecha posterior al saldo base.',
        tip: '💡 Actualiza el saldo base periódicamente para mantener tus cuentas sincronizadas con la realidad.',
      },
      {
        heading: 'Saldo mínimo de alerta',
        text: 'Puedes configurar un saldo mínimo para cada cuenta. Si el saldo real calculado cae por debajo, recibirás una alerta automática en el panel de Alertas y en el Resumen.',
      },
      {
        heading: 'Divisa por cuenta',
        text: 'Cada cuenta puede tener su propia divisa. Los importes se convierten automáticamente a tu divisa de visualización usando tipos de cambio en tiempo real.',
      },
      {
        heading: '¿Cómo actualizar el saldo?',
        text: 'Edita la cuenta y cambia el saldo e introduce la fecha actual. La app reconocerá automáticamente todos los movimientos anteriores a esa fecha para evitar duplicidades.',
        tip: '💡 Recomendamos actualizar el saldo base mensualmente consultando tu extracto bancario real.',
      },
    ],
  },
  {
    id: 'real',
    icon: Receipt,
    emoji: '🧾',
    title: 'Gastos Reales',
    subtitle: 'Registra y analiza tus movimientos reales',
    color: '#dc2626',
    content: [
      {
        heading: '¿Qué son los gastos reales?',
        text: 'Son los movimientos reales de dinero: ingresos recibidos y gastos realizados. A diferencia de las proyecciones (que son estimaciones), los gastos reales reflejan lo que realmente ha ocurrido.',
      },
      {
        heading: 'Fecha de apunte vs Fecha de valor',
        text: 'La fecha de apunte es cuándo ocurrió el movimiento (ej: compra en tienda). La fecha de valor es cuándo se refleja en tu cuenta bancaria. Para el cálculo del saldo real, se usa la fecha de valor.',
      },
      {
        heading: 'Importar desde CSV bancario',
        text: 'Puedes importar movimientos directamente desde el fichero CSV que descarga tu banco. La app detecta duplicados automáticamente y categoriza los movimientos según palabras clave configurables.',
        tip: '💡 Configura las Reglas de categorización en el importador CSV para que la app asigne categorías automáticamente.',
      },
      {
        heading: 'Filtros avanzados',
        text: 'Usa los filtros de tipo, cuenta, categoría y fecha para analizar tus movimientos. Puedes usar períodos predefinidos (este mes, último mes, últimos 3 meses) o definir un rango personalizado.',
      },
      {
        heading: 'Movimientos recurrentes automáticos',
        text: 'Si activas "Es un cargo fijo confirmado" en una proyección, la app generará automáticamente el gasto real en la fecha configurada cada mes.',
        tip: '⚠️ Si ya existe un movimiento similar en ese mes, la app lo detectará como posible duplicado y te avisará.',
      },
    ],
  },
  {
    id: 'projections',
    icon: BarChart2,
    emoji: '📈',
    title: 'Proyecciones',
    subtitle: 'Planifica ingresos y gastos futuros',
    color: '#7c3aed',
    content: [
      {
        heading: '¿Qué es una proyección?',
        text: 'Una proyección es un ingreso o gasto esperado en el futuro. Puede ser mensual, bimensual, trimestral, semestral o anual. Las proyecciones forman la base del cálculo de previsión de saldos.',
      },
      {
        heading: 'Frecuencias disponibles',
        text: 'Puedes configurar la frecuencia: Mensual (cada mes), Bimensual (cada 2 meses), Trimestral (cada 3), Semestral (cada 6) o Anual. El día de cobro/pago corresponde al día de la fecha de inicio.',
      },
      {
        heading: 'Ajuste para el próximo mes',
        text: 'Si un mes concreto el importe será diferente al habitual (ej: una nómina con paga extra), puedes indicar el importe puntual. Al mes siguiente vuelve automáticamente al importe habitual.',
        tip: '💡 Usa el botón 💶 en cada proyección para configurar rápidamente el ajuste del próximo mes.',
      },
      {
        heading: 'Cargos fijos confirmados',
        text: 'Activa "Es un cargo fijo confirmado" para proyecciones que sabes que se cobrarán con seguridad (Netflix, alquiler, etc.). La app generará automáticamente el gasto real en la fecha configurada.',
      },
      {
        heading: '¿Cómo afectan al saldo?',
        text: 'Para meses pasados, se usan los movimientos reales. Para el mes actual, se combinan los reales con el residual proyectado por categoría. Para meses futuros, se usa únicamente la proyección.',
      },
    ],
  },
  {
    id: 'forecast',
    icon: TrendingUp,
    emoji: '🔮',
    title: 'Previsión',
    subtitle: 'Evolución proyectada de tus saldos a 12 meses',
    color: '#0891b2',
    content: [
      {
        heading: '¿Cómo funciona la previsión?',
        text: 'La previsión calcula el saldo estimado para los próximos 12 meses partiendo del saldo real actual y aplicando las proyecciones configuradas. Puedes ver el resultado por cuenta o consolidado.',
      },
      {
        heading: 'Interpretación del gráfico',
        text: 'Las barras azules indican saldo normal. Las ámbar indican que el saldo caerá por debajo del mínimo configurado. Las rojas indican saldo negativo.',
      },
      {
        heading: 'Limitaciones',
        text: 'La previsión solo incluye los movimientos que hayas proyectado. Gastos imprevistos, variaciones en ingresos o nuevas proyecciones no estarán reflejados hasta que los configures.',
        tip: '💡 Actualiza tus proyecciones regularmente para mantener la previsión lo más precisa posible.',
      },
    ],
  },
  {
    id: 'goals',
    icon: Target,
    emoji: '🎯',
    title: 'Objetivos',
    subtitle: 'Define metas de ahorro y sigue tu progreso',
    color: '#16a34a',
    content: [
      {
        heading: 'Tipos de objetivos',
        text: 'Hay dos modos: Manual (introduces tú el importe ahorrado cuando quieras) y Automático (la app suma los movimientos reales de una categoría y cuenta específicas).',
      },
      {
        heading: 'Modo automático',
        text: 'En modo automático, selecciona la categoría y cuenta que quieres monitorizar, y la fecha desde la que contar. La app sumará todos los movimientos válidos automáticamente.',
        tip: '💡 Usa el modo automático para objetivos vinculados a una categoría de ahorro específica, como "Ahorro / Inversión".',
      },
      {
        heading: 'Métricas de seguimiento',
        text: 'Para cada objetivo verás: importe ahorrado, porcentaje de progreso, importe restante, meses disponibles (si hay fecha límite) y ritmo mensual necesario para llegar a tiempo.',
      },
      {
        heading: 'Alertas de objetivos',
        text: 'La app genera alertas automáticas si un objetivo está en peligro (ritmo insuficiente), si ha vencido sin completarse o si se ha completado con éxito.',
      },
    ],
  },
  {
    id: 'security',
    icon: Shield,
    emoji: '🔐',
    title: 'Seguridad',
    subtitle: 'Protege tus datos financieros',
    color: '#f59e0b',
    content: [
      {
        heading: 'Métodos de autenticación',
        text: 'Puedes proteger la app con contraseña clásica o con verificación en dos pasos (TOTP). El TOTP es más seguro: usa apps como Google Authenticator, Authy o Microsoft Authenticator.',
      },
      {
        heading: 'Frase de recuperación',
        text: 'Al configurar la seguridad, recibirás 12 palabras de recuperación. Guárdalas en un lugar seguro fuera del ordenador. Son la única forma de recuperar el acceso si olvidas tu contraseña.',
        tip: '⚠️ Si pierdes tu frase de recuperación y tu contraseña, no podrás acceder a la app. No hay "recuperar contraseña" automático.',
      },
      {
        heading: 'Fichero de recuperación',
        text: 'Además de la frase, puedes descargar un fichero .json de recuperación. Guárdalo en un lugar seguro (USB, nube privada). Úsalo junto con una nueva contraseña para recuperar el acceso.',
      },
      {
        heading: 'Período de gracia TOTP',
        text: 'Si usas TOTP, puedes configurar cuánto tiempo puede pasar sin pedirte el código al reabrir la app. Desde "pedir siempre" hasta "no volver a pedir".',
      },
      {
        heading: 'Bloqueo por inactividad',
        text: 'La app se bloquea automáticamente tras un período de inactividad configurable (5, 15, 30 minutos o 1 hora). Útil si compartes ordenador.',
      },
    ],
  },
  {
    id: 'backup',
    icon: Archive,
    emoji: '💾',
    title: 'Copias de Seguridad',
    subtitle: 'Protege tus datos contra pérdidas',
    color: '#8b5cf6',
    content: [
      {
        heading: 'Historial interno vs Fichero descargado',
        text: 'El historial interno (hasta 50 copias) se guarda en el navegador. El fichero descargado (.json) es una copia física en tu ordenador. Ambas son importantes, pero solo el fichero sobrevive a limpiezas del navegador.',
        tip: '⚠️ Si limpias el historial del navegador o cambias de dispositivo, el historial interno se pierde. Descarga siempre una copia física.',
      },
      {
        heading: 'Backup automático',
        text: 'La app crea automáticamente una copia en el historial interno al arrancar si han pasado más días de los configurados desde la última copia. Puedes ajustar la frecuencia (7, 14 o 30 días).',
      },
      {
        heading: 'Restaurar una copia',
        text: 'Desde el panel de copias de seguridad puedes restaurar cualquier copia del historial o importar un fichero .json descargado previamente. Antes de restaurar, la app guarda automáticamente el estado actual.',
      },
      {
        heading: 'Copia previa al borrado',
        text: 'Cuando vayas a hacer un borrado selectivo de datos, puedes marcar la opción de descargar una copia previa. Recomendado siempre.',
        tip: '💡 Recomendamos descargar una copia física al menos una vez a la semana y guardarla en un lugar seguro como Google Drive o un USB.',
      },
    ],
  },
  {
    id: 'currencies',
    icon: ArrowLeftRight,
    emoji: '💱',
    title: 'Divisas',
    subtitle: 'Gestiona múltiples monedas',
    color: '#0d9488',
    content: [
      {
        heading: 'Divisa base vs Divisa de visualización',
        text: 'La divisa base es en la que introduces tus datos (ej: EUR). La divisa de visualización es en la que se muestran los importes en pantalla (puede ser diferente si vives en un país o tienes cuentas en otra moneda).',
      },
      {
        heading: 'Divisa por cuenta',
        text: 'Cada cuenta puede tener su propia divisa. Por ejemplo, puedes tener una cuenta en EUR y otra en USD. Los totales se convierten automáticamente a la divisa de visualización.',
      },
      {
        heading: 'Actualización de tipos de cambio',
        text: 'Los tipos de cambio se obtienen de Frankfurter API y ExchangeRate-API cada 24 horas. Si no hay conexión, se usan valores aproximados. El indicador en el header muestra el estado actualización.',
        tip: '⚠️ Los tipos de cambio son orientativos. Para operaciones financieras importantes, consulta siempre el tipo oficial de tu banco.',
      },
    ],
  },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────

export const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: 'general',
    emoji: '⚙️',
    label: 'General',
    color: '#2563eb',
    items: [
      {
        id: 'g1',
        question: '¿Dónde se guardan mis datos?',
        answer:
          'Todos tus datos se guardan exclusivamente en el almacenamiento local (localStorage) de tu navegador, en tu propio dispositivo. Nunca se envían a ningún servidor externo. Tus datos son completamente privados.',
        tags: ['datos', 'privacidad', 'almacenamiento'],
      },
      {
        id: 'g2',
        question: '¿Puedo usar la app sin conexión a internet?',
        answer:
          'Sí, la app funciona completamente sin conexión. La única funcionalidad que requiere internet es la actualización de tipos de cambio (para conversión de divisas). Si no hay conexión, se usan los últimos valores descargados o valores aproximados.',
        tags: ['offline', 'internet', 'conexión'],
      },
      {
        id: 'g3',
        question: '¿Qué pasa si cierro el navegador?',
        answer:
          'Tus datos se conservan en el almacenamiento local del navegador. Al volver a abrir la app, encontrarás todo exactamente como lo dejaste. Sin embargo, si limpias el historial del navegador o los datos del sitio, perderás toda la información. Por eso es fundamental descargar copias de seguridad regularmente.',
        tags: ['datos', 'navegador', 'pérdida'],
      },
      {
        id: 'g4',
        question: '¿Puedo usar la app en varios dispositivos?',
        answer:
          'Los datos no se sincronizan automáticamente entre dispositivos. Para llevar tus datos a otro dispositivo, descarga una copia de seguridad (.json) desde la app actual e impórtala en el nuevo dispositivo usando el panel de Copias de seguridad.',
        tags: ['dispositivos', 'sincronización', 'backup'],
      },
      {
        id: 'g5',
        question: '¿Cómo cambio el idioma de la app?',
        answer:
          'La app está disponible únicamente en español por el momento. No hay opción de cambiar el idioma en esta versión.',
        tags: ['idioma', 'configuración'],
      },
      {
        id: 'g6',
        question: '¿Cómo activo el modo oscuro?',
        answer:
          'Haz clic en el icono de luna 🌙 en la barra superior derecha del header. Para volver al modo claro, haz clic en el icono de sol ☀️.',
        tags: ['modo oscuro', 'tema', 'apariencia'],
      },
      {
        id: 'g7',
        question: '¿Cómo reseteo la aplicación por completo?',
        answer:
          'Haz clic en el icono de papelera 🗑️ en el header. Aparecerá un panel de borrado selectivo donde puedes elegir qué datos eliminar. Si seleccionas todos los datos (cuentas, categorías, proyecciones, etc.), la app volverá al onboarding inicial. Te recomendamos descargar una copia de seguridad antes.',
        tags: ['reset', 'borrado', 'datos'],
      },
      {
        id: 'g8',
        question: '¿Qué significa el indicador de tipos de cambio en el header?',
        answer:
          '✅ Verde: tipos actualizados en las últimas 24h. ⚠️ Ámbar: usando tipos aproximados (sin conexión o error). Puedes hacer clic en el botón de divisas para ver el estado detallado y forzar una actualización.',
        tags: ['divisas', 'tipos de cambio', 'indicador'],
      },
    ],
  },
  {
    id: 'accounts',
    emoji: '🏦',
    label: 'Cuentas',
    color: '#2563eb',
    items: [
      {
        id: 'a1',
        question: '¿Por qué el saldo real es diferente al saldo que introduje?',
        answer:
          'El saldo real se calcula sumando al saldo base todos los movimientos reales (gastos e ingresos) con fecha de valor posterior a la fecha del saldo base. Si has registrado movimientos desde la última actualización del saldo, el saldo real reflejará esos cambios.',
        tags: ['saldo', 'cálculo', 'real'],
      },
      {
        id: 'a2',
        question: '¿Qué pasa cuando cambio la fecha del saldo base?',
        answer:
          'Al cambiar la fecha del saldo base, la app reconoce automáticamente todos los movimientos anteriores a esa fecha (los marca como "reconocidos"). Esto evita que se contabilicen dos veces: una en el saldo base que introduces y otra como movimiento real.',
        tags: ['saldo base', 'fecha', 'reconocidos'],
      },
      {
        id: 'a3',
        question: '¿Qué significa "movimientos ignorados"?',
        answer:
          'Son movimientos reales cuya fecha de valor es anterior o igual a la fecha del saldo base. Se consideran ya incluidos en el saldo base y no se suman al cálculo del saldo real. Si hay muchos, considera actualizar tu saldo base.',
        tags: ['ignorados', 'saldo base', 'movimientos'],
      },
      {
        id: 'a4',
        question: '¿Puedo tener cuentas en diferentes monedas?',
        answer:
          'Sí. Al crear o editar una cuenta, puedes seleccionar la divisa específica de esa cuenta (EUR, USD, GBP, etc.). Los importes se convierten automáticamente a tu divisa de visualización usando tipos de cambio en tiempo real.',
        tags: ['divisas', 'monedas', 'cuentas'],
      },
      {
        id: 'a5',
        question: '¿Qué pasa si elimino una cuenta?',
        answer:
          'Al eliminar una cuenta, también se eliminan todos sus movimientos reales, proyecciones y objetivos automáticos asociados. Esta acción no se puede deshacer, pero siempre puedes restaurar desde una copia de seguridad.',
        tags: ['eliminar', 'cuenta', 'datos asociados'],
      },
    ],
  },
  {
    id: 'expenses',
    emoji: '🧾',
    label: 'Gastos Reales',
    color: '#dc2626',
    items: [
      {
        id: 'e1',
        question: '¿Cuál es la diferencia entre fecha de apunte y fecha de valor?',
        answer:
          'La fecha de apunte es cuando realizas la operación (ej: pagas en una tienda el día 15). La fecha de valor es cuando el dinero sale o entra realmente en tu cuenta bancaria (puede ser el 17). Para el cálculo del saldo real se usa la fecha de valor.',
        tags: ['fecha', 'apunte', 'valor', 'cálculo'],
      },
      {
        id: 'e2',
        question: '¿Cómo importo movimientos desde mi banco?',
        answer:
          'Haz clic en "🏦 Importar CSV" en la sección Gastos Reales. Selecciona el formato de tu banco (Santander, BBVA, ING, etc.), sube el fichero CSV descargado desde tu banca online, revisa la vista previa y confirma la importación.',
        tags: ['importar', 'CSV', 'banco'],
      },
      {
        id: 'e3',
        question: '¿Qué pasa si aparece "Posible duplicado" en un movimiento?',
        answer:
          'La app detecta movimientos muy similares en importe, tipo y fecha. Si crees que no es un duplicado real, haz clic en el badge "⚠️ Posible duplicado ✕" para marcarlo como revisado y que desaparezca el aviso.',
        tags: ['duplicado', 'importación', 'aviso'],
      },
      {
        id: 'e4',
        question: '¿Puedo registrar movimientos en divisas diferentes?',
        answer:
          'Sí. Al añadir un movimiento, puedes seleccionar la divisa del importe. La app lo convertirá automáticamente a tu divisa de visualización. Útil para gastos de viaje o cuentas en otra moneda.',
        tags: ['divisas', 'monedas', 'movimientos'],
      },
      {
        id: 'e5',
        question: '¿Cómo funciona la auto-categorización en la importación CSV?',
        answer:
          'La app busca palabras clave en la descripción del movimiento para asignar automáticamente una categoría. Puedes configurar tus propias reglas desde el botón "🏷️ Reglas de categorías" dentro del importador CSV.',
        tags: ['categorización', 'auto', 'reglas', 'CSV'],
      },
      {
        id: 'e6',
        question: '¿Qué son los movimientos recurrentes automáticos?',
        answer:
          'Si activas "Es un cargo fijo confirmado" en una proyección, la app genera automáticamente el gasto real en la fecha configurada. Si ya existe un movimiento similar ese mes, lo detecta como posible duplicado y no lo genera.',
        tags: ['recurrente', 'automático', 'proyección'],
      },
    ],
  },
  {
    id: 'projections',
    emoji: '📈',
    label: 'Proyecciones',
    color: '#7c3aed',
    items: [
      {
        id: 'p1',
        question: '¿Cuál es la diferencia entre proyecciones y gastos reales?',
        answer:
          'Las proyecciones son estimaciones de ingresos y gastos futuros que planificas. Los gastos reales son movimientos que ya han ocurrido. Las proyecciones ayudan a calcular la previsión de saldos futuros.',
        tags: ['proyecciones', 'reales', 'diferencia'],
      },
      {
        id: 'p2',
        question: '¿Cómo calcula la app el mes actual en la previsión?',
        answer:
          'Para el mes actual, la app combina los movimientos reales ya registrados con el "residual" de las proyecciones. Si tu proyección de alquiler es 900€ y ya has registrado 900€ reales en esa categoría, el residual es 0€.',
        tags: ['previsión', 'mes actual', 'residual', 'cálculo'],
      },
      {
        id: 'p3',
        question: '¿Qué es el "ajuste para el próximo mes"?',
        answer:
          'Si un mes concreto el importe de una proyección será diferente (ej: la nómina tiene paga extra), puedes indicar el importe puntual usando el botón 💶. Al mes siguiente vuelve automáticamente al importe habitual.',
        tags: ['ajuste', 'importe puntual', 'próximo mes'],
      },
      {
        id: 'p4',
        question: '¿Por qué aparece "Posible duplicado" en una proyección?',
        answer:
          'Cuando una proyección marcada como "cargo fijo" intenta generar un gasto real pero ya existe un movimiento muy similar ese mes, la app lo detecta como posible duplicado y no lo genera. Revisa tus movimientos y proyecciones para confirmar.',
        tags: ['duplicado', 'cargo fijo', 'aviso'],
      },
      {
        id: 'p5',
        question: '¿Puedo tener proyecciones sin fecha de fin?',
        answer:
          'Sí, si no indicas fecha de fin, la proyección se aplica indefinidamente hacia el futuro. Útil para gastos fijos continuos como alquiler o suscripciones.',
        tags: ['fecha fin', 'proyección', 'indefinida'],
      },
    ],
  },
  {
    id: 'goals',
    emoji: '🎯',
    label: 'Objetivos',
    color: '#16a34a',
    items: [
      {
        id: 'ob1',
        question: '¿Cuándo debería usar el modo manual vs automático?',
        answer:
          'Usa el modo manual si guardas el dinero "mentalmente" o en efectivo sin un flujo específico. Usa el automático si tienes una categoría dedicada al ahorro (ej: transferencias a una cuenta de ahorro categorizada como "Ahorro / Inversión").',
        tags: ['manual', 'automático', 'modo'],
      },
      {
        id: 'ob2',
        question: '¿Cómo actualizo el importe ahorrado en modo manual?',
        answer:
          'Desde la tarjeta del objetivo, haz clic en "✏️ Actualizar importe ahorrado". También puedes editar el objetivo directamente desde el botón de lápiz.',
        tags: ['actualizar', 'manual', 'importe'],
      },
      {
        id: 'ob3',
        question: '¿Qué significa "Ritmo actual" y "Necesitas/mes"?',
        answer:
          '"Ritmo actual" es el promedio mensual de ahorro de los últimos 3 meses (solo en modo automático). "Necesitas/mes" es el importe mensual que necesitas ahorrar para alcanzar el objetivo antes de la fecha límite.',
        tags: ['ritmo', 'velocidad', 'cálculo'],
      },
      {
        id: 'ob4',
        question: '¿Qué pasa cuando llego al 100% de un objetivo?',
        answer:
          'La app genera automáticamente una alerta positiva de "¡Objetivo completado!" y la tarjeta del objetivo se muestra en verde con el mensaje de celebración. El objetivo permanece activo hasta que lo elimines.',
        tags: ['completado', 'alerta', '100%'],
      },
    ],
  },
  {
    id: 'alerts',
    emoji: '🔔',
    label: 'Alertas',
    color: '#d97706',
    items: [
      {
        id: 'al1',
        question: '¿Qué tipos de alertas genera la app?',
        answer:
          'La app genera alertas de: saldo crítico (ya bajo el mínimo), saldo en riesgo (caerá bajo el mínimo en <3 meses), presupuesto superado (gasto real > proyección), mes con balance negativo, objetivos en peligro, vencidos o completados.',
        tags: ['tipos', 'alertas', 'categorías'],
      },
      {
        id: 'al2',
        question: '¿Cuál es la diferencia entre "Descartar" e "Ignorar siempre"?',
        answer:
          '"Descartar" (✕) oculta la alerta hasta la próxima sesión o hasta que los datos cambien. "Ignorar siempre" (🚫) la oculta permanentemente aunque la condición persista. Puedes restaurar las alertas ignoradas desde el botón del header de Alertas.',
        tags: ['descartar', 'ignorar', 'alertas'],
      },
      {
        id: 'al3',
        question: '¿Las alertas se actualizan en tiempo real?',
        answer:
          'Sí. Las alertas se recalculan automáticamente cada vez que cambias datos (añades un movimiento, modificas una proyección, etc.). No necesitas hacer nada para actualizarlas.',
        tags: ['tiempo real', 'actualización', 'alertas'],
      },
    ],
  },
  {
    id: 'security',
    emoji: '🔐',
    label: 'Seguridad',
    color: '#f59e0b',
    items: [
      {
        id: 's1',
        question: '¿Olvidé mi contraseña. ¿Qué hago?',
        answer:
          'Desde la pantalla de bloqueo, usa una de estas opciones: 1) "🔑 Usar frase de recuperación" (las 12 palabras que guardaste al configurar la seguridad), 2) "📄 Usar fichero de recuperación" (.json descargado previamente), 3) "📧 Recuperar por email" (si configuraste un email de recuperación).',
        tags: ['contraseña', 'recuperación', 'olvidé'],
      },
      {
        id: 's2',
        question: '¿Qué es el TOTP y qué app usar?',
        answer:
          'TOTP (Time-based One-Time Password) es un código de 6 dígitos que cambia cada 30 segundos. Usa apps como Google Authenticator, Authy, Microsoft Authenticator o cualquier app compatible con códigos TOTP/2FA.',
        tags: ['TOTP', '2FA', 'autenticador', 'verificación'],
      },
      {
        id: 's3',
        question: '¿Puedo cambiar de contraseña a TOTP (o viceversa)?',
        answer:
          'Sí. Ve a Ajustes de seguridad (icono ⚙️ en el header) y haz clic en "🔄 Cambiar método de acceso". Deberás verificar tu método actual antes de configurar el nuevo.',
        tags: ['cambiar', 'método', 'contraseña', 'TOTP'],
      },
      {
        id: 's4',
        question: '¿Qué es la frase de recuperación de 12 palabras?',
        answer:
          'Es un conjunto de 12 palabras aleatorias generadas al configurar la seguridad. Permite recuperar el acceso a la app si olvidas tu contraseña. Guárdala en papel o en un gestor de contraseñas, nunca en el ordenador.',
        tags: ['frase', '12 palabras', 'recuperación'],
      },
      {
        id: 's5',
        question: '¿Qué es el período de gracia del TOTP?',
        answer:
          'Es el tiempo que puede pasar entre sesiones sin pedirte el código TOTP. Si abres la app dentro de ese período, entra directamente. Configurable desde "Pedir siempre" hasta "No volver a pedir".',
        tags: ['gracia', 'TOTP', 'período', 'sesión'],
      },
      {
        id: 's6',
        question: '¿Qué pasa si pierdo mi frase de recuperación Y mi contraseña?',
        answer:
          'Si pierdes ambas, no podrás acceder a la app. No existe ningún método de recuperación adicional. Por eso es fundamental guardar la frase en un lugar seguro y descargar el fichero de recuperación.',
        tags: ['perdido', 'recuperación', 'acceso'],
      },
    ],
  },
  {
    id: 'backup',
    emoji: '💾',
    label: 'Copias de seguridad',
    color: '#8b5cf6',
    items: [
      {
        id: 'b1',
        question: '¿Con qué frecuencia debo hacer copias de seguridad?',
        answer:
          'Recomendamos hacer una copia descargada (fichero .json) al menos una vez a la semana si usas la app regularmente. Guárdala en un lugar seguro como Google Drive, Dropbox o un USB. La app también hace copias automáticas en el historial interno.',
        tags: ['frecuencia', 'backup', 'recomendación'],
      },
      {
        id: 'b2',
        question: '¿Cuál es la diferencia entre el historial interno y el fichero descargado?',
        answer:
          'El historial interno se guarda en el navegador (hasta 50 copias). El fichero descargado es una copia física en tu ordenador. Si limpias el navegador, cambias de dispositivo o el disco falla, pierdes el historial pero conservas los ficheros descargados.',
        tags: ['historial', 'fichero', 'diferencia'],
      },
      {
        id: 'b3',
        question: '¿Cómo restauro una copia de seguridad?',
        answer:
          'Desde el panel de copias de seguridad (icono 📦 en el header): para restaurar del historial, haz clic en "🔄 Restaurar" en la copia que quieras. Para restaurar desde un fichero .json, usa "📂 Importar copia desde fichero".',
        tags: ['restaurar', 'recuperar', 'backup'],
      },
      {
        id: 'b4',
        question: '¿Puedo restaurar una copia en un dispositivo diferente?',
        answer:
          'Sí. Descarga una copia (.json) en el dispositivo original. Abre la app en el nuevo dispositivo, ve al panel de copias de seguridad y usa "📂 Importar copia desde fichero".',
        tags: ['dispositivo', 'migrar', 'transferir'],
      },
      {
        id: 'b5',
        question: '¿La restauración borra mis datos actuales?',
        answer:
          'Sí. Al restaurar, los datos actuales son reemplazados por los de la copia. La app guarda automáticamente una copia del estado actual antes de restaurar, por si necesitas volver atrás.',
        tags: ['restaurar', 'borrar', 'reemplazar'],
      },
    ],
  },
  {
    id: 'import',
    emoji: '🏦',
    label: 'Importación bancaria',
    color: '#0891b2',
    items: [
      {
        id: 'i1',
        question: '¿Qué bancos están soportados para importar CSV?',
        answer:
          'La app incluye formatos predefinidos para: Santander, BBVA, ING, CaixaBank, Revolut y Bankinter. Si tu banco no está en la lista, puedes crear un formato personalizado indicando el separador, formato de fecha y orden de columnas.',
        tags: ['bancos', 'soportados', 'CSV', 'compatibles'],
      },
      {
        id: 'i2',
        question: '¿Cómo descargo el extracto CSV de mi banco?',
        answer:
          'Accede a tu banca online → Movimientos / Extractos → Exportar / Descargar → Selecciona formato CSV. La ubicación exacta varía por banco. Para Revolut: Perfil → Extractos → CSV. Para Bankinter: el fichero es .xlsx, ábrelo en Excel y guárdalo como CSV.',
        tags: ['descargar', 'extracto', 'CSV', 'banco'],
      },
      {
        id: 'i3',
        question: '¿Cómo funciona la detección de duplicados en la importación?',
        answer:
          'La app compara cada movimiento del CSV con los ya existentes en base a: mismo importe, mismo tipo (ingreso/gasto) y fecha de valor similar (±2 días). Los detectados como posibles duplicados se marcan en ámbar. Puedes importarlos igualmente si no son duplicados.',
        tags: ['duplicados', 'detección', 'importación'],
      },
      {
        id: 'i4',
        question: '¿Puedo ajustar las filas de cabecera a saltar?',
        answer:
          'Sí. En el paso 2 de la importación, puedes ajustar el número de filas de cabecera usando los botones − y +. La línea marcada en verde es donde empieza la lectura de datos.',
        tags: ['cabecera', 'filas', 'ajuste', 'CSV'],
      },
    ],
  },
];

// ─── Atajos de teclado ────────────────────────────────────────────────────────

export const SHORTCUTS: { category: string; items: Shortcut[] }[] = [
  {
    category: '📋 Generales',
    items: [
      { keys: ['Esc'], description: 'Cerrar modal o panel activo' },
      { keys: ['Enter'], description: 'Confirmar acción / Desbloquear app' },
    ],
  },
  {
    category: '🔐 Seguridad',
    items: [
      { keys: ['Enter'], description: 'Desbloquear app (en pantalla de bloqueo)' },
    ],
  },
  {
    category: '🖨️ Impresión',
    items: [
      { keys: ['Ctrl', 'P'], description: 'Imprimir / Guardar como PDF la sección actual' },
    ],
  },
  {
    category: '🌐 Navegación',
    items: [
      { keys: ['Tab'], description: 'Moverse entre campos del formulario activo' },
      { keys: ['Shift', 'Tab'], description: 'Retroceder entre campos del formulario' },
    ],
  },
];
