# Fase 11: Menu (Settings)

Referência visual (Pencil): Node `Tt84P` (menu principal), Node `MCiJQ` (meus telefones), Node `8z0wo` (notificações), Node `9J5PL` (meus pets perdidos), Node `mgbOs` (meus avistamentos)

---

## Pré-requisitos já implementados

- **Tela:** `src/app/(tabs)/settings.tsx` — skeleton funcional com profile card, itens placeholder, logout com Dialog
- **Tab layout:** `src/app/(tabs)/_layout.tsx` — ícone `Settings`, título "Config"
- **Hooks:** `useLogout()`, `useChangePassword()`, `useUserPhones()`, `useCreatePhone()`, `useUpdatePhone()`, `useDeletePhone()`
- **Schema:** `changePasswordSchema` + `ChangePasswordFormData` em `src/features/auth/schemas/change-password.schema.ts`
- **Componentes:** `PhoneFormDialog`, `PhoneEntry`, `NavHeader`, `PasswordInput`, `ButtonPrimary`, `Dialog`, `BottomSheetModal`, `EmptyState`, `Skeleton`, `PetPhotoPlaceholder`, `WhatsAppIcon`
- **Utils:** `phoneMask`, `mapApiErrors`, `formatDate`, `relativeTime`, `speciesLabel`, `sizeLabel`
- **Stores:** `useAuthStore` (user: id, name, email, role, avatarUrl), `useToastStore`

---

## Decisão de navegação

Todas as sub-telas do Menu serão Stack screens dentro de um grupo `(menu)/`, sem tab bar. Consistente com o padrão do app (detalhe de pet, report, sighting — todos push sem tab bar).

---

## Etapa 1 — Renomear tab e atualizar tela principal

### `src/app/(tabs)/_layout.tsx`

- Icon: `Settings` → `Menu` (lucide) — segue o design Pencil (Node Tt84P usa ícone `menu`)
- Title: `"Config"` → `"Menu"`

### `src/app/(tabs)/settings.tsx`

- Título: `"Configurações"` → `"Menu"`
- Remover `Alert` e `showComingSoon`
- Adicionar `useRouter` para navegação
- **Recomendação:** organizar itens de cada seção em array `{ icon, label, onPress, rightElement?, danger? }` para reduzir repetição no JSX
- Seção "MEUS DADOS" — 4 itens:
  1. `Search` — "Meus pets perdidos" → `router.push("/(menu)/my-lost-pets")`
  2. `Eye` — "Meus avistamentos" → `router.push("/(menu)/my-sightings")`
  3. `Phone` — "Telefones" → `router.push("/(menu)/phones")`
  4. `Lock` — "Alterar senha" → `router.push("/(menu)/change-password")`
- Seção "NOTIFICAÇÕES":
  - `Bell` — "Configurar notificações" → `router.push("/(menu)/notification-settings")`
- Seção "SOBRE": inalterada (Versão do app 1.0.0)
- Seção "SAIR": inalterada (logout com Dialog)

---

## Etapa 2 — Grupo de rotas `(menu)`

### `src/app/(menu)/_layout.tsx` (novo)

Stack layout com `headerShown: false`. Mesmo padrão de `(reports)/_layout.tsx`.

---

## Etapa 3 — Tela de Telefones

### `src/components/menu/PhoneCard.tsx` (novo)

Card dedicado (diferente do `PhoneEntry` inline usado em forms):
- Número bold 16 (`phoneMask` — já usado em `PhoneEntry` para display, funciona para cards)
- Badge "Principal" (bg `#43A04715`, text success, font-montserrat-medium text-[11px]) se `isPrimary`
- Badge label (bg `#AD4FFF15`, text primary) se `phone.label`
- `WhatsAppIcon` se `isWhatsapp`
- Borda esquerda verde 3px se `isPrimary`
- Ícone `EllipsisVertical` → abre `BottomSheetModal` com opções: Editar, Excluir, e "Definir como principal" (ocultar esta opção se já for o principal)
- Card: rounded-12, white bg, shadow, padding 16

