# Fase 7: Detalhe do Pet Report

## Status: Implementado

## Referencia visual: Pencil node `OhZwj` (09 - Pet Report Detail)

## Pre-requisitos ja implementados

- **Types:** `src/types/pet-report.ts` (PetReport, PetReportStatus), `src/types/pet.ts` (Pet, PetPhoto, PetSpecies, PetSize, PetSex), `src/types/characteristic.ts` (Characteristic, CharacteristicCategory), `src/types/breed.ts` (Breed)
- **API:** `petReportsApi.getDetail(id)` — GET `/pet-reports/{id}/detail` [ja criado]
- **Enums:** speciesLabel, sizeLabel, sexLabel, reportStatusLabel, characteristicCategoryLabel [ja existem]
- **Utils:** `formatDate`, `formatDateTime`, `relativeTime` [ja existem]
- **Componentes UI:** Screen, NavHeader, ButtonPrimary, ButtonSecondary, Chip, Skeleton, BottomSheetModal, Toast, Card
- **Placeholder:** `app/pet-report/[id].tsx` ja existe

## Escopo desta fase

**Incluido:**
- Tela de detalhe completa (somente leitura)
- Carrossel de fotos com page dots
- Info do pet (nome, badges especie/porte/sexo, raca, cor)
- Caracteristicas agrupadas por categoria
- Secao "Detalhes do report" (status badge, data, local, descricao, mini mapa)
- Card de observacoes do dono (notes)
- Botao "Vi esse pet!" no bottom bar (outros usuarios)

**Excluido (fases futuras):**
- Acoes do dono (marcar encontrado, cancelar) → Fase 9
- Banner de matches (so faz sentido para o dono) → Fase 9
- Lista de avistamentos → Fase 9
- Navegacao para matches → Fase 10
- Determinacao dono vs outro usuario (requer `userId` no PetReport) → Fase 9

---

## Layout da Tela (conforme Pencil `OhZwj`)

A tela e scroll vertical com layout vertical. Altura total no design: 1425px (mais que uma tela — scroll).

### Estrutura geral

```
StatusBar
NavHeader ("Detalhes do Report", back arrow)
ScrollView:
  photoArea (280h, imagem fullwidth, page dots)
  petInfoCard (surface, rounded top 16, padding 16, gap 12)
    - Nome (bold 22)
    - badgeRow: [specBadge] [sizeBadge] [sexBadge]
    - breedLine (raca, secondary 14)
    - breedDesc (descricao raca, tertiary 13, italic)
    - colorBadge (chip roxo claro)
  charSection (surface, padding 12/16, gap 12)
    - Divider (border 1px)
    - Titulo "Caracteristicas" (bold 16)
    - catRow1: icone target + "Marcas" → pills
    - catRow2: icone paintbrush + "Pelagem" → pills
    - catRow3: icone heart + "Comportamento" → pills
    - catRow4: icone tag + "Identificacao" → pills
  spacer (8h)
  reportCard (surface, rounded 16, padding 16, gap 12)
    - reportHeader: "Detalhes do report" (bold 16) + statusBadge
    - dateRow: icone calendar + data relevante conforme status + relativa
    - locRow: icone map-pin + addressHint
    - descText (descricao, secondary 14, lineHeight 1.4)
    - miniMap (140h, rounded 12, MapView read-only, sem interacao)
  spacer (8h)
  notesCard (bg #FFA0010D, borda esquerda 3px #FFA001, rounded 12, padding 16, gap 8)
    - notesTitleRow: icone info (secondary) + "Observacoes do dono" (bold 16)
    - notesText (secondary 14, lineHeight 1.4)
  spacer (16h)
BottomBar:
  Botao "Vi esse pet!" (primary, full width, h52)
```

### Detalhes dos badges

**specBadge:** bg `#AD4FFF1A`, texto `$primary`, icone dog/cat (`$primary`, 14), rounded 20, padding 4/10, gap 4
**sizeBadge:** bg `$background`, texto `$text-secondary`, rounded 20, padding 4/10
**sexBadge:** bg `$background`, texto `$text-secondary`, icone arrow-up, rounded 20, padding 4/10, gap 4
**colorBadge:** bg `#AD4FFF1A`, texto `$primary`, rounded 20, padding 4/10
**statusBadge (LOST):** bg `#E5393520`, texto `$error`, rounded 20, padding 4/10

### Detalhes das characteristics pills

Cada categoria renderiza:
- Label row: icone (14, `$text-secondary`) + nome categoria (medium 14, `$text-secondary`), gap 6
- Pills row: cada pill = bg `$background`, rounded 20, padding 4/8, texto (13, `$text-primary`), gap 8

