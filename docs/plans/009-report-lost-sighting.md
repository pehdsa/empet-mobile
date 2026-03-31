# Fase 9: Reportar Pet Perdido + Avistamento

## Status: Pendente

## Referencia visual (Pencil)

- Detalhes do Pet — estado seguro (botao "Pet Perdido"): Node `1aLEH`
- Detalhes do Pet — estado perdido (botao "Detalhes de Perda" + matches): Node `9aht2`
- Atualizar Report: Node `Uql90`
- Modal "Pet encontrado?": Node `tYoA5`
- Modal "Excluir telefone?": Node `Bhg9Y`
- Reportar Perda (tela unica): Node `rDMgl`
- Report Sucesso (confirmacao): Node `sob3g`
- Meus Pets (badges Seguro/Perdido): Node `mBKKq`

## Pre-requisitos ja implementados

- **Types:** `src/types/pet.ts` (Pet, PetPhoto, PetSpecies, PetSize, PetSex), `src/types/pet-report.ts` (PetReport, PetReportStatus, PetReportFilters, LostReportMapFilters, LostReportListFilters), `src/types/sighting.ts` (PetSighting), `src/types/api.ts` (ResourceResponse, PaginatedResponse, ValidationError, MessageResponse)
- **API:** `petReportsApi` em `src/services/api/pet-reports.ts` (listLostMap, listLost, getDetail), `petsApi` em `src/services/api/pets.ts` (CRUD completo)
- **Hooks:** `useLostReportsMap`, `useLostReportsList`, `usePetReportDetail` em `src/hooks/usePetReports.ts`; `usePets`, `usePet` em `src/hooks/usePets.ts`; `useLocation` em `src/hooks/useLocation.ts`
- **Query keys:** `pets.all`, `pets.list()`, `pets.detail(id)`, `petReports.map(filters)`, `petReports.list(filters)`, `petReports.detail(id)`
- **Enums:** `speciesLabel`, `sizeLabel`, `sexLabel`, `reportStatusLabel` em `src/constants/enums.ts`
- **Constants:** `DEFAULT_LOCATION` em `src/constants/defaults.ts`
- **Stores:** `useToastStore` (toast.ts), `useHomePetReportsStore` (home-pet-reports.store.ts), `useAuthStore` (auth.ts)
- **Componentes UI:** Screen, NavHeader, ButtonPrimary (com `loading`/`disabled`), ButtonSecondary, Card, Chip, Skeleton, Modal, BottomSheetModal, EmptyState, FAB, SelectField, ToggleButton, TextInput, Toast, Dialog
- **Componentes pet:** PetCard, PetForm, PetBasicInfo, PhotoUploader, CharacteristicsPicker
- **Componentes map:** PetMarker, PetPreviewCard, SightingButton, FilterButton, FilterModal, MarkerCluster, MapEmptyState, FAB
- **Componentes pet-report:** PhotoCarousel, PetInfoSection, CharacteristicsSection, ReportInfoSection, NotesCard
- **Utils:** `mapApiErrors` (422 → react-hook-form), `formatDate`, `formatDateTime`, `relativeTime`, `formatDistance`, `phoneMask`
- **Tela existente:** `src/app/pets/[id]/index.tsx` — Detalhes do Pet (onde o botao "Pet Perdido" sera adicionado)
- **Types:** `src/types/phone.ts` (UserPhone: id, phone, isWhatsapp, isPrimary, label)
- **Utils:** `phoneMask` em `src/utils/phone-mask.ts`
- **Referencia de navegacao existente:** `pet-report/[id].tsx` ja tem botao "Vi esse pet!" → `/sighting/new?reportId={id}`

## Escopo desta fase

**Incluido:**
- Layout condicional na tela de Detalhes do Pet: estado seguro (botao "Pet Perdido") vs estado perdido (botao "Detalhes de Perda" + card "Ver Matches")
- Tela unica de Reportar Perda (mapa inline + detalhes + submit)
- Tela de Atualizar Report (editar local, data, descricao, telefones + marcar como encontrado)
- Tela de sucesso do report
- Fluxo completo de Reportar Avistamento (formulario single-screen + tela de sucesso)
- Componente MapPickerInline reutilizavel (mapa inline com pin central)
- Componente DateTimePickerField reutilizavel (wrapper cross-platform)
- Secao de telefones para contato inline no form de report-lost (CRUD de phones do usuario)
- API module de phones (`phonesApi`) + hooks
- API endpoints para create report e create sighting
- Hooks de mutation correspondentes
- Schemas Zod para validacao de ambos formularios
- Remover `src/app/report-lost/select-pet.tsx` (placeholder antigo, nao mais necessario)

**Alteracao em componentes existentes:**
- `PetCard` — trocar badge "Ativo/Inativo" por badge de status "Seguro" (verde) / "Perdido" (vermelho). Pets inativos nao listam, entao o badge de ativo/inativo nao faz sentido. O dono tem feedback visual rapido de quem esta perdido.
- `PetBasicInfo` — mesmo badge "Seguro"/"Perdido" ao lado do nome na tela de Detalhes do Pet.

**Excluido (fases futuras):**
- Cancelar report — Fase 10 ou 11
- Listar reports do usuario ("Meus reports") — Fase 11
- Listar sightings de um report — Fase 10 (matches)
- Editar report/sighting existente
- Notificacoes push de avistamento — Fase 12

---

## Decisao de navegacao

O fluxo inicia na tela de **Detalhes do Pet** (`src/app/pets/[id]/index.tsx`), onde um botao vermelho "Pet Perdido" (icone `triangle-alert`) navega para a tela de report. O `petId` e passado como route param. **Tela unica** — nao ha wizard multi-step.

