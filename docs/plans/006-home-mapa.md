# Fase 6: Home / Mapa

## Status: Em andamento

## Referencia visual: Pencil node `q4jXO` (05 - Home Map)

## Pre-requisitos ja implementados

- **Types:** `src/types/pet-report.ts` (PetReport, PetReportFilters, PetReportStatus)
- **Types:** `src/types/pet.ts` (Pet, PetSpecies, PetSize)
- **Enums:** `src/constants/enums.ts` (speciesLabel, sizeLabel, reportStatusLabel)
- **Query keys:** `src/constants/query-keys.ts` (petReports.map ja adicionado)
- **Componentes UI:** Screen, NavHeader, ButtonPrimary, ButtonSecondary, Chip, EmptyState, Skeleton, Toast, Modal
- **Placeholder:** `app/(tabs)/index.tsx` ja existe

## Escopo desta fase

**Incluido:**
- Mapa fullscreen com marcadores (dog/cat/cluster)
- Botao "Filtros" que abre bottom sheet modal com chips Especie/Porte + Limpar/Aplicar
- Botao "Avistei um pet" no topo direito
- FAB "+" no canto inferior direito
- Preview card ao tocar marcador
- Permissao e geolocalizacao
- **Tab bar com 4 tabs: Home, Pets, Alertas, Config** (mudanca do layout de tabs)

**Excluido (fases futuras):**
- Badge de notificacoes → Fase 12
- CenterPin (selecao de local) → Fase 9
- useCreateReport, useCancelReport, useMarkFound → Fases 8-9
- Detalhe do pet report → Fase 7

## Layout da Tela (conforme Pencil)

### Topo (sobre o mapa, abaixo da status bar)
- Esquerda: botao "Filtros" (pill branca com icone filter + texto). Quando filtro ativo, mostra dot roxo (Component/FilterButtonActive `Xqsx1`)
- Direita: botao "Avistei um pet" (pill branca com icone pata laranja + texto)

### Mapa Fullscreen
- Provider: Google Maps via react-native-maps (API key Android; iOS Apple Maps padrao)
- Localizacao inicial: GPS do dispositivo
- Fallback: coordenadas em `src/constants/defaults.ts` (decisao de produto pendente)
- Debounce 500ms ao mover mapa antes de chamar API
- Raio: `latitudeDelta` base (1° ≈ 111 km), clamp 1-100 km. Aproximacao de UX
- Ponto azul de localizacao do usuario (showsUserLocation)

### Marcadores (conforme Pencil)
- **Dog** (`R4WZn`): pin roxo (primary) com icone pata branca + ponteira triangular embaixo
- **Cat** (`CXeRY`): pin laranja (secondary) com icone pata branca + ponteira triangular
- **Dog selecionado** (`zL3rN`): versao maior do pin dog com destaque
- **Cluster** (`CtwaN`): circulo roxo com numero (ex: "3+")
- Diferenciar por cor E por icone (acessibilidade)

### Bottom Sheet — Filtros (Component/FilterModal `R5Um3`)
- Handle no topo (barra cinza)
- Titulo "Filtros" + botao X para fechar
- Secao "Especie": chips Todos / Cachorro / Gato
- Secao "Porte": chips Todos / Pequeno / Medio / Grande
- "Todos" = `undefined` no filtro
- Botoes no rodape: "Limpar" (secondary/outline) + "Aplicar" (primary)
- Mudanca de filtro limpa marcador selecionado se saiu da lista

### PetPreviewCard (Component/PetPreviewCard `YYUy5`)
- Card branco com sombra, arredondado
- Esquerda: foto do pet (80x80, rounded), fallback cinza se sem foto
- Centro:
  - Nome do pet (semibold)
  - Especie · Porte (secondary text)
  - Chip com cor do pet (ex: "Caramelo") — chip roxo/violet
  - Icone pin + endereco (se houver)
  - Icone relogio + "Perdido ha X dias"
- Direita: seta ">" (chevron)
- `active:opacity-80` no toque
- Tap → navega para `/pet-report/[id]` via `router.push({ pathname: '/pet-report/[id]', params: { id } })`

### EmptyState (Component/EmptyState `VfF1h`)
- Icone lupa em circulo roxo claro
- Titulo: "Nenhum pet perdido por aqui"
- Descricao: "Tente ampliar a area de busca ou mudar os filtros"
- Link: "Limpar filtros" (TextLink, chama resetFilters)