### `src/app/(menu)/phones.tsx` (novo)

- `NavHeader` "Meus Telefones"
- Estado local: `selectedPhone` (para ações) + `actionSheetVisible` (para o BottomSheetModal)
- Lista de `PhoneCard` via `useUserPhones()`
- Botão "Adicionar telefone": rounded-12, bg-background, border, icon `Plus` + texto primary, h-[56]
  - Desabilitado visualmente se 5 phones + texto auxiliar "Máximo de 5 telefones" abaixo do botão
- Reutiliza `PhoneFormDialog` para criar/editar
- `Dialog` para confirmação de exclusão
- "Definir como principal": reutiliza `useUpdatePhone()` enviando `{ is_primary: true }`. Backend garante unicidade — invalida `["phones"]` após sucesso
- **Delete do phone principal:** confirmar com backend se outro phone é promovido automaticamente ou fica sem principal. No front, apenas invalidar e mostrar resultado atualizado
- Empty state: ícone Phone + "Nenhum telefone cadastrado"
- Loading: 3 skeleton cards

Hooks reutilizados: `useUserPhones()`, `useCreatePhone()`, `useUpdatePhone()`, `useDeletePhone()`

---

## Etapa 4 — Tela Alterar Senha

### `src/app/(menu)/change-password.tsx` (novo)

- `NavHeader` "Alterar senha"
- Form com `useForm<ChangePasswordFormData>` + `zodResolver(changePasswordSchema)`
- 3 campos `PasswordInput` via Controller:
  1. `current_password` — "Senha atual"
  2. `password` — "Nova senha"
  3. `password_confirmation` — "Confirmar nova senha"
- `ButtonPrimary` "Alterar senha" com `loading={mutation.isPending}` (bloqueia múltiplos submits — `ButtonPrimary` já faz `disabled={disabled || loading}`)
- `useChangePassword()` mutation
- Sucesso: toast "Senha alterada com sucesso" + `router.back()`
- Erro 422: `mapApiErrors` nos campos (ex: `current_password` incorreta → erro inline)
- Erro genérico: toast
- `handleSubmit(onSubmit, () => showToast("Preencha os campos obrigatórios", "error"))` — segundo callback padrão

Reutiliza: `changePasswordSchema`, `useChangePassword()`, `PasswordInput`, `NavHeader`, `ButtonPrimary`, `mapApiErrors`

---

## Etapa 5 — Tela Configurar Notificações

**Confirmado:** GET `/user/notification-settings` e PUT `/user/notification-settings` (partial update, snake_case no body). Response em camelCase (via Laravel Resource).

### `src/types/notification-settings.ts` (novo)

```ts
export interface NotificationSettings {
  id: number;
  notifyLostNearby: boolean;
  notifyMatches: boolean;
  notifySightings: boolean;
  nearbyRadiusKm: number;
  location: { latitude: number; longitude: number } | null;
  createdAt: string;
  updatedAt: string;
}
```

**Nota:** `nearbyRadiusKm` e `location` estão disponíveis no backend mas o design atual (Node 8z0wo) não mostra UI para configurá-los. Armazenar no type para uso futuro, exibir apenas os 3 toggles nesta fase.

### `src/services/api/notifications.ts` — adicionar

```ts
/** Ler preferências de notificação */
getSettings: () =>
  api.get<ResourceResponse<NotificationSettings>>("/user/notification-settings"),

/** Atualizar preferências (partial update, snake_case no body, response camelCase) */
updateSettings: (data: {
  notify_lost_nearby?: boolean;
  notify_matches?: boolean;
  notify_sightings?: boolean;
}) =>
  api.put<ResourceResponse<NotificationSettings>>("/user/notification-settings", data),
```

### `src/hooks/useNotificationSettings.ts` (novo)

- `useNotificationSettings()` — `useQuery`, `select: (r) => r.data.data`
- `useUpdateNotificationSettings()` — `useMutation` com optimistic update:
  - `onMutate`: snapshot completo do objeto, atualizar cache com novo valor
  - `onError`: rollback para snapshot + toast "Erro ao atualizar preferência"
  - `onSettled`: invalidate
  - **Proteção contra race condition:** estado `pendingField: "notifyLostNearby" | "notifyMatches" | "notifySightings" | null`. Setar antes do mutate, limpar no `onSettled`. Cada toggle recebe `disabled={pendingField === field}`

