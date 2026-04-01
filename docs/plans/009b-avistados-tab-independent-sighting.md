# 009b — Tabs Perdidos/Avistados + Avistamento Independente + Matches Breaking Change

## Contexto

A app passa por uma reestruturação de fluxos:
- Tab "Home" vira "Perdidos", nova tab "Avistados" (feed geográfico de avistamentos independentes)
- Novo fluxo "Reportar avistamento independente" (POST `/pet-sightings`, multipart com fotos, espécie, raça, etc.) — diferente do sighting vinculado a report que já existe
- Phone sharing no avistamento independente ganha CRUD inline (criar/editar/excluir telefone via modais)
- Matches muda contrato: `matchedPet` → `sighting`, novo campo `isSightingDeleted`

---

## Etapa 1 — Types

### 1.1 Novo type `PetSighting` (avistamento independente)

**Arquivo:** `src/types/pet-sighting.ts` (novo)

```ts
export interface PetSightingPhoto {
  id: number;
  url: string;
  position: number;
}

export interface PetSightingBreed {
  id: number;
  name: string;
  species: "DOG" | "CAT";
}

export interface PetSightingUser {
  id: number;
  name: string;
  avatarUrl: string | null;
}

export interface PetSighting {
  id: number;
  userId: number;
  title: string;
  species: "DOG" | "CAT";
  size: "SMALL" | "MEDIUM" | "LARGE" | null;
  sex: "MALE" | "FEMALE" | "UNKNOWN" | null;
  color: string | null;
  breed: PetSightingBreed | null;
  photos: PetSightingPhoto[];
  characteristics: Characteristic[];
  location: { latitude: number; longitude: number };
  addressHint: string | null;
  description: string | null;
  sightedAt: string;
  sharePhone: boolean;
  contactPhone: string | null; // backend sempre envia o campo; null quando não compartilha ou não tem phone
  user: PetSightingUser;
  distanceMeters?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PetSightingMapFilters {
  latitude: number;
  longitude: number;
  radius_km?: number;
  species?: PetSpecies;
  size?: PetSize;
}

// Nota: lista NÃO aceita radius_km — apenas o endpoint /map aceita.
// Ordenação padrão é por distância (mais perto primeiro).
export interface PetSightingListFilters {
  latitude: number;
  longitude: number;
  species?: PetSpecies;
  size?: PetSize;
}
```

### 1.2 Atualizar `src/types/match.ts`

```ts
// Remover matchedPetId, matchedPet
// Adicionar sightingId, sighting, isSightingDeleted
export interface PetMatch {
  id: number;
  reportId: number;
  sightingId: number;
  score: number;
  distanceMeters: number;
  status: MatchStatus;
  sighting: PetSighting;
  isSightingDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
// Nota: se o backend serializar como string, converter no `select` do hook.
```

### 1.3 Renomear `PetSighting` existente → `ReportSighting`

O tipo existente em `src/types/sighting.ts` é o sighting vinculado a report. Renomear interface para `ReportSighting` para evitar conflito de nomes.

Atualizar referências em: `src/services/api/pet-reports.ts`, `src/hooks/usePetReports.ts`.

---

## Etapa 2 — Tabs e Navegação

### 2.1 Renomear tab Home → Perdidos + nova tab Avistados

**Arquivo:** `src/app/(tabs)/_layout.tsx`

- Tab "index" → title: "Perdidos" (manter ícone MapPin)
- Nova tab "sightings" → title: "Avistados", ícone: `Eye` (lucide)
- Ordem: Perdidos, Avistados, Pets, Alertas, Config

### 2.2 Nova tela `src/app/(tabs)/sightings.tsx`

Reutiliza os mesmos blocos de UI da `index.tsx` (ViewToggle, FilterButton, SightingButton, MapView, PetMarker) mas com composição própria — **não é um clone**.

**Diferenças de domínio em relação a `index.tsx`:**
- Hooks: `usePetSightingsMap()` e `usePetSightingsList()` em vez dos hooks de reports
- SightingButton navega para `/pet-sighting/new` (avistamento independente)
- Marcadores e cards mostram dados de `PetSighting` em vez de `PetReport`
- Card: mostra `title`, `sightedAt` ("Avistado há X dias") em vez de pet name e lostAt
- Texto da lista: "Pets avistados" em vez de "Pets perdidos"
- Preview do mapa: `SightingPreviewCard` (diferente de `PetPreviewCard`)
- Navegação de detalhe: futuramente `/pet-sighting/[id]` (neste escopo, card não navega)

### 2.3 Store para filtros da tab Avistados