```
src/app/pets/[id]/index.tsx             → Detalhes do Pet (botao "Pet Perdido" ou "Detalhes de Perda")
src/app/report-lost/[petId].tsx         → Reportar Perda (tela unica, criar report)
src/app/report-lost/success.tsx         → Sucesso com opcoes de navegacao
src/app/report-lost/update/[reportId].tsx → Atualizar Report (editar report existente)

src/app/sighting/new.tsx                → Formulario de avistamento (single screen)
src/app/sighting/success.tsx            → Sucesso do avistamento
```

**Remover:** `src/app/report-lost/select-pet.tsx` (placeholder antigo, fluxo mudou)

Navegacao do report-lost:
- Pet detail → Report: `router.push({ pathname: "/report-lost/[petId]", params: { petId: String(pet.id) } })`
- Report submit → Success: `router.replace({ pathname: "/report-lost/success", params: { reportId: String(id) } })`
- Success → Home: `router.replace("/(tabs)")`
- Success → Report detail: `router.replace({ pathname: "/pet-report/[id]", params: { id } })`

Navegacao do sighting:
- Pet report detail → Sighting: `router.push("/sighting/new?reportId={id}")` (ja implementado)
- Sighting submit → Success: `router.replace("/sighting/success?reportId={id}")`
- Success → Home: `router.replace("/(tabs)")`

---

## Contrato do backend

### POST `/pet-reports` (create report) — JSON

| Campo | Tipo | Validacao |
|-------|------|-----------|
| `pet_id` | integer | required, exists, pertence ao usuario, pet ativo, sem report ativo |
| `latitude` | number | required, between:-90,90 |
| `longitude` | number | required, between:-180,180 |
| `address_hint` | string | nullable, max:500 |
| `description` | string | nullable, max:2000 |
| `lost_at` | datetime (ISO 8601) | required, before_or_equal:now |

Response: `ResourceResponse<PetReport>` — retorna o report criado com `id`, `status: "LOST"`, `pet` (nested).

Erros possiveis:
- 422: validacao (campos invalidos, pet ja tem report ativo)
- 403: pet nao pertence ao usuario
- 404: pet nao encontrado

### POST `/pet-reports/{reportId}/sightings` (create sighting) — JSON

| Campo | Tipo | Validacao |
|-------|------|-----------|
| `latitude` | number | required, between:-90,90 |
| `longitude` | number | required, between:-180,180 |
| `address_hint` | string | nullable, max:500 |
| `description` | string | nullable, max:2000 |
| `sighted_at` | datetime (ISO 8601) | required, before_or_equal:now |
| `share_phone` | boolean | required |

Response: `ResourceResponse<PetSighting>` — retorna o sighting criado.

Erros possiveis:
- 422: validacao
- 404: report nao encontrado ou inativo

### API de Phones — `/user/phones` (autenticado)

**GET `/user/phones`** — listar telefones do usuario. Response: array de `UserPhone` ordenado por `isPrimary` desc.

**POST `/user/phones`** — criar telefone.

| Campo | Tipo | Validacao |
|-------|------|-----------|
| `phone` | string | required, max:20, unico por usuario |
| `is_whatsapp` | boolean | opcional, default false |
| `label` | string | opcional, max:50 |

Limite: maximo 5 telefones por usuario. Response: 201 com phone criado.

**PUT `/user/phones/{id}`** — atualizar telefone. Mesmos campos do POST. Response: 200 com phone atualizado.

**Nota:** `is_primary` nunca e enviado pelo frontend — o backend gerencia automaticamente.

**DELETE `/user/phones/{id}`** — remover telefone. Response: 200 com `{ message: "Phone deleted successfully." }`.

---

### PUT `/pet-reports/{id}` (update report) — JSON

Update completo — exige payload com todos os campos obrigatorios:

| Campo | Tipo | Validacao |
|-------|------|-----------|
| `latitude` | number | required, between:-90,90 |
| `longitude` | number | required, between:-180,180 |
| `address_hint` | string | nullable, max:500 |
| `description` | string | nullable, max:2000 |
| `lost_at` | datetime (ISO 8601) | required, before_or_equal:now |

Response: `ResourceResponse<PetReport>` — retorna o report atualizado.

### PATCH `/pet-reports/{id}/found` (marcar como encontrado) — JSON

Body vazio. Altera status para `FOUND`, seta `foundAt` para agora.

Response: `ResourceResponse<PetReport>` — retorna o report com `status: "FOUND"`.

---

**Nota:** todos endpoints de report e sighting usam JSON (Content-Type: application/json), nao multipart/form-data. Nenhum upload de arquivo nestes fluxos.

---

## Telas

### Detalhes do Pet (`src/app/pets/[id]/index.tsx`) — layout condicional por status

A tela de detalhe tem dois estados visuais conforme o pet esteja seguro ou perdido:

