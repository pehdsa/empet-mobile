# Fase 6b: Home — Modo Lista + Breaking Changes API

## Status: Implementado

## Referencia visual: Pencil nodes `q4jXO` (Home Map) e `jJmbh` (Home Lista)

## Contexto

O backend separou o endpoint `/pet-reports/lost` em dois:

| Rota | Modo | Descricao |
|------|------|-----------|
| `GET /pet-reports/lost` | Lista (infinite scroll) | Paginado, sem `radius_km`, com `distanceMeters` |
| `GET /pet-reports/lost/map` | Mapa | Nova rota — comportamento antigo do `/lost` |

A home ganha um **toggle Mapa/Lista** no toolbar (conforme design Pencil) que alterna entre os dois modos de visualizacao.

---

## Breaking changes da API

| O que mudou | Antes | Agora |
|-------------|-------|-------|
| `GET /pet-reports/lost` | Sem paginacao, com `radius_km` | Paginado, sem `radius_km`, com `distanceMeters` |
| `GET /pet-reports/lost/map` | Nao existia | Nova rota (comportamento antigo do `/lost`) |

---

## Arquivos a modificar

### 1. Types — `src/types/pet-report.ts`

- Adicionar `distanceMeters?: number` ao `PetReport`
- Renomear `LostReportFilters` → `LostReportMapFilters` (latitude, longitude, radius_km?, species?, size?)
- Criar `LostReportListFilters` (latitude, longitude, species?, size?) — sem `radius_km`, sem `page` (gerenciado pelo `useInfiniteQuery`)

### 2. API — `src/services/api/pet-reports.ts`

- Renomear `listLost()` → `listLostMap()` apontando para `/pet-reports/lost/map` com `LostReportMapFilters`
- Criar `listLost(filters, page)` para `GET /pet-reports/lost` retornando `PaginatedResponse<PetReport>` com `LostReportListFilters`

### 3. Query Keys — `src/constants/query-keys.ts`

- Manter `petReports.map(filters)` (atualizar tipo para `LostReportMapFilters`) — deve incluir latitude, longitude, radius_km, species, size
- Adicionar `petReports.list(filters)` para o modo lista — deve incluir latitude, longitude, species, size
- **Importante:** ambas as keys devem incluir todos os parametros que alteram o resultado, para que mudanca de filtro invalide cache corretamente e resete a lista para a primeira pagina

### 4. Hooks — `src/hooks/usePetReports.ts`

- Renomear `useLostReports()` → `useLostReportsMap()` usando `listLostMap()` + `LostReportMapFilters`
- Criar `useLostReportsList(filters)` usando `useInfiniteQuery`:
  - `getNextPageParam`: baseado em `meta.current_page < meta.last_page`
  - Retorna o objeto do `useInfiniteQuery` intacto + um campo derivado `items` (pages achatadas) para conveniencia do FlatList
  - Mudanca de filtros reseta automaticamente (query key inclui filtros)

### 5. Utils — `src/utils/format-distance.ts` (novo)

- `formatDistance(meters: number): string`
  - `1234.56` → `"1,2 km"`
  - `500` → `"500 m"`

### 6. Store — `src/stores/home-pet-reports.store.ts` (renomear de `map-filters.store.ts`)

Renomear porque agora nao e mais so "filtros do mapa" — e o estado da Home em dois modos.

```ts
interface HomePetReportsState {
  viewMode: 'map' | 'list';
  species: PetSpecies | undefined;
  size: PetSize | undefined;
  setViewMode: (mode: 'map' | 'list') => void;
  setSpecies: (species: PetSpecies | undefined) => void;
  setSize: (size: PetSize | undefined) => void;
  resetFilters: () => void;
}
```

- `setViewMode` nao limpa filtros (compartilhados entre modos)
- Filtros de species/size sao compartilhados entre os dois modos
- Atualizar imports em todos os consumidores (`useMapFiltersStore` → `useHomePetReportsStore`)

### 7. Componentes novos

Componentes de mapa ficam em `src/components/map/` (FilterButton, FilterModal, PetMarker, etc.).
Componentes da home que nao sao especificos do mapa ficam em `src/components/home/`.

#### `src/components/home/ViewToggle.tsx`

Toggle pill com 2 botoes (icone map / icone list):
- Ativo: bg `primary`, icon branco (`$text-inverse`)
- Inativo: bg transparente, icon `$text-secondary`
- Container: pill branca (`#FFFFFFEE`), cornerRadius 22, borda `$border`, sombra
- Props: `mode: 'map' | 'list'`, `onToggle(mode)`

Conforme design:
- Modo mapa: MapTab ativo, ListTab inativo
- Modo lista: ListTab ativo, MapTab inativo