**Arquivo:** `src/stores/sightings-feed.store.ts` (novo)

Mesma estrutura de `home-pet-reports.store.ts`: viewMode, species, size, setters, resetFilters.

---

## Etapa 3 — API e Hooks para Pet Sightings

### 3.1 Módulo API

**Arquivo:** `src/services/api/pet-sightings.ts` (novo)

Endpoints padronizados com pet-reports:

**`GET /api/v1/pet-sightings`** — Lista paginada

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| latitude | numeric | sim | -90 a 90 |
| longitude | numeric | sim | -180 a 180 |
| species | string | não | DOG ou CAT |
| size | string | não | SMALL, MEDIUM ou LARGE |
| page | int | não | default 1 |
| per_page | int | não | default 10 |
Retorno: resposta paginada com `data`, `links`, `meta`. Resultados ordenados por distância (mais perto primeiro). Cada item inclui `distanceMeters`.

**`GET /api/v1/pet-sightings/map`** — Mapa (sem paginação)

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| latitude | numeric | sim | -90 a 90 |
| longitude | numeric | sim | -180 a 180 |
| radius_km | numeric | não | default 10, max 50 |
| species | string | não | DOG ou CAT |
| size | string | não | SMALL, MEDIUM ou LARGE |

Retorno: `PetSighting[]` direto (sem paginação, sem `links`/`meta`), max 500 resultados. Filtra apenas sightings dentro do raio. Mesmo padrão de `GET /pet-reports/lost/map`.

Ambos requerem `Authorization: Bearer {token}` e retornam o mesmo formato de `PetSightingResource`.

```ts
export const petSightingsApi = {
  list: (filters: PetSightingListFilters, page: number = 1) =>
    api.get<PaginatedResponse<PetSighting>>('/pet-sightings', { params: { ...filters, page } }),
  listMap: (filters: PetSightingMapFilters) =>
    api.get<PetSighting[]>('/pet-sightings/map', { params: filters }),
  getDetail: (id: number) =>
    api.get<ResourceResponse<PetSighting>>(`/pet-sightings/${id}`),
  create: (data: FormData) =>
    api.post<ResourceResponse<PetSighting>>('/pet-sightings', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  delete: (id: number) => api.delete(`/pet-sightings/${id}`),
}
```

### 3.2 Query keys

**Arquivo:** `src/constants/query-keys.ts` — adicionar:

```ts
petSightings: {
  all: ["petSightings"],
  map: (filters) => ["petSightings", "map", filters],
  list: (filters) => ["petSightings", "list", filters],
  detail: (id) => ["petSightings", "detail", id],
}
```

> `detail` key já registrada para completude do domínio. Hook e tela de detalhe vêm na iteração seguinte.

### 3.3 Hook

**Arquivo:** `src/hooks/usePetSightings.ts` (novo)

- `usePetSightingsMap(filters)` — `useQuery`, select normaliza array direto (mesmo padrão de `useLostReportsMap`)
- `usePetSightingsList(filters)` — `useInfiniteQuery` (paginado)
  - `getNextPageParam`: `meta.current_page < meta.last_page ? current_page + 1 : undefined`
  - Expor `items` flat: `pages.flatMap(page => page.data.data) ?? []`
- `useCreatePetSighting()` — `useMutation` (FormData), invalida `["petSightings"]` (prefixo genérico cobre map + list na tab Avistados)
- `useDeletePetSighting()` — `useMutation`, invalida `["petSightings"]`

> **Nota:** API (`getDetail`) e query key (`detail`) já ficam prontos neste escopo. Hook (`usePetSightingDetail`) e tela (`/pet-sighting/[id]`) vêm na iteração seguinte.

---

## Etapa 4 — Tela "Reportar Avistamento Independente"

### 4.1 Schema

**Arquivo:** `src/features/pet-sighting/schemas/pet-sighting.schema.ts` (novo)

```ts
export const petSightingSchema = z.object({
  title: z.string().min(1, "Título obrigatório").max(255),
  sightedAt: z.date().refine(d => d <= new Date(), "Data não pode ser no futuro"),
  species: z.enum(["DOG", "CAT"], { message: "Selecione a espécie" }),
  size: z.enum(["SMALL", "MEDIUM", "LARGE"]).nullable(),
  sex: z.enum(["MALE", "FEMALE", "UNKNOWN"]).nullable(),
  color: z.string().max(100).optional().or(z.literal("")),
  breedId: z.number().nullable(),
  addressHint: z.string().max(500).optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  sharePhone: z.boolean(),
  characteristicIds: z.array(z.number()),
  photos: z.array(photoFormItemSchema).max(3, "Máximo 3 fotos"),
})
```