**Estado seguro** (Pencil `1aLEH`):
- Badge "Seguro" (verde) ao lado do nome
- Bottom bar: botao vermelho (#E53935) "Pet Perdido" (icone `triangle-alert`, width 216, cornerRadius 14, height 52) + row edit/delete
- Ao tocar "Pet Perdido": `router.push({ pathname: "/report-lost/[petId]", params: { petId: String(pet.id) } })`

**Estado perdido** (Pencil `9aht2`):
- Badge "Perdido" (vermelho) ao lado do nome
- **Botao "Pet encontrado"** (Pencil `e6zxW`) no scroll area, entre a foto e o infoCard:
  - Outline verde: borda `#43A047` 1.5px, fundo transparente, cornerRadius 14, height 52
  - Icone `circle-check` verde + texto "Pet encontrado" (bold 16, verde)
  - Centralizado no wrapper (padding [12, 0])
  - Ao tocar: abre Dialog de confirmacao (Pencil `tYoA5`):
    - Icone `circle-check` verde em circulo `#43A04720` (56x56)
    - Titulo: "Pet encontrado?"
    - Descricao: "Tem certeza que o pet foi encontrado? O status será atualizado e o alerta será encerrado."
    - Botao verde (#43A047) "Sim, encontrado!" (cornerRadius 14, height 52, full width)
    - Texto "Cancelar" (cinza, fontSize 13)
  - Se confirmado → PATCH `/pet-reports/{id}/found`
  - `onSuccess`: Toast "Pet marcado como encontrado!", invalidar queries, tela atualiza (pet volta a "Seguro")
- **Card "Ver Matches"** (Pencil `CHzpj`) fixo entre scroll area e bottom bar (nao scrolla):
  - Fundo `#AD4FFF10`, borda top cinza, padding [12, 24]
  - Icone `users` em circulo primary (40x40, fundo `#AD4FFF15`, cornerRadius 20)
  - Titulo "Ver Matches" (fontSize 15, semibold)
  - Subtitulo "{N} pets encontrados com similaridade" (fontSize 12, cinza) — `N` = `matchesCount` do report, obtido via `usePetReportDetail(pet.activeReportId)` com `enabled: !!pet?.activeReportId` (query extra, so roda quando perdido). Skeleton no card enquanto carrega — nao bloquear a tela inteira
  - Chevron a direita
  - Ao tocar: _navegar para tela de matches (Fase 10 — por ora, Toast "Em breve")_
  - **Nota:** matches sao uma API separada (`GET /pet-reports/{id}/matches`), implementada na Fase 10. Nesta fase, apenas exibimos a contagem que ja vem no `PetReport.matchesCount`
- **Bottom bar:** botao outline primary "Detalhes de Perda" (Pencil `blNcC`, borda `#AD4FFF` 1.5px, fundo transparente, icone `file-text`, texto primary semibold 16, width 216, cornerRadius 14, height 52) + row edit/delete
  - Ao tocar "Detalhes de Perda": `router.push({ pathname: "/report-lost/update/[reportId]", params: { reportId: String(pet.activeReportId) } })`

**Condicional:** `pet.activeReportId !== null` → estado perdido; `=== null` → estado seguro

### Reportar Perda (`src/app/report-lost/[petId].tsx`) — Pencil `rDMgl`

Tela unica com scroll. Titulo: "Reportar Perda".

- Parsear `petId` do route param. Se invalido: Toast + goBack()
- `usePet(petId)` para carregar dados do pet
- `useLocation()` para regiao inicial do mapa
- **Inicializacao de coordenadas:** o `useState` local de lat/lon deve ser inicializado com a localizacao do usuario (ou DEFAULT_LOCATION) no mount — nao esperar o usuario mover o mapa. Assim, se o usuario submeter sem interagir com o mapa, as coordenadas ja tem valor valido (centro inicial).
- `react-hook-form` com `zodResolver(reportLostSchema)`

**Layout (scroll area, gap 20, padding [16, 24]):**

1. **Secao "Onde ele se perdeu?"** (Pencil `z5FLl`):
   - Titulo bold 16
   - **MapPickerInline** (Pencil `Lm9CJ`): mapa inline (height 200, cornerRadius 12, borda cinza) com pin fixo no centro. Usuario toca para expandir/interagir. Pin visual (Pencil `TDFxd`): circulo primary com icone branco + ponta
   - Campo "Referência do local" (TextInput, opcional, max 500, placeholder "Ex: Perto da praça central")

2. **Summary card do pet** (Pencil `taeOS`): foto thumbnail (48x48, cornerRadius 12) + nome + "Local marcado no mapa" + chevron. Toque abre mapa expandido ou scrolls para secao do mapa

3. **Secao "Quando ele se perdeu? *"** (Pencil `J94xq`):
   - DateTimePickerField, obrigatorio, default agora, max agora
   - Icone `calendar` a direita do campo

4. **Secao "O que aconteceu?"** (Pencil `Rmipt`):
   - TextInput multiline (height 140), opcional, max 2000
   - Placeholder: "Descreva as circunstâncias: como ele fugiu, última vez que foi visto, etc."
   - Contador de caracteres "0/2000" alinhado a direita

5. **Secao "Telefones para contato"** (Pencil `zlNL3`):
   - Carrega phones existentes via `useUserPhones()`
   - Cada phone renderiza como `PhoneEntry` card (Pencil `DhalS`/`AHPkH`):
     - Campo phone (mascarado via `phoneMask`, icone `phone`, fundo `#F8F8F8`, height 44, cornerRadius 10)
     - Botao delete (icone `trash-2`, 36x36) — abre Dialog de confirmacao (Pencil `Bhg9Y`):
     - Icone `trash-2` vermelho em circulo `#E5393520` (56x56)
     - Titulo: "Excluir telefone?"
     - Descricao: "Tem certeza que deseja excluir este número de telefone? Essa ação não pode ser desfeita."
     - Botao vermelho "Excluir" + texto "Cancelar"
     - Se confirmado → `DELETE /user/phones/{id}`
     - Toggle WhatsApp: logo WA + texto "WhatsApp" + switch (on: primary `#AD4FFF`, off: cinza `#E2E2E2`). Ao alternar, chama `PUT /user/phones/{id}` com `is_whatsapp` atualizado
   - Botao "Adicionar telefone" (icone `circle-plus` + texto primary, height 40, centralizado)
     - Ao tocar: abre `NewPhoneEntry` inline (campo vazio + toggle WhatsApp + botao "Salvar")
     - **Submit explicito:** novo phone so e salvo via `POST /user/phones` quando usuario toca "Salvar". Sem autosave ao preencher — evita registros orfaos, 422 durante digitacao, e ambiguidade de quando salvar
     - Se cancelar (botao cancelar ou campo vazio): remove entrada local sem chamar API
   - **CRUD inline:** phones sao gerenciados diretamente via API separada (`/user/phones`). Nao fazem parte do body do `POST /pet-reports` — sao entidades independentes do usuario
   - **Maximo 5 telefones:** ocultar botao "Adicionar" quando atingir limite
   - **Sem telefones:** mostrar apenas botao "Adicionar telefone"

**Bottom bar fixo:**
- Botao "Reportar como perdido" (vermelho #E53935, bold, cornerRadius 12, height 48, full width)
- `mapApiErrors` para 422 (aliases: `pet_id` → root/Toast, `address_hint` → `addressHint`, `lost_at` → `lostAt`)
- `onSuccess`: `router.replace({ pathname: "/report-lost/success", params: { reportId: String(id) } })`
- `onError (nao 422)`: Toast "Erro ao reportar pet perdido"

### Sucesso do Report (`src/app/report-lost/success.tsx`) — Pencil `sob3g`

- Circulo verde (#43A047, 80x80) com icone `check` branco (40x40)
- Titulo: "Report criado com sucesso!" (fontSize 20, bold)
- Descricao: "Estamos procurando pets semelhantes na região. Você será notificado quando encontrarmos possíveis matches." (fontSize 14, lineHeight 1.5, max width 300, centralizado)
- **Pet card** resumo: foto (64x64, cornerRadius 12) + nome + info do pet
- **Fonte de dados:** recebe `reportId` via route param. Carrega report via `usePetReportDetail(reportId)` — que retorna o pet nested. Nao depender de navigation state ou cache da mutation.
  - Guard: se `reportId` invalido (NaN, null) → redirecionar para Home
  - Se query falha (erro de rede) → mostrar estado de erro com botao "Tentar novamente" (nao redirecionar — falha temporaria nao e rota invalida)
- Botao primary "Ver report" → `router.replace({ pathname: "/pet-report/[id]", params: { id: reportId } })`
- Link "Voltar ao mapa" (texto primary, fontSize 14, medium) → `router.replace("/(tabs)")`
- **Guard:** se `reportId` param invalido, redirecionar para Home

### Atualizar Report (`src/app/report-lost/update/[reportId].tsx`) — Pencil `Uql90`

Tela para editar detalhes de um report existente. Acessada via botao "Detalhes de Perda" (`blNcC`) na tela de Detalhes do Pet quando perdido.

- Titulo: "Atualizar Report"
- Parsear `reportId` do route param. Se invalido: Toast + goBack()
- `usePetReportDetail(reportId)` para carregar report existente (pre-preencher campos)
- `react-hook-form` com `zodResolver(reportLostSchema)` — mesmo schema do create, `defaultValues` vindos do report

**Layout (scroll area, gap 20, padding [16, 24]):**

1. **Summary card do pet** (Pencil `HYLQi`): foto (64x64, cornerRadius 12) + nome (bold 16) + especie/porte (regular 13, cinza) + raca (regular 12, cinza claro). Sem chevron, read-only

2. **Secao "Última localização conhecida"** (Pencil `hxYmM`):
   - Titulo bold 16
   - MapPickerInline (height 200) — pre-posicionado na localizacao do report existente
   - Campo "Referência do local" — pre-preenchido com `addressHint` do report

3. **Secao "Quando ele se perdeu? *"** (Pencil `0zvGQ`):
   - DateTimePickerField — pre-preenchido com `lostAt` do report

4. **Secao "Atualize a descrição"** (Pencil `SVUqp`):
   - TextInput multiline — pre-preenchido com `description` do report
   - Contador "0/2000"

5. **Secao "Telefones para contato"** (Pencil `NO9Dw`):
   - Mesmo comportamento do form de create: carrega phones via `useUserPhones()`, CRUD inline

**Bottom bar fixo:**
- **"Salvar alterações"** (primary #AD4FFF, bold, full width) → PUT `/pet-reports/{id}`
  - `mapApiErrors` para 422 (aliases: `address_hint` → `addressHint`, `lost_at` → `lostAt`)
  - `onSuccess`: Toast "Report atualizado!", invalidar queries, goBack()
  - `onError (nao 422)`: Toast "Erro ao atualizar report"

### Formulario de Avistamento (`src/app/sighting/new.tsx`)

- Recebe `reportId` via `useLocalSearchParams<{ reportId?: string }>()`
- Parsear com `parseId()` (pattern existente). Se invalido: Toast + voltar
- `usePetReportDetail(reportId)` para carregar dados do report (mini-card do pet)
- `NavHeader title="Reportar avistamento"`
- **Mini-card do pet:** foto, nome, especie do pet do report (read-only)
- **MapPickerInline** para local do avistamento. Regiao inicial: localizacao do usuario
- **Campo addressHint:** TextInput, opcional, max 500
- **Campo description:** TextInput multiline, opcional, max 2000
- **Campo sightedAt:** DateTimePickerField, obrigatorio, default agora, max agora
- **Toggle sharePhone:** "Compartilhar meu telefone". Default: false
- **Botao "Reportar avistamento"** → POST `/pet-reports/{reportId}/sightings`
- `react-hook-form` com `zodResolver(sightingSchema)`
- `mapApiErrors` para 422 (aliases: `address_hint` → `addressHint`, `sighted_at` → `sightedAt`, `share_phone` → `sharePhone`)
- `onSuccess`: `router.replace("/sighting/success?reportId={reportId}")`
- `onError (nao 422)`: Toast "Erro ao reportar avistamento"

### Sucesso do Avistamento (`src/app/sighting/success.tsx`)

- Mensagem "Obrigado pelo avistamento!"
- Botao "Voltar ao mapa" → `router.replace("/(tabs)")`

---

## Componentes a alterar

### `src/components/pet/PetCard.tsx` — Badge de status

Trocar badge "Ativo/Inativo" por badge de status do pet:

- **Seguro** (sem report ativo): bolinha verde (#43A047) + texto "Seguro" verde, fundo `#43A04715`, cornerRadius 12, padding `[4, 12]`, fontSize 12, fontWeight 600
- **Perdido** (com report ativo): bolinha vermelha (#E53935) + texto "Perdido" vermelho, fundo `#E5393515`, cornerRadius 8, padding `[3, 10]`, fontSize 12, fontWeight 600

Logica: pets inativos nao aparecem na lista (backend nao retorna), entao o badge ativo/inativo nao tem utilidade. O badge de status "Seguro"/"Perdido" da feedback visual imediato ao dono.

### `src/components/pet/PetBasicInfo.tsx` — Badge de status no detalhe

Adicionar o mesmo badge "Seguro"/"Perdido" na tela de Detalhes do Pet, ao lado do nome (Pencil `xoVrb` dentro de `DM0kd`). Layout: nome a esquerda + badge a direita, row com `justifyContent: space_between`.

Mesmo visual dos badges do PetCard (cores, bolinha, tipografia).

**Campo `activeReportId`:** o backend ja retorna `activeReportId: number | null` no PetResource (todos os endpoints de pet). Adicionar ao tipo `Pet` em `src/types/pet.ts`.

---

## Componentes a criar

### `src/components/map/MapPickerInline.tsx`

Mapa inline (nao fullscreen) com pin fixo no centro. Usuario interage para posicionar o pin.

```typescript
interface MapPickerInlineProps {
  initialRegion?: Region;
  onRegionChange: (coords: { latitude: number; longitude: number }) => void;
  height?: number; // default 200
}
```

- `MapView` com `onRegionChangeComplete` → extrai lat/lon do centro da regiao
- Pin fixo renderizado como `View` absolute no centro do mapa (nao e Marker)
- **Visual do pin** (Pencil `TDFxd`): circulo primary com icone branco + ponta triangular
- CornerRadius 12, borda cinza (#E2E2E2, 1px)
- Prop `initialRegion` para posicao inicial (default: `DEFAULT_LOCATION`)

**Componente semi-controlado:** `initialRegion` e usado apenas no mount — nao tenta sincronizar de volta depois. O estado interno do mapa e gerenciado pelo MapView. A tela recebe coordenadas via `onRegionChange` e as armazena em `useState` local. Na tela de update, passar a localizacao do report existente como `initialRegion` — funciona mesmo com dados assincronos se o componente so renderiza apos o fetch (guard com loading state).

Usado em: `report-lost/[petId].tsx`, `report-lost/update/[reportId].tsx`, `sighting/new.tsx`

### `src/components/ui/DateTimePickerField.tsx`

Wrapper sobre `@react-native-community/datetimepicker` integrado com react-hook-form.

```typescript
interface DateTimePickerFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  maximumDate?: Date;
  error?: string;
}
```

- Exibe data formatada em Pressable (estilo similar ao TextInput — height 48, cornerRadius 12, borda cinza)
- Icone `calendar` a direita do campo (Pencil `0tpwv`)
- **iOS:** `mode="datetime"` (picker unico)
- **Android:** flow de dois passos (date modal → time modal) — Android nao suporta `mode="datetime"`
- Usa `formatDateTime` de `src/utils/format-date.ts` para exibicao

### `src/components/report-lost/PetSummaryCard.tsx`

Mini-card com resumo do pet + indicacao do local. Usado na tela de report-lost.

```typescript
interface PetSummaryCardProps {
  pet: Pet;
  subtitle: string; // ex: "Local marcado no mapa"
  onPress?: () => void;
  showChevron?: boolean;
}
```

- Foto thumbnail (48x48, cornerRadius 12) + nome (medium 14) + subtitle (regular 13, cinza) + chevron opcional
- Borda cinza, cornerRadius 12, padding 12 (Pencil `taeOS`)

### `src/components/report-lost/PhoneEntry.tsx`

Card de telefone **existente** (ja salvo no backend). Read-only no numero, toggle WhatsApp editavel, botao delete.

```typescript
interface PhoneEntryProps {
  phone: UserPhone;
  onWhatsappToggle: (value: boolean) => void;
  onDelete: () => void;
  isDeleting?: boolean;
  isUpdating?: boolean;
}
```

- Numero exibido com mascara (`phoneMask`), icone `phone`, fundo `#F8F8F8`, height 44, cornerRadius 10, borda cinza
- Botao delete (icone `trash-2`, cinza `#9B9C9D`, 36x36) — abre Dialog de confirmacao
- Toggle WhatsApp: logo WA + texto "WhatsApp" (fontSize 13, medium, cinza) + switch (on: primary, off: cinza, 48x28). Ao alternar → `PUT /user/phones/{id}`
- Card: fundo branco, cornerRadius 12, padding 12, borda cinza, gap 8
- Loading/disabled states por item (`isDeleting`, `isUpdating`)

### `src/components/report-lost/NewPhoneEntry.tsx`

Card para **criar** novo telefone. Campo editavel + toggle + botoes salvar/cancelar.

```typescript
interface NewPhoneEntryProps {
  onSave: (data: { phone: string; is_whatsapp: boolean }) => void;
  onCancel: () => void;
  isSaving?: boolean;
}
```

- Campo phone editavel com mascara (`phoneMask`), mesmo estilo visual do PhoneEntry
- Toggle WhatsApp (default false)
- Botao "Salvar" (texto primary, fontSize 14, medium) — chama `POST /user/phones`. Desabilitado se campo vazio ou invalido
- Botao "Cancelar" (texto cinza) — remove entrada local sem chamar API
- Validacao local: campo nao vazio, formato basico de telefone
- Erro 422 (duplicado, validacao) → exibido inline no campo
- Erro generico (rede, 500) → Toast

### `src/components/sighting/ReportPetCard.tsx`

Mini-card read-only do pet do report. Usado em `sighting/new.tsx`.

```typescript
interface ReportPetCardProps {
  pet: Pet;
}
```

---

## Infraestrutura a criar nesta fase

### Types — adicionar em `src/types/pet.ts`

```typescript
export interface Pet {
  // ... campos existentes ...
  activeReportId: number | null; // NOVO: id do report ativo (LOST) ou null
}
```

O backend ja retorna este campo em todos os endpoints de pet (list, detail, create, update, toggle).

### Query keys — adicionar em `src/constants/query-keys.ts`

```typescript
phones: {
  all: ["phones"] as const,
},
sightings: {
  byReport: (reportId: number) => ["sightings", "byReport", reportId] as const,
},
```

### Modulo de API — `src/services/api/phones.ts`

```typescript
export const phonesApi = {
  /** Response: array puro conforme contrato documentado.
   *  Se no momento da implementacao vier com envelope { data: [...] },
   *  ajustar tipo para ResourceResponse e adicionar select no hook. */
  list: () =>
    api.get<UserPhone[]>("/user/phones"),
  create: (data: { phone: string; is_whatsapp?: boolean; label?: string }) =>
    api.post<ResourceResponse<UserPhone>>("/user/phones", data),
  update: (id: number, data: { phone?: string; is_whatsapp?: boolean; label?: string }) =>
    api.put<ResourceResponse<UserPhone>>(`/user/phones/${id}`, data),
  delete: (id: number) =>
    api.delete<MessageResponse>(`/user/phones/${id}`),
};
```

### Hooks — `src/hooks/usePhones.ts`

```typescript
export function useUserPhones() — useQuery, queryKey: phones.all. Se response for array puro, select nao e necessario. Se vier envelope, adicionar select: (r) => r.data.data
export function useCreatePhone() — useMutation, onSuccess invalida phones.all
export function useUpdatePhone() — useMutation, onSuccess invalida phones.all
export function useDeletePhone() — useMutation, onSuccess invalida phones.all
```

### Modulo de API — adicionar ao `petReportsApi` em `src/services/api/pet-reports.ts`

```typescript
/** Criar report de pet perdido */
create: (data: {
  pet_id: number;
  latitude: number;
  longitude: number;
  address_hint?: string;
  description?: string;
  lost_at: string; // ISO 8601
}) =>
  api.post<ResourceResponse<PetReport>>("/pet-reports", data),

/** Atualizar report */
update: (id: number, data: {
  latitude: number;
  longitude: number;
  address_hint?: string;
  description?: string;
  lost_at: string;
}) =>
  api.put<ResourceResponse<PetReport>>(`/pet-reports/${id}`, data),

/** Marcar como encontrado */
markFound: (id: number) =>
  api.patch<ResourceResponse<PetReport>>(`/pet-reports/${id}/found`),

/** Criar avistamento */
createSighting: (
  reportId: number,
  data: {
    latitude: number;
    longitude: number;
    address_hint?: string;
    description?: string;
    sighted_at: string; // ISO 8601
    share_phone: boolean;
  },
) =>
  api.post<ResourceResponse<PetSighting>>(
    `/pet-reports/${reportId}/sightings`,
    data,
  ),
```

**Decisao:** sightings dentro de `petReportsApi` (nao criar modulo separado) — endpoint e nested: `/pet-reports/{id}/sightings`.

### Hooks — adicionar em `src/hooks/usePetReports.ts`

```typescript
/** Criar report de pet perdido */
export function useCreatePetReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePetReportPayload) => petReportsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petReports"] }); // prefixo: invalida map + list + detail
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all }); // pet pode ter mudado
    },
  });
}

/** Atualizar report */
export function useUpdatePetReport() — useMutation, onSuccess invalida ["petReports"] + pets.all

/** Marcar como encontrado */
export function useMarkPetFound() — useMutation
  mutationFn: ({ reportId, petId }: { reportId: number; petId: number }) => petReportsApi.markFound(reportId)
  onSuccess invalida: ["petReports"] + pets.all + pets.detail(petId)
  petId passado no payload da mutation para invalidacao — nao usado na chamada API

/** Criar avistamento */
export function useCreateSighting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, data }: { reportId: number; data: CreateSightingPayload }) =>
      petReportsApi.createSighting(reportId, data),
    onSuccess: (_response, { reportId }) => {
      // Intencional: invalida apenas o detalhe do report.
      // Sighting afeta primariamente a tela de detalhe. Mapa e lista nao dependem
      // de sightings nesta fase — se necessario, expandir na Fase 10.
      queryClient.invalidateQueries({ queryKey: queryKeys.petReports.detail(reportId) });
    },
  });
}
```

### Schemas

**`src/features/report-lost/schemas/report-lost.schema.ts`**

```typescript
export const reportLostSchema = z.object({
  addressHint: z.string().max(500, "Máximo 500 caracteres").optional().or(z.literal("")),
  description: z.string().max(2000, "Máximo 2000 caracteres").optional().or(z.literal("")),
  lostAt: z.date({ required_error: "Data da perda é obrigatória" }).refine(
    (d) => d <= new Date(),
    "Data não pode ser no futuro",
  ),
});
export type ReportLostFormValues = z.infer<typeof reportLostSchema>;
```

`petId` vem do route param. `latitude`/`longitude` vem do MapPickerInline state (gerenciados via `useState` na tela, nao no form).

**`src/features/sighting/schemas/sighting.schema.ts`**

```typescript
export const sightingSchema = z.object({
  addressHint: z.string().max(500, "Máximo 500 caracteres").optional().or(z.literal("")),
  description: z.string().max(2000, "Máximo 2000 caracteres").optional().or(z.literal("")),
  sightedAt: z.date({ required_error: "Data do avistamento é obrigatória" }).refine(
    (d) => d <= new Date(),
    "Data não pode ser no futuro",
  ),
  sharePhone: z.boolean(),
});
export type SightingFormValues = z.infer<typeof sightingSchema>;
```

`latitude`, `longitude` vem do MapPickerInline state. `reportId` vem do route param.

### Dependencias

- `@react-native-community/datetimepicker` — necessario (nao instalado). Instalar via `npx expo install @react-native-community/datetimepicker`

---

## Nota sobre @react-native-community/datetimepicker

Comportamento por plataforma:
- **iOS:** `display="default"` renderiza inline. Suporta `mode="datetime"`.
- **Android:** sempre abre modal nativo. `mode="datetime"` NAO e suportado — requer dois modals sequenciais (primeiro `mode="date"`, depois `mode="time"`).

O componente `DateTimePickerField` abstrai essa diferenca internamente.

**Cancelamentos parciais no Android:**
- Cancelou data → nao abre hora, mantem valor anterior
- Cancelou hora → mantem valor anterior (data selecionada e descartada)

---

## Decisoes de edge cases

| Cenario | Comportamento |
|---------|---------------|
| Pet inativo ou com report ativo (botao "Pet Perdido") | Ocultar ou desabilitar botao na tela de detalhe |
| petId invalido no route param | Toast + goBack() |
| Permissao de localizacao negada (MapPickerInline) | Mapa abre no DEFAULT_LOCATION. Funcional |
| Submit report falha com 422 | `mapApiErrors` mostra erros nos campos. Erro em `pet_id` mostra Toast (campo nao editavel) |
| Submit sighting falha com 422 | `mapApiErrors` mostra erros nos campos |
| Submit falha com erro generico | Toast "Erro ao reportar..." |
| Report nao encontrado (sighting) | 404 → Toast "Report não encontrado" + voltar |
| Report inativo (sighting) | 404/422 → Toast "Report não está mais ativo" + voltar |
| lost_at no futuro | Validacao Zod bloqueia submit |
| sighted_at no futuro | Validacao Zod bloqueia submit |
| Sighting sem reportId no param | Toast "Report inválido" + goBack() |
| Double-tap no submit | `loading` prop desabilita ButtonPrimary (pattern existente) |
| reportId invalido na success screen | Redirecionar para Home |
| reportId invalido no update | Toast + goBack() |
| Report ja encontrado/cancelado (update) | Toast "Report não está mais ativo" + goBack() |
| Falha no markFound | Toast de erro, manter tela |
| Falha no update report | Toast de erro ou mapApiErrors |
| Usuario sem telefones cadastrados | Mostrar apenas botao "Adicionar telefone" |
| Maximo 5 telefones | Ocultar botao "Adicionar" |
| Phone duplicado (422) | Erro inline no campo do NewPhoneEntry |
| Falha ao salvar/deletar phone | Toast de erro, estado anterior mantido |
| Criar phone com campo vazio | Validar no frontend antes de chamar API |

---

## Sequencia de implementacao

1. Instalar `@react-native-community/datetimepicker` via `npx expo install`
2. Remover `src/app/report-lost/select-pet.tsx` (placeholder antigo)
3. Adicionar `activeReportId` ao tipo `Pet` em `src/types/pet.ts`
4. Adicionar query keys `phones` e `sightings` em `src/constants/query-keys.ts`
5. Criar modulo API `src/services/api/phones.ts`
6. Criar hooks `src/hooks/usePhones.ts` (useUserPhones, useCreatePhone, useUpdatePhone, useDeletePhone)
7. Adicionar `create`, `update`, `markFound` e `createSighting` ao `petReportsApi` em `src/services/api/pet-reports.ts`
8. Adicionar hooks `useCreatePetReport`, `useUpdatePetReport`, `useMarkPetFound` e `useCreateSighting` em `src/hooks/usePetReports.ts`
9. Criar schema `src/features/report-lost/schemas/report-lost.schema.ts`
10. Criar schema `src/features/sighting/schemas/sighting.schema.ts`
11. Criar componente `src/components/ui/DateTimePickerField.tsx`
12. Criar componente `src/components/map/MapPickerInline.tsx`
13. Criar componentes `src/components/report-lost/PhoneEntry.tsx` e `NewPhoneEntry.tsx`
14. Criar componente `src/components/report-lost/PetSummaryCard.tsx`
15. Criar componente `src/components/sighting/ReportPetCard.tsx`
16. Alterar `src/components/pet/PetCard.tsx` — badge "Seguro"/"Perdido"
    Alterar `src/components/pet/PetBasicInfo.tsx` — badge "Seguro"/"Perdido" no detalhe
17. Alterar `src/app/pets/[id]/index.tsx` — layout condicional seguro/perdido (bottom bar + card matches + botao Pet encontrado)
18. Implementar tela de report: `src/app/report-lost/[petId].tsx`
19. Implementar sucesso: `src/app/report-lost/success.tsx`
20. Implementar tela de atualizar report: `src/app/report-lost/update/[reportId].tsx`
21. Implementar sighting form: `src/app/sighting/new.tsx`
22. Implementar sighting sucesso: `src/app/sighting/success.tsx`

---

## Verificacao

- [ ] PetCard mostra badge "Seguro" (verde) para pets sem report ativo
- [ ] PetCard mostra badge "Perdido" (vermelho) para pets com report ativo
- [ ] Badge antigo "Ativo/Inativo" removido do PetCard
- [ ] PetBasicInfo (detalhe) mostra badge "Seguro"/"Perdido" ao lado do nome
- [ ] Pet seguro: botao "Pet Perdido" (vermelho, icone triangle-alert) aparece no bottom bar
- [ ] Pet seguro: tocar "Pet Perdido" navega para tela de report passando petId
- [ ] Pet perdido: botao "Detalhes de Perda" (primary, icone file-text) aparece no bottom bar
- [ ] Pet perdido: tocar "Detalhes de Perda" navega para pet-report/[id] do report ativo
- [ ] Pet perdido: card "Ver Matches" aparece apos notas com icone users e contagem
- [ ] Pet perdido: tocar "Ver Matches" mostra Toast "Em breve" (Fase 10)
- [ ] Pet perdido: botao "Pet encontrado" (outline verde) aparece entre foto e infoCard
- [ ] Pet perdido: tocar "Pet encontrado" abre Dialog de confirmacao (icone check verde, titulo, descricao)
- [ ] Pet perdido: confirmar → PATCH found → Toast sucesso, tela atualiza para estado "Seguro" (some: botao "Pet encontrado", card "Ver Matches", botao "Detalhes de Perda"; aparece: botao "Pet Perdido")
- [ ] Tela de report carrega dados do pet via usePet(petId)
- [ ] MapPickerInline exibe mapa inline (200px) com pin central fixo
- [ ] MapPickerInline inicia na localizacao do usuario (ou DEFAULT_LOCATION se negada)
- [ ] Mover mapa atualiza coordenadas
- [ ] Campo "Referência do local" funciona (opcional, max 500)
- [ ] Summary card mostra foto, nome do pet + "Local marcado no mapa"
- [ ] DateTimePickerField funciona no iOS (mode datetime)
- [ ] DateTimePickerField funciona no Android (date modal + time modal)
- [ ] lost_at default "agora", nao permite futuro
- [ ] Campo descricao funciona (opcional, max 2000, contador caracteres)
- [ ] Secao telefones carrega phones existentes do usuario
- [ ] Phones existentes exibem numero mascarado + toggle WhatsApp + botao delete
- [ ] Toggle WhatsApp atualiza phone via PUT /user/phones/{id}
- [ ] Botao delete remove phone via DELETE /user/phones/{id}
- [ ] Botao "Adicionar telefone" abre NewPhoneEntry
- [ ] Novo phone so e salvo via POST /user/phones ao tocar "Salvar"
- [ ] Cancelar no NewPhoneEntry remove entrada local sem chamar API
- [ ] Maximo 5 telefones (botao oculto ao atingir limite)
- [ ] Mascara de telefone aplicada (phoneMask)
- [ ] Validacoes Zod espelham backend
- [ ] Submit POST /pet-reports envia JSON correto (pet_id, lat, lon, address_hint, description, lost_at ISO)
- [ ] Erros 422 mapeados via mapApiErrors
- [ ] Erro generico mostra Toast
- [ ] Sucesso navega para success screen (replace) com reportId
- [ ] Success mostra circulo verde + check + mensagem
- [ ] Success mostra pet card resumo
- [ ] Botao "Ver report" navega para pet-report/[id] (replace)
- [ ] Link "Voltar ao mapa" navega para Home (replace)
- [ ] Guard: reportId invalido na success redireciona para Home
- [ ] Cache invalidado: petReports (mapa/lista) + pets apos create report
- [ ] Atualizar Report: carrega dados existentes do report (pre-preenche campos)
- [ ] Atualizar Report: summary card do pet read-only (foto, nome, especie, raca)
- [ ] Atualizar Report: mapa pre-posicionado no local do report
- [ ] Atualizar Report: pode mudar local, data, descricao, referencia
- [ ] Atualizar Report: secao telefones funciona (mesma logica do create)
- [ ] Atualizar Report: "Salvar alterações" envia PUT /pet-reports/{id}
- [ ] Atualizar Report: erros 422 mapeados via mapApiErrors
- [ ] Atualizar Report: sucesso mostra Toast + goBack()
- [ ] Atualizar Report: cache invalidado apos update
- [ ] Delete phone mostra Dialog de confirmacao (icone trash vermelho, titulo, descricao)
- [ ] Confirmar delete phone → DELETE /user/phones/{id}
- [ ] Sighting: recebe reportId via query param
- [ ] Sighting: reportId invalido mostra Toast e volta
- [ ] Sighting: carrega dados do report (mini-card do pet)
- [ ] Sighting: MapPickerInline funciona para local do avistamento
- [ ] Sighting: addressHint funciona (opcional, max 500)
- [ ] Sighting: description funciona (opcional, max 2000)
- [ ] Sighting: DateTimePickerField funciona (default agora, max agora)
- [ ] Sighting: toggle sharePhone funciona (default false)
- [ ] Sighting: submit POST envia JSON correto
- [ ] Sighting: erros 422 mapeados corretamente
- [ ] Sighting: sucesso navega para success (replace)
- [ ] Sighting success mostra "Voltar ao mapa"
- [ ] Cache invalidado: petReports.detail(reportId) apos create sighting
- [ ] Botao submit desabilitado durante mutation (loading)
- [ ] JSON puro em ambos fluxos (nenhum upload de arquivo)
- [ ] select-pet.tsx removido
