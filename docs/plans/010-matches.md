# Fase 10: Matches

Referencia: `docs/layout/007-matches.md` + `docs/layout/010-match-scoring-indicators.md` + layouts no Pencil

## Telas

### Lista de Matches (`app/matches/[reportId].tsx`)
- Lista de matches para um report (max 20, sem paginacao)
- Cada card mostra: foto do pet matched, score, distancia, status
- Filtro por status: Todos / Pendente / Confirmado / Descartado
- API: GET `/pet-reports/{reportId}/matches`

### Detalhe/Comparacao (`app/matches/[reportId]/[matchId].tsx`)
- Fotos lado a lado: pet perdido vs pet matched
- Tabela de comparacao com 3 estados visuais:
  - **Match** (verde) — atributo igual
  - **Parcial** (amarelo) — atributo similar
  - **Diferente** (vermelho) — atributo diferente
- Atributos comparados: especie, porte, sexo, raca, cor, caracteristicas
- Score em destaque (badge grande)
- Distancia formatada (metros/km)
- Acoes:
  - "Confirmar match" → PATCH `/pet-reports/{reportId}/matches/{matchId}/confirm` (report → FOUND)
  - "Descartar" → PATCH `/pet-reports/{reportId}/matches/{matchId}/dismiss`
  - Confirmacao via modal

## Componentes
- `src/components/match/MatchCard.tsx` — card na lista
- `src/components/match/ComparisonTable.tsx` — tabela 3 estados
- `src/components/match/ScoreBadge.tsx` — badge de score circular

## Infraestrutura a criar nesta fase

Estes itens foram adiados da Fase 2 para nascer junto com a feature:

- **Modulo de API:** `src/services/api/matches.ts` — listar matches, confirmar, descartar
- **Hook:** `src/hooks/useMatches.ts` — useMatches, useConfirmMatch, useDismissMatch

## Verificacao

- Lista carrega matches corretamente
- Comparacao visual funciona com 3 estados
- Confirmar match muda status do report para FOUND
- Descartar match funciona