### 4.2 Util build FormData

**Arquivo:** `src/features/pet-sighting/utils/build-pet-sighting-form-data.ts` (novo)

Segue padrão de `src/features/pets/utils/build-pet-form-data.ts`.

### 4.3 Tela de criação

**Arquivo:** `src/app/pet-sighting/new.tsx` (novo)

Formulário com campos (conforme design Node 9ocXs):
- Título (TextInput)
- Data/hora (DateTimePickerField)
- Localização (MapPickerInline + addressHint)
- Fotos (PhotoUploader — adicionar prop `maxPhotos` ao componente, default mantém valor atual, pet-sighting passa `maxPhotos={3}`)
- Descrição (textarea com contador)
- Espécie (chip selector — reutilizar padrão do PetForm)
- Porte (chip selector)
- Sexo (chip selector)
- Cor (TextInput)
- Raça (BreedPicker/SelectField)
- Características (CharacteristicsPicker — reutilizar)
- Compartilhar telefone (toggle + PhoneSection com CRUD — ver regras na Etapa 5)
- Botão "Registrar avistamento"

### 4.4 Tela sucesso

**Arquivo:** `src/app/pet-sighting/success.tsx` (novo)

Fluxo pós-criação:
1. Mutation `onSuccess` → navega com id: `router.replace({ pathname: '/pet-sighting/success', params: { id: String(data.id) } })`
2. Tela de sucesso com botão "Voltar para Avistados" → `router.replace('/(tabs)/sightings')`

> **Nota:** `id` já é passado como param para uso futuro. Botão "Ver avistamento" será adicionado quando a tela de detalhe existir.

---

## Etapa 5 — Phone Sharing no Avistamento Independente

### 5.1 Regras de comportamento

- `sharePhone = false` → seção de phones **escondida**, `contactPhone` não enviado no payload
- `sharePhone = true` → mostra `PhoneSection` com CRUD
- **Validação no submit:** se `sharePhone = true`, o usuário **deve ter ao menos 1 telefone cadastrado**. Caso contrário, exibir toast de erro e não submeter.
- **CRUD é independente do FormData:** phones são gerenciados via endpoints próprios (`usePhones`). O FormData do sighting envia apenas `share_phone: boolean` — **não serializa lista de phones**.

### 5.2 Design (Nodes hB8Qb, OcKcU, Ijoae)

- Toggle "Compartilhar telefone com dono do pet"
- Quando ativo, mostra lista de phones do user com botões editar/excluir
- Botão "Adicionar telefone" abre modal (BottomSheetModal)
- Excluir abre Dialog de confirmação

### 5.3 Estratégia de reuso do PhoneSection

`PhoneSection` existente em `src/components/report-lost/PhoneSection.tsx` já implementa o CRUD completo e **não tem acoplamento com report-lost** (usa apenas hooks genéricos de `usePhones`).

Migração incremental (menos risco de quebra):
1. Criar `src/components/shared/phone/PhoneSection.tsx` (+ `PhoneEntry`, `NewPhoneEntry`)
2. Usar na tela de pet-sighting
3. Migrar `report-lost` para importar de `shared/phone/`
4. Remover arquivos antigos de `report-lost/`

---

## Etapa 6 — Componentes para Tab Avistados

### 6.1 `SightingListCard`
**Arquivo:** `src/components/sightings/SightingListCard.tsx` (novo)

Similar a `src/components/home/PetListCard.tsx` mas para `PetSighting`:
- Foto: usar `photos[0].url` se `photos.length > 0`, senão placeholder por `species` (ícone cachorro/gato)
- Dados: title, species/size/color, distância formatada, "Avistado há X dias" (relativo a `sightedAt`)

### 6.2 `SightingList`
**Arquivo:** `src/components/sightings/SightingList.tsx` (novo)

Similar a `src/components/home/PetList.tsx` mas usando `SightingListCard` e `PetSighting[]`.

### 6.3 `SightingPreviewCard`
**Arquivo:** `src/components/sightings/SightingPreviewCard.tsx` (novo)

Similar a `src/components/map/PetPreviewCard.tsx` para marcador selecionado no mapa.

### 6.4 Marcadores
Reutilizar `PetMarker` existente — species está disponível diretamente no `PetSighting`.

---

## Etapa 7 — Matches (Breaking Change)

### 7.1 Type `PetMatch`
Coberto na Etapa 1.2.

### 7.2 UI de matches
Matches ainda não têm tela implementada (mostra toast "Em breve"). O tipo será atualizado agora, UI na Fase 10.