### `src/components/menu/NotificationToggle.tsx` (novo)

Props: `icon: React.ReactNode`, `title: string`, `description: string`, `value: boolean`, `onValueChange: (v: boolean) => void`, `disabled?: boolean`

Layout:
- Container: padding 16
- Top row: flex-row, justify-between, items-center
  - Left: flex-row, gap-10, items-center → ícone 24px + título (font-montserrat-medium text-[15px] text-text-primary)
  - Right: Switch (trackColor false="#E2E2E2" true=colors.primary, thumbColor="#FFFFFF")
- Descrição: font-montserrat text-xs text-text-tertiary, mt-2

### `src/app/(menu)/notification-settings.tsx` (novo)

- `NavHeader` "Notificações"
- Grupo branco rounded-12 overflow-hidden com 3 `NotificationToggle` + dividers (h-px bg-background):
  1. `Bell` — "Pet perdido próximo" / "Receba avisos quando um pet for reportado como perdido na sua região"
  2. `Sparkles` — "Matches encontrados" / "Receba avisos quando o sistema encontrar matches para seus reports"
  3. `Eye` — "Avistamento reportado" / "Receba avisos quando alguém reportar ter visto seu pet perdido"
- Footer: "As notificações push dependem das permissões do dispositivo" (centered, text-tertiary, 12px)
- Loading: 3 skeleton toggles (h-[80px] cada)

---

## Etapa 6 — Tela Meus Pets Perdidos

**Confirmado:** GET `/pet-reports?status=LOST` — filtra automaticamente pelo usuário autenticado. Paginado. Query params opcionais: `page`, `per_page`, `pet_id`, `species`, `size`.

Response inclui `pet` (com name, species, size, breed, photos), `matchesCount`, `sightingsCount`, `status`.

### `src/services/api/pet-reports.ts` — adicionar

```ts
/** Listar reports LOST do usuário autenticado */
listMyLostReports: (page: number = 1) =>
  api.get<PaginatedResponse<PetReport>>("/pet-reports", {
    params: { status: "LOST", page },
  }),
```

**Nota:** nome `listMyLostReports` (não `listMyReports`) porque o endpoint filtra `status=LOST`. Se no futuro precisar listar reports com outros status, criar método separado.

### `src/hooks/useMyLostPets.ts` (novo)

`useMyLostPets()` — `useInfiniteQuery`, flatten pages em `items`. Mesmo padrão de `usePetSightingsList`.

### `src/components/menu/LostPetCard.tsx` (novo)

**A lista representa reports LOST do usuário. O card mostra dados do `report.pet`, mas a navegação é pelo `report.id`.**

- Pressable `active:opacity-80`, rounded-16, white bg, border border, padding 12, gap 12, flex-row, items-center
- Foto 64px rounded-12: `Image` do `report.pet.photos[0]?.url` com `onError` fallback, ou `PetPhotoPlaceholder` se sem foto
- View flex-1 gap-0.5:
  - Row flex-row items-center gap-2: nome bold 16 + badge "Perdido" (bg `#E5393520`, text error, font-montserrat-medium text-[11px], rounded-[8], px-2 py-0.5)
  - `speciesLabel[pet.species]` · `sizeLabel[pet.size]` (font-montserrat text-[13px] text-text-secondary)
  - `pet.breed?.name` (font-montserrat text-xs text-text-tertiary, se existir)
- `ChevronRight` 20px color text-tertiary

### `src/app/(menu)/my-lost-pets.tsx` (novo)

- `NavHeader` "Meus Pets Perdidos"
- FlatList com infinite scroll (`onEndReached`, `onEndReachedThreshold: 0.5`)
- Pull-to-refresh via `RefreshControl` (`tintColor={colors.primary}`)
- Footer: `ActivityIndicator` se `isFetchingNextPage`
- Press → `router.push({ pathname: "/(reports)/[id]", params: { id: String(report.id) } })` — navega pelo **report.id**, não pet.id
- Empty state: ícone Search + "Nenhum pet perdido"
- Loading: 4 skeleton cards (h-[88px])