### FAB (Component/FAB `p347k`)
- Circulo 56x56 roxo (primary) com icone "+" branco
- Posicao: canto inferior direito, acima da tab bar
- `active:opacity-80`
- Tap → navega para `/report-lost/select-pet`

### Tab Bar (Component/TabBar `5c7tg`)
- **4 tabs:** Home, Pets, Alertas, Config
- Icones: map-pin, paw-print, bell, settings
- Cor ativa: colors.primary.DEFAULT
- Cor inativa: colors.text.tertiary

## Componentes a criar/atualizar

### Novos
- `src/components/map/FilterButton.tsx` — pill "Filtros" com estado ativo (dot)
- `src/components/map/SightingButton.tsx` — pill "Avistei um pet" (secondary/laranja)
- `src/components/map/FilterModal.tsx` — bottom sheet com chips + Limpar/Aplicar
- `src/components/map/PetMarker.tsx` — pin com ponteira (dog/cat/selected)
- `src/components/map/MarkerCluster.tsx` — circulo com contagem
- `src/components/map/PetPreviewCard.tsx` — card conforme Pencil
- `src/components/map/FAB.tsx` — botao flutuante circular

### Atualizar
- `app/(tabs)/_layout.tsx` — 4 tabs (Home, Pets, Alertas, Config)
- `app/(tabs)/index.tsx` — reimplementar conforme design

### Stubs necessarios (novas tabs)
- `app/(tabs)/pets.tsx` — placeholder (Fase 8)
- `app/(tabs)/alerts.tsx` — placeholder (Fase 12)

## Infraestrutura

- **API:** `src/services/api/pet-reports.ts` — `listLost(filters)` para GET `/pet-reports/lost`, `getDetail(id)` para GET `/pet-reports/{id}/detail` [ja criado]
- **Hook:** `src/hooks/usePetReports.ts` — `useLostReports(filters)` com lat/lng obrigatorios [ja criado]
- **Hook:** `src/hooks/useLocation.ts` — location, permissionStatus, requestPermission, centerOnUser [ja criado]
- **Store:** `src/stores/map-filters.store.ts` — species, size, setSpecies, setSize, resetFilters [ja criado]
- **Query keys:** petReports.map(filters) [ja adicionado]
- **Constants:** `src/constants/defaults.ts` [ja criado]
- **Deps:** react-native-maps, expo-location [ja instalados]

## Permissao de Localizacao

- Permissao negada pelo usuario → fallback + Toast informativo nao bloqueante
- Erro tecnico ao obter localizacao → fallback silencioso
- Nao bloquear mapa em nenhum caso

## Tratamento de erros

- **Loading inicial** → indicador de loading (spinner sobre o mapa)
- **Sem resultados** → EmptyState "Nenhum pet perdido por aqui" + "Limpar filtros"
- **Erro na query principal** → EmptyState com erro + "Tentar novamente" (refetch)
- **Erros secundarios** → Toast via useToastStore

## Verificacao

- [ ] Tab bar renderiza 4 tabs com icones e cores corretas
- [ ] Mapa carrega com localizacao do dispositivo (ou fallback)
- [ ] Marcadores dog aparecem como pin roxo com pata
- [ ] Marcadores cat aparecem como pin laranja com pata
- [ ] Marcador selecionado fica maior/destacado
- [ ] Cluster mostra numero de reports agrupados
- [ ] Botao "Filtros" abre bottom sheet modal
- [ ] Filtros com chips funcionam (Todos = undefined)
- [ ] Botao "Aplicar" fecha modal e aplica filtros
- [ ] Botao "Limpar" reseta filtros
- [ ] Dot roxo aparece no botao quando filtro ativo
- [ ] Botao "Avistei um pet" navega para /sighting/new
- [ ] Preview card aparece ao tocar marcador com dados corretos
- [ ] Preview card mostra foto, nome, especie, porte, cor, endereco, tempo perdido
- [ ] Navegacao para detalhe funciona com id via route params
- [ ] FAB navega para /report-lost/select-pet
- [ ] EmptyState mostra quando sem resultados com link "Limpar filtros"
- [ ] Debounce 500ms ao mover mapa
- [ ] Feedback visual (active:opacity-80) em todos os interativos