### 7.3 Notas para Fase 10 (isSightingDeleted)

Quando a tela de matches for implementada, considerar:
- Exibir badge "Avistamento removido" quando `isSightingDeleted = true`
- Desabilitar CTA de contato para sightings deletados
- Manter fotos/dados históricos visíveis (read-only)

---

## Arquivos Críticos

| Arquivo | Ação |
|---------|------|
| `src/types/pet-sighting.ts` | Criar |
| `src/types/sighting.ts` | Renomear interface → `ReportSighting` |
| `src/types/match.ts` | Atualizar contrato |
| `src/app/(tabs)/_layout.tsx` | Adicionar tab Avistados, renomear Home→Perdidos |
| `src/app/(tabs)/sightings.tsx` | Criar |
| `src/stores/sightings-feed.store.ts` | Criar |
| `src/services/api/pet-sightings.ts` | Criar |
| `src/services/api/pet-reports.ts` | Atualizar import ReportSighting |
| `src/constants/query-keys.ts` | Adicionar petSightings |
| `src/hooks/usePetSightings.ts` | Criar |
| `src/hooks/usePetReports.ts` | Atualizar import |
| `src/features/pet-sighting/schemas/pet-sighting.schema.ts` | Criar |
| `src/features/pet-sighting/utils/build-pet-sighting-form-data.ts` | Criar |
| `src/app/pet-sighting/new.tsx` | Criar |
| `src/app/pet-sighting/success.tsx` | Criar |
| `src/components/sightings/SightingListCard.tsx` | Criar |
| `src/components/sightings/SightingList.tsx` | Criar |
| `src/components/sightings/SightingPreviewCard.tsx` | Criar |
| `src/components/shared/phone/PhoneSection.tsx` | Criar (extrair de report-lost) |
| `src/components/shared/phone/PhoneEntry.tsx` | Criar (extrair de report-lost) |
| `src/components/shared/phone/NewPhoneEntry.tsx` | Criar (extrair de report-lost) |
| `src/components/pet/PhotoUploader.tsx` | Adicionar prop `maxPhotos` |

## Componentes Reutilizáveis

| Componente | Path | Uso |
|------------|------|-----|
| `PhotoUploader` | `src/components/pet/PhotoUploader.tsx` | Upload de fotos (adicionar prop `maxPhotos`, pet-sighting usa 3) |
| `CharacteristicsPicker` | `src/components/pet/CharacteristicsPicker.tsx` | Seleção de características |
| `PetForm` (padrão chips) | `src/components/pet/PetForm.tsx` | Referência p/ species/size/sex chips |
| `PhoneSection` | `src/components/report-lost/PhoneSection.tsx` | CRUD de phones |
| `MapPickerInline` | `src/components/map/MapPickerInline.tsx` | Seletor de localização |
| `DateTimePickerField` | `src/components/ui/DateTimePickerField.tsx` | Picker de data |
| `ViewToggle` | `src/components/home/ViewToggle.tsx` | Toggle mapa/lista |
| `FilterButton` | `src/components/map/FilterButton.tsx` | Botão de filtros |
| `FilterModal` | `src/components/map/FilterModal.tsx` | Modal de filtros |
| `PetMarker` | `src/components/map/PetMarker.tsx` | Marcador no mapa |
| `NavHeader` | `src/components/ui/NavHeader.tsx` | Header de navegação |
| `BottomSheetModal` | `src/components/ui/BottomSheetModal.tsx` | Modal base |
| `Dialog` | `src/components/ui/Dialog.tsx` | Dialog de confirmação |
| `buildCreatePetFormData` | `src/features/pets/utils/build-pet-form-data.ts` | Padrão para FormData |

## Ordem de Implementação

1. **Types** (pet-sighting.ts, renomear sighting.ts, atualizar match.ts)
2. **API + Query Keys + Hooks** (pet-sightings)
3. **Store** (sightings-feed)
4. **Schema + FormData util** (pet-sighting)
5. **Shared phone** (extrair PhoneSection para shared — necessário antes da tela de criação)
6. **Tabs** (layout + tela sightings.tsx)
7. **Componentes da tab** (SightingListCard, SightingList, SightingPreviewCard)
8. **Tela de criação** (pet-sighting/new.tsx + success.tsx)

## Verificação

- `npx tsc --noEmit` — sem erros de tipo
- `npm run lint` — sem warnings
- Tab Perdidos funciona como antes
- Tab Avistados carrega feed do novo endpoint
- Criação de avistamento independente com fotos
- CRUD de phones no form
- Sighting vinculado a report (`/sighting/new?reportId=X`) continua funcionando