---

## Etapa 7 — Tela Meus Avistamentos

**Confirmado:** GET `/pet-sightings/my` — retorna avistamentos do usuário autenticado, ordenados por mais recente. Paginado. Query params: `page`, `per_page`.

Response é `PetSighting` padrão (id, title, species, photos, addressHint, sightedAt, etc.).

### `src/services/api/pet-sightings.ts` — adicionar

```ts
/** Listar avistamentos do usuário autenticado */
listMySightings: (page: number = 1) =>
  api.get<PaginatedResponse<PetSighting>>("/pet-sightings/my", {
    params: { page },
  }),
```

### `src/hooks/useMySightings.ts` (novo)

`useMySightings()` — `useInfiniteQuery`, flatten pages em `items`.

### `src/components/menu/SightingCard.tsx` (novo)

- Pressable `active:opacity-80`, rounded-16, white bg, border border, padding 12, gap 12, flex-row, items-center
- Foto 64px rounded-12: `Image` com fallback ou `PetPhotoPlaceholder` com species
- View flex-1 gap-0.5:
  - Título (font-montserrat-semibold text-[15px] text-text-primary)
  - Row flex-row items-center gap-1: `MapPin` 12px text-tertiary + addressHint (font-montserrat text-xs text-text-tertiary, numberOfLines=1). Omitir se null
  - Data: `"Avistado em " + formatDate(sightedAt)` (font-montserrat text-xs text-text-tertiary — default de `formatDate` já é `"dd/MM/yyyy"`)
- `ChevronRight` 16px color border

### `src/app/(menu)/my-sightings.tsx` (novo)

- `NavHeader` "Meus Avistamentos"
- FlatList com infinite scroll, pull-to-refresh
- Press → `router.push({ pathname: "/(sightings)/[id]", params: { id: String(sighting.id) } })`
- Empty state: ícone Eye + "Nenhum avistamento"
- Loading: 4 skeleton cards (h-[88px])

---

## Query Keys

### `src/constants/query-keys.ts` — adicionar

```ts
// Já existe:
// phones: { all: ["phones"] as const }

// Adicionar:
notificationSettings: {
  all: ["notificationSettings"] as const,
},
myLostReports: {
  all: ["myLostReports"] as const,
  list: () => ["myLostReports", "list"] as const,
},
mySightings: {
  all: ["mySightings"] as const,
  list: () => ["mySightings", "list"] as const,
},
```

---

## Arquivos

| Arquivo | Ação |
|---------|------|
| `src/app/(tabs)/_layout.tsx` | Alterar (icon Menu, title "Menu") |
| `src/app/(tabs)/settings.tsx` | Alterar (título, novos itens, navegação, array de itens) |
| `src/app/(menu)/_layout.tsx` | Criar (Stack layout) |
| `src/app/(menu)/phones.tsx` | Criar |
| `src/app/(menu)/change-password.tsx` | Criar |
| `src/app/(menu)/notification-settings.tsx` | Criar |
| `src/app/(menu)/my-lost-pets.tsx` | Criar |
| `src/app/(menu)/my-sightings.tsx` | Criar |
| `src/components/menu/PhoneCard.tsx` | Criar |
| `src/components/menu/NotificationToggle.tsx` | Criar |
| `src/components/menu/LostPetCard.tsx` | Criar |
| `src/components/menu/SightingCard.tsx` | Criar |
| `src/types/notification-settings.ts` | Criar |
| `src/hooks/useNotificationSettings.ts` | Criar |
| `src/hooks/useMyLostPets.ts` | Criar |
| `src/hooks/useMySightings.ts` | Criar |
| `src/services/api/notifications.ts` | Alterar (add getSettings/updateSettings) |
| `src/services/api/pet-reports.ts` | Alterar (add listMyLostReports) |
| `src/services/api/pet-sightings.ts` | Alterar (add listMySightings) |
| `src/constants/query-keys.ts` | Alterar (add notificationSettings, myReports, mySightings) |