Icones por categoria:
- MARKING → `target`
- COAT → `paintbrush`
- BEHAVIOR → `heart`
- IDENTIFICATION → `tag`

Se uma categoria nao tiver caracteristicas, omitir a row inteira.

### Page dots (carrossel)

- Dot ativo: `$primary`, 8x8
- Dot inativo: `$border`, 6x6
- Gap 8, posicao absoluta centralizada na base da foto

---

## Arquivos a criar/modificar

### 1. Query Keys — `src/constants/query-keys.ts`

- Adicionar `petReports.detail(id)` → `["petReports", "detail", id]`

### 2. Hook — `src/hooks/usePetReports.ts`

- Criar `usePetReportDetail(id: number | null)` usando `useQuery`:
  - `queryKey`: `queryKeys.petReports.detail(id!)`
  - `queryFn`: `petReportsApi.getDetail(id!)`
  - `enabled`: `id !== null` — nao busca enquanto id for invalido
  - `select`: `(r) => r.data.data` (extrair do envelope ResourceResponse)

### 3. Mapeamento de icones por categoria — `src/constants/characteristics.ts` (novo)

- Criar `characteristicCategoryIcon: Record<CharacteristicCategory, string>` com os nomes de icone lucide (`target`, `paintbrush`, `heart`, `tag`)
- Separado de `enums.ts` porque e mapeamento de iconografia, nao label de UI

### 4. Componentes novos

#### `src/components/pet-report/PhotoCarousel.tsx`

Carrossel horizontal de fotos do pet:
- `FlatList` horizontal com `pagingEnabled`, `showsHorizontalScrollIndicator={false}`
- Largura de cada item = largura da tela (usar `useWindowDimensions`)
- Cada foto: `Image` fullwidth, height 280
- Indice atual derivado por `onMomentumScrollEnd` (calcular pelo offset)
- `keyExtractor` estavel (usar `photo.id`) — evita comportamento estranho com dots e re-render
- Fallback (sem fotos): fundo `$border/30` com icone dog/cat centralizado, sem dots
- Page dots no bottom: dot ativo (`$primary`, 8x8), inativo (`$border`, 6x6)
- Dots so aparecem se `photos.length > 1`
- Props: `photos: PetPhoto[]`, `species: PetSpecies`

#### `src/components/pet-report/PetInfoSection.tsx`

Card com info basica do pet:
- Nome (bold 22)
- Badge row: especie (com icone), porte, sexo (com icone)
- Raca (breed name, secondary 14) — se tiver secondaryBreed: "Raca1 • Mix com Raca2"
- Descricao de raca (breedDescription, tertiary 13, italic) — se existir
- Color badge (primaryColor, chip roxo claro) — se existir
- Props: `pet: Pet`

#### `src/components/pet-report/CharacteristicsSection.tsx`

Secao de caracteristicas agrupadas por categoria:
- Divider no topo
- Titulo "Caracteristicas" (bold 16)
- Para cada categoria que tenha items: icone + label + pills
- Pills: bg `$background`, rounded 20, texto 13
- Se nenhuma caracteristica, omitir secao inteira
- Props: `characteristics: Characteristic[]`

#### `src/components/pet-report/ReportInfoSection.tsx`

Card "Detalhes do report" (titulo neutro — funciona para LOST, FOUND e CANCELLED):
- Header: titulo + status badge (cor depende do status — LOST: error, FOUND: success, CANCELLED: tertiary)
- Data conforme status — sem label textual, apenas icone calendar + data + relativa:
  - LOST → `lostAt`
  - FOUND → `foundAt` (fallback `lostAt`)
  - CANCELLED → `lostAt`
  - Formato: `formatDate(date, "dd 'de' MMMM 'de' yyyy, HH:mm")` na linha principal + `relativeTime(date)` abaixo (tertiary 13)
- Local: icone map-pin + addressHint (se existir)
- Descricao: description (se existir)
- Mini mapa: `MapView` read-only (140h, rounded 12) com um marker na localizacao
  - **Sem interacao:** `scrollEnabled={false}`, `zoomEnabled={false}`, `rotateEnabled={false}`, `pitchEnabled={false}`, `pointerEvents="none"`
  - Evita roubo de gesto do ScrollView pai
- Props: `report: PetReport`

#### `src/components/pet-report/NotesCard.tsx`

Card de observacoes do dono:
- Fundo `#FFA0010D`, borda esquerda 3px `#FFA001`, rounded 12
- Icone info (secondary) + titulo "Observacoes do dono" (bold 16)
- Texto notes (secondary 14, lineHeight 1.4)
- Componente recebe `notes: string` e renderiza incondicionalmente
- A tela e responsavel por renderizar o componente apenas se `pet.notes` existir
- Props: `notes: string`

