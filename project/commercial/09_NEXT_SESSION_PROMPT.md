# Prompt de arranque — Sesión 7 (comercial)

> Esta sesión puede empezar por **A) Naming** o por **B) Desarrollos pendientes (técnico)**.
> Pregunta al founder al inicio por dónde quiere arrancar y salta al carril que toque.

---

## Contexto rápido (leer siempre primero)
- Naming: Bloque 2 en Fase C, con **dos carriles vivos**:
  - **Carril latino** (Fase B): 6 finalistas SÍ sin verificar dominio → AEVITAS, NORTIA, STABILA, AEQUORA, AEQUILA, TENUIA.
  - **Carril "-iq"** (sesión 6, 08/06): 3 finalistas con `.com` libre + **EUIPO limpia** → **ORIZIQ, NORZIQ, NESTLYQ** (orden recomendado ORIZIQ > NORZIQ > NESTLYQ).
- Ningún nombre decidido. Ningún `.com` reservado.
- Estado técnico (CLAUDE.md): beta A6✅(diseño)·A2✅·A4✅·A1 decidido sin implementar (vite-plugin-pwa)·A3/A5 pendientes · 965 tests.

---

## CARRIL A — Naming

### Pregunta abierta crítica (resolver PRIMERO)
La dirección "-iq" (sesión 6) **choca con la Fase A**: P3 (longitud 8-10 → estos 6-7), P2 (raíz latina → invento puro), anti-criterio D (Z/X raros) y G (sufijos trendy). ¿La dirección "-iq" **sustituye** el carril latino, **convive** como carril paralelo, o se **descarta** por incoherencia con el brief? Decisión consciente del founder antes de seguir.

### Objetivos (por orden)
1. Resolver la pregunta del brief (¿-iq sí/no/convive con latino?).
2. Reacción visceral del founder a los 3 finalistas "-iq" (ORIZIQ, NORZIQ, NESTLYQ) y, si procede, a los 6 latinos.
3. Si sobrevive un favorito claro: decidir si se **reserva `.com`** ya (decisión de dinero) y/o se paga **clearance de confusión a agente de marcas** (€, solo para el elegido).
4. Verificar dominios de los 6 finalistas latinos si se reactiva ese carril.

### Caveat técnico vigente
TMview "Contains" confirma 0 marcas idénticas/contenidas, pero **no** evalúa riesgo de confusión fonético (NORZIQ↔NORQAIN relojes, NESTLYQ↔Nestlé). Eso es trabajo de agente de marcas.

---

## CARRIL B — Desarrollos pendientes (técnico)

Si el founder quiere avanzar producto en vez de naming, **leer `project/development/07_NEXT_SESSION_PROMPT.md`** (es el prompt del carril técnico, sesión 47). Foco probable:
- **A1 — implementar `vite-plugin-pwa` (Workbox)** (decidido sesión 46, sin codificar; arregla la caché del Service Worker).
- **A3 / A5** del corte beta (pendientes).
- Sacar `Recuperación Pasword.txt` de la raíz (D1).

---

## Reglas activas
- Calidad visceral: si hay fatiga de decisión en naming, parar.
- Búsqueda de dominio integrada durante la evaluación.
- Regla §14: tracking se escribe AL CERRAR la sesión.

## Archivos de referencia
- `03_NAMING.md` — briefing P1-P5 + carril latino + carril "-iq" (sección 08/06/2026)
- `07_SESSION_LOG.md` — última entrada: sesión 6
- `02_DECISIONS_LOG.md` — decisiones cerradas
- `project/development/07_NEXT_SESSION_PROMPT.md` — carril técnico (si se elige B)