#### `src/components/home/PetListCard.tsx`

Card para a lista (conforme design node `YD4VD`):
- bg `#FFFFFFEE`, cornerRadius 16, shadow, padding 12, gap 12
- Esquerda: foto 80x80, rounded 12
- Centro (vertical, gap 4):
  - Nome do pet (Montserrat bold 16, `$text-primary`)
  - Especie + Porte (Montserrat 13, `$text-secondary`)
  - Badge de cor (chip roxo claro `#AD4FFF1A`, texto `$primary`)
  - Icone pin + distancia formatada (`formatDistance(distanceMeters)`) — **so renderiza se `distanceMeters` existir**
  - Icone relogio + "Perdido ha X dias"
- Direita: chevron-right (`$text-tertiary`)
- `active:opacity-80` no toque
- Tap → navega para `/pet-report/[id]`
- **Se `distanceMeters` for `undefined`, omitir a linha de distancia (nao inventar "0 m")**
- Nota: no contexto da lista, `distanceMeters` deveria sempre vir do backend. Se vier `undefined`, tratar como ausencia visual mas considerar possivel bug de contrato.

#### `src/components/home/PetList.tsx`

FlatList com infinite scroll:
- Renderiza `PetListCard` para cada item
- `onEndReached` → so chamar `fetchNextPage()` se `hasNextPage && !isFetchingNextPage` (proteger contra fetch duplicado)
- Pull-to-refresh → `refetch()` — **deve invalidar/recarregar a query inteira desde a primeira pagina** (nao so a ultima visivel)
- Loading footer (ActivityIndicator quando `isFetchingNextPage`)
- Empty state reutiliza `MapEmptyState`
- Error state proprio (nao compartilhar com mapa)
- Gap 12, padding horizontal 16, padding top 12

#### `src/components/home/LocationPermissionModal.tsx`

Modal centralizado para solicitar permissao de localizacao (conforme Pencil node `9wtsb`):
- Overlay escuro (`#00000066`)
- Card branco centralizado (width 320, cornerRadius 24, shadow, padding 32/24/24/24, gap 16)
- Icone map-pin (28x28, `$primary`) em circulo roxo claro (`#F3E8FF`, 64x64, rounded 32)
- Titulo: "Permitir localizacao" (Montserrat bold 18, center)
- Descricao: "Para mostrar pets perdidos perto de voce, precisamos acessar sua localizacao. Sem permissao, a busca sera baseada na regiao padrao." (Montserrat 13, `$text-secondary`, center, lineHeight 1.5)
- Botao primario: "Permitir localizacao" (full width, h48, bg `$primary`, rounded 24) → `Linking.openSettings()`
- Link: "Continuar sem localizacao" (Montserrat 500 13, `$text-tertiary`) → fecha modal
- Botao X no canto superior direito (32x32, bg `#F0F0F0`, rounded 16, icone x `$text-secondary`) → fecha modal
- Props: `visible: boolean`, `onClose: () => void`, `onAllow: () => void`
- Exibido no maximo **uma vez por sessao do app** quando `permissionStatus === 'denied'`. Controle via state local (`useRef`). Nao persistir em AsyncStorage nesta fase
- Global da Home — aparece independente do modo (mapa ou lista), pois ambos dependem de coordenadas

### 8. Tela Home — `app/(tabs)/index.tsx`

Reestruturar para suportar ambos os modos:

```
<View flex-1>
  {viewMode === 'map' && <MapView ... />}
  {viewMode === 'list' && <PetList ... />}

  {/* Toolbar fixo no topo */}
  <View absolute top toolbar>
    <ViewToggle mode={viewMode} onToggle={handleToggle} />
    <View row gap-8>
      <FilterButton ... />
      <SightingButton ... />
    </View>
  </View>

  {/* Conteudo do mapa (loading, empty, preview) - so no modo mapa */}
  {viewMode === 'map' && (
    <>
      {isLoading && <LoadingIndicator />}
      {empty/error && <MapEmptyState />}
      {selectedReport && <PetPreviewCard />}
    </>
  )}

  {/* Modal permissao localizacao (uma vez por sessao quando denied) */}
  <LocationPermissionModal visible={showLocModal} onClose={...} onAllow={...} />

  <FilterModal ... />
</View>
```

- Modo mapa: usa `useLostReportsMap()` com endpoint `/pet-reports/lost/map` + `radius_km`
- Modo lista: usa `useLostReportsList()` com endpoint `/pet-reports/lost` + paginacao
  - Coordenadas vem do `useLocation` (posicao do usuario ou fallback), nao do mapa