### 5. Tela — `app/pet-report/[id].tsx`

Reimplementar com:
- `NavHeader` com titulo "Detalhes do Report" e back
- `ScrollView` com todo o conteudo
  - `contentContainerStyle` com `paddingBottom` suficiente para nao ficar escondido atras do bottom bar
- Parsear `id` da rota (`useLocalSearchParams`): converter para number, se invalido passar `null`
- `usePetReportDetail(parsedId)` — hook aceita `null` e nao busca nesse caso
- Loading: `ActivityIndicator` centralizado
- Error: empty state com botao retry que chama `refetch()` do hook
- Bottom bar fixo com safe area bottom (`useSafeAreaInsets`)
  - Botao "Vi esse pet!" (primary, full width, h52, `active:opacity-80`)
  - Tap → navega para `/sighting/new?reportId={id}` (Fase 9, por ora so navega)
  - **Simplificacao temporaria:** botao visivel para todos os usuarios. Distinção dono vs outros sera implementada na Fase 9 quando `userId` estiver disponivel no PetReport

---

## Cores do status badge

| Status | Texto | Fundo |
|--------|-------|-------|
| LOST | `$error` (#E53935) | `#E5393520` |
| FOUND | `$success` (#43A047) | `#43A04720` |
| CANCELLED | `$text-tertiary` | `$background` |

---

## Decisoes

| Cenario | Comportamento |
|---------|---------------|
| Pet sem fotos | Fallback com icone especie em fundo cinza, sem dots |
| Pet sem caracteristicas | Omitir secao inteira |
| Pet sem notes | Omitir card de observacoes |
| Pet sem breed | Omitir linha de raca |
| Pet sem breedDescription | Omitir linha descricao raca |
| Pet sem primaryColor | Omitir color badge |
| Report sem description | Omitir texto descricao |
| Report sem addressHint | Omitir linha de local |
| Match banner | Movido para Fase 9 — so faz sentido para o dono do report |
| Status LOST | Data = `lostAt` |
| Status FOUND | Data = `foundAt` (fallback para `lostAt` se `foundAt` vier null) |
| Status CANCELLED | Data = `lostAt` |
| `id` invalido da rota | Mostrar estado de erro, nao chamar hook |
| Mini mapa dentro de ScrollView | `scrollEnabled={false}`, `zoomEnabled={false}`, `pointerEvents="none"` — sem interacao |
| Bottom bar | Respeitar safe area bottom com `useSafeAreaInsets` |
| Acoes do dono vs outros | **Simplificacao temporaria:** "Vi esse pet!" visivel para todos. Dono/outros na Fase 9. Em reports FOUND o botao pode soar estranho — aceito como trade-off temporario |

---

## Ordem de implementacao

1. Query keys — adicionar `detail`
2. Hook `usePetReportDetail`
3. Constante `characteristicCategoryIcon` em `src/constants/characteristics.ts`
4. Componente `PhotoCarousel`
5. Componente `PetInfoSection`
6. Componente `CharacteristicsSection`
7. Componente `ReportInfoSection`
8. Componente `NotesCard`
9. Reimplementar `app/pet-report/[id].tsx`

---

## Verificacao

- [ ] NavHeader com back e titulo "Detalhes do Report"
- [ ] Carrossel de fotos renderiza com page dots
- [ ] Fallback de foto quando pet sem fotos
- [ ] Nome do pet exibido (bold 22)
- [ ] Badges especie/porte/sexo com icones e cores corretas
- [ ] Raca e descricao de raca exibidas (se existirem)
- [ ] Color badge (se existir)
- [ ] Caracteristicas agrupadas por categoria com icones corretos
- [ ] Categorias vazias omitidas
- [ ] Status badge com cor correta (LOST/FOUND/CANCELLED)
- [ ] Data formatada + relativa
- [ ] Local exibido (se existir)
- [ ] Descricao (se existir)
- [ ] Mini mapa read-only com marker (sem interacao, nao rouba gesto do scroll)
- [ ] Card de observacoes (se notes existir)
- [ ] Match banner ausente nesta fase (Fase 9)
- [ ] Botao "Vi esse pet!" no bottom bar com safe area
- [ ] Data conforme status (LOST→lostAt, FOUND→foundAt, CANCELLED→lostAt)
- [ ] Carrossel: pagingEnabled, dots so com >1 foto, indice correto
- [ ] Loading state
- [ ] Error state com retry
- [ ] ScrollView com padding bottom suficiente (nao esconde conteudo atras do bottom bar)
- [ ] `npx tsc --noEmit` passa
- [ ] `npm run lint` passa