## Componentes reutilizados

| Componente | Path |
|------------|------|
| `NavHeader` | `src/components/ui/NavHeader.tsx` |
| `PasswordInput` | `src/components/ui/PasswordInput.tsx` |
| `ButtonPrimary` | `src/components/ui/ButtonPrimary.tsx` |
| `Dialog` | `src/components/ui/Dialog.tsx` |
| `BottomSheetModal` | `src/components/ui/BottomSheetModal.tsx` |
| `PhoneFormDialog` | `src/components/shared/phone/PhoneFormDialog.tsx` |
| `PetPhotoPlaceholder` | `src/components/shared/PetPhotoPlaceholder.tsx` |
| `WhatsAppIcon` | `src/components/shared/WhatsAppIcon.tsx` |
| `EmptyState` | `src/components/ui/EmptyState.tsx` |
| `Skeleton` | `src/components/ui/Skeleton.tsx` |

## Confirmações do backend (todas resolvidas)

1. **Meus Pets Perdidos:** `GET /pet-reports?status=LOST` — filtra pelo usuário autenticado automaticamente. Inclui `pet` eager-loaded com `name`, `species`, `size`, `breed`, `photos`. Campos extras: `matchesCount`, `sightingsCount`
2. **Meus Avistamentos:** `GET /pet-sightings/my` — retorna sightings do usuário, ordenados por mais recente. Response é `PetSighting` padrão
3. **Notificações:** `GET /user/notification-settings` (retorna defaults se nunca configurou, response camelCase) e `PUT /user/notification-settings` (partial update, body snake_case, response camelCase). Campos extras disponíveis: `nearbyRadiusKm`, `location` (não usados no design atual)

## Decisões

1. **Ícone da tab:** `Menu` (lucide) conforme design Pencil. Se preferir semântica diferente, alternativas: `CircleUser`, `UserRoundCog`
2. **Nome do método API:** `listMyLostReports` (não `listMyReports`) — honesto com o filtro `status=LOST`
3. **SightingCard data:** `formatDate(sightedAt, "dd/MM/yyyy")` com prefixo "Avistado em" — conforme design Pencil que mostra data absoluta
4. **Optimistic update nos toggles:** desabilitar o toggle específico durante mutation para evitar race condition em taps rápidos. Rollback via snapshot completo do objeto
5. **Limite de phones:** botão desabilitado + texto auxiliar "Máximo de 5 telefones" (sem toast — é estado previsível)
6. **LostPetCard:** card mostra dados do `pet`, mas navegação usa `report.id` — documentado explicitamente
7. **Itens do menu em array:** organizar por seção para reduzir repetição no JSX do settings.tsx

## Verificação

- `npx tsc --noEmit` sem erros
- Tab "Menu" com ícone `Menu` e label corretos
- Tela principal com título "Menu" e 4 itens em "MEUS DADOS" + 1 em "NOTIFICAÇÕES"
- Navegação funciona para todas as 5 sub-telas (4 de MEUS DADOS + 1 de NOTIFICAÇÕES)
- Telefones: CRUD completo, badges, borda verde principal, max 5 com texto auxiliar
- Telefones: selectedPhone + actionSheet controlados, "Definir como principal" funciona
- Alterar senha: validação Zod, erros inline (ex: senha atual incorreta), toast sucesso + back
- Alterar senha: botão bloqueado durante loading
- Notificações: 3 toggles com optimistic update, toggle desabilitado durante save
- Notificações: footer "push dependem das permissões" presente
- Notificações: loading mostra 3 skeletons
- Meus Pets Perdidos: lista paginada, cards com badge "Perdido", empty state
- Meus Pets Perdidos: press navega pelo report.id (não pet.id)
- Meus Avistamentos: lista paginada, cards com local/data, empty state
- Meus Avistamentos: loading mostra 4 skeletons
- Logout continua funcionando com Dialog
- Back navigation funciona em todas as sub-telas