- **Ao trocar `viewMode`, limpar `selectedReport`** (evita preview fantasma ao voltar pro mapa)
- **Loading, empty e error sao independentes** para cada modo (queries diferentes)

### 9. Fallback de localizacao — `useLocation` + modal

#### Mudancas no `useLocation`

- Expor `isFallbackLocation: boolean` — true quando usando coordenadas padrao (por qualquer motivo: permissao negada, erro tecnico, timeout, GPS indisponivel)
- Logica: se `permissionStatus !== 'granted'` ou se houve erro ao obter coordenadas → fallback

#### Modal de permissao na Home (conforme Pencil `9wtsb`)

- Condicao para exibir: `permissionStatus === 'denied'` e usuario ainda nao dispensou o modal nesta sessao (controle via `useRef`)
- Modal e global da Home — aparece em qualquer modo (mapa ou lista)
- "Permitir localizacao" → `Linking.openSettings()` (ok porque status ja e `denied`, request normal nao funciona mais)
- "Continuar sem localizacao" ou botao X → fecha modal, app continua com fallback
- Se foi erro tecnico (nao denied): nao mostrar modal, usar fallback silenciosamente

---

## Layout do Toolbar (conforme Pencil)

```
┌─────────────────────────────────────────────┐
│ [(map)(list)]        [Filtros] [Pet avistado]│
│  viewToggle              actions             │
└─────────────────────────────────────────────┘
```

- `justify-between`, padding horizontal 16
- Esquerda: ViewToggle
- Direita: row com gap 8 (FilterButton + SightingButton)
- Todos os botoes: pill branca com sombra, height 34, cornerRadius 18

---

## Decisoes de estado

| Cenario | Comportamento |
|---------|---------------|
| Trocar viewMode (mapa↔lista) | Limpar `selectedReport`, manter filtros |
| Trocar para lista | Lista comeca no topo (scroll position = 0) |
| Voltar para mapa | Manter regiao atual do mapa (nao resetar) |
| Mudar filtro (species/size) | Mapa: re-query com novos filtros. Lista: reset para page 1 automaticamente (query key muda) |
| Pull-to-refresh na lista | Recarregar desde a primeira pagina (nao so a ultima visivel) |
| `distanceMeters` undefined | Omitir linha de distancia no card (nao mostrar "0 m") |
| Fallback location (qualquer causa) | `isFallbackLocation = true`, app funciona normalmente com coordenadas padrao |
| Permissao negada especificamente | Modal de permissao (uma vez por sessao) com CTA para settings |
| Erro tecnico de localizacao | Fallback silencioso, sem modal |

---

## Ordem de implementacao

1. Types (`pet-report.ts`) — novos filtros + `distanceMeters`
2. API (`pet-reports.ts`) — separar endpoints
3. Query keys — adicionar `list`
4. Utils (`format-distance.ts`)
5. Hooks (`usePetReports.ts`) — renomear + `useInfiniteQuery` para lista
6. Store — renomear para `home-pet-reports.store.ts` + adicionar `viewMode`
7. `useLocation` — expor `isFallbackLocation`
8. Componente `ViewToggle` (`src/components/home/`)
9. Componente `PetListCard` (`src/components/home/`)
10. Componente `PetList` (`src/components/home/`)
11. Componente `LocationPermissionModal` (`src/components/home/`)
12. Atualizar `app/(tabs)/index.tsx` — integrar tudo

---

## Verificacao

- [ ] Toggle alterna entre mapa e lista visualmente
- [ ] Modo mapa usa endpoint `/pet-reports/lost/map` com `radius_km`
- [ ] Modo lista usa endpoint `/pet-reports/lost` sem `radius_km`, com paginacao
- [ ] Infinite scroll funciona (carregar mais ao chegar no fim)
- [ ] Mudanca de filtro reseta lista para page 1
- [ ] `distanceMeters` formatado nos cards da lista ("1,2 km")
- [ ] `distanceMeters` undefined omite a linha (nao mostra "0 m")
- [ ] Filtros (species/size) compartilhados entre modos
- [ ] Pull-to-refresh na lista
- [ ] Trocar viewMode limpa selectedReport
- [ ] Loading/empty/error independentes por modo
- [ ] Permissao denied mostra modal de localizacao (uma vez por sessao)
- [ ] Modal tem botao "Permitir localizacao" → abre settings
- [ ] "Continuar sem localizacao" fecha modal e usa fallback
- [ ] Erro tecnico usa fallback silencioso (sem modal)
- [ ] Cards da lista conforme design Pencil (foto, nome, especie, cor, distancia, tempo)
- [ ] `npx tsc --noEmit` passa
- [ ] `npm run lint` passa
