# Fase 12: Notificações + Push

Referência visual (Pencil): Node `JAuw8` (lista com notificações), Node `76mbe` (estado vazio)

---

## Pré-requisitos já implementados

- **Type:** `src/types/notification.ts` — `NotificationType`, `Notification`
- **Tab:** `src/app/(tabs)/alerts.tsx` — placeholder existente (será substituído pela lista)
- **Tab layout:** `src/app/(tabs)/_layout.tsx` — ícone `Bell` já configurado
- **Toast:** `useToastStore` + `ToastProvider` para feedback de ações
- **Providers:** `AppProviders.tsx` com `QueryClientProvider`, `BottomSheetModalProvider`
- **Componentes UI:** `EmptyState`, `Skeleton`, `NavHeader`, `Dialog`, `ButtonPrimary`, `ButtonSecondary`
- **Utils:** `relativeTime` (`src/utils/relative-time.ts`)

---

## Contrato do backend

### Notificações existentes

O backend (Laravel) dispara 4 notificações via database + push (OneSignal em prod, log em dev). Cada notificação respeita as preferências do `UserNotificationSetting`.

| Notificação | Trigger | Quem recebe | Preferência |
|---|---|---|---|
| `PetMatchesFound` | Match automático: avistamento livre (score >= 30, raio 25km) ou match reverso ao criar report | Dono do report | `notify_matches` |
| `PetReportSightingReported` | Alguém avista um pet específico de um report (`POST /pet-reports/{id}/sightings`) | Dono do report | `notify_sightings` |
| `PetLostNearby` | Novo report criado, job notifica usuários próximos no raio configurado | Usuários próximos | `notify_lost_nearby` |
| `PetSightingClaimed` | Dono de pet clama um avistamento (`POST /pet-sightings/{id}/claim`) | Autor do avistamento | `notify_sightings` |

### Fluxo de disparo

```
POST /pet-sightings (avistamento livre)
  → ProcessSightingMatching (job)
    → Score >= 30 → PetMatch
    → 🔔 PetMatchesFound → dono do report

POST /pet-reports/{id}/sightings (avistamento de report)
  → StorePetReportSighting (action)
    → Verifica duplicata (5 min)
    → 🔔 PetReportSightingReported → dono do report

POST /pet-reports (novo report)
  → Job 1: ProcessReportSightingMatching
    → Score >= 30 → PetMatch
    → 🔔 PetMatchesFound → dono do report
  → Job 2: NotifyNearbyUsersOfLostPet
    → 🔔 PetLostNearby → usuários próximos

POST /pet-sightings/{id}/claim (clamar avistamento)
  → Primeira chamada: cria claim + 🔔 PetSightingClaimed → autor do avistamento
  → Chamadas seguintes: retorna mesmos dados, sem reenviar notificação (idempotente)
```

**Nota:** o endpoint de claim (`POST /pet-sightings/{id}/claim`), seu contrato completo e implementação no frontend estão no **plan 013 (Claim de Avistamento)**. Esta fase conhece `pet_sighting_claimed` apenas como tipo de notificação (ícone, label, destino de navegação).

### Formato do campo `type`

**Decisão:** o backend deve serializar `type` em formato curto estável (`pet_lost_nearby`, `matches_found`, `pet_report_sighting_reported`, `pet_sighting_claimed`). O frontend não deve depender de FQCN do Laravel. Se o formato for diferente, criar mapper no `notificationsApi.list`.

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/user/notifications` | Lista paginada |
| PATCH | `/user/notifications/{id}/read` | Marcar como lida |
| PATCH | `/user/notifications/read-all` | Marcar todas como lidas |
| GET | `/user/notifications/unread-count` | Contagem de não lidas |
| POST | `/user/devices` | Registrar device push |
| DELETE | `/user/devices/{id}` | Remover device |

---

## Etapa 1 — Infraestrutura (Types, API, Query Keys, Hook)

### 1.1 Atualizar Types

**Arquivo:** `src/types/notification.ts` — atualizar:

```ts
export type NotificationType =
  | "pet_lost_nearby"
  | "matches_found"
  | "pet_report_sighting_reported"
  | "pet_sighting_claimed";

// Campos dentro de data vêm em snake_case (direto do toArray() do Laravel).
// Campos do envelope (readAt, createdAt) são camelCase (via Resource).
// Nota: NÃO existe title/body genérico no data — o card monta o texto
// a partir dos campos específicos de cada tipo.
export interface NotificationData {
  // pet_lost_nearby
  report_id?: number | null;
  pet_name?: string | null;
  pet_species?: string | null;
  address_hint?: string | null;
  distance_km?: number | null;
  // matches_found
  // report_id, pet_name (acima)
  matches_count?: number | null;
  // pet_report_sighting_reported
  sighting_id?: number | null;
  // report_id, pet_name, address_hint (acima)
  sighted_at?: string | null;
  // pet_sighting_claimed
  // sighting_id (acima)
  sighting_title?: string | null;
  claimer_name?: string | null;
  claimer_phone?: string | null;
  claimer_phone_is_whatsapp?: boolean | null;
}

export interface Notification {
  id: string;
  type: NotificationType;
  data: NotificationData;
  readAt: string | null;
  createdAt: string;
}
```

**Nota:** campos de navegação são defensivos (`| null`). O frontend deve tolerar ausência — se faltar `report_id`, não navega e só marca como lida + mostra toast "Não foi possível abrir".

**Evolução futura:** se o número de tipos crescer, considerar union discriminada por `type` (cada tipo com seu `data` tipado) para eliminar campos opcionais e pegar erros em compile-time. Para 4 tipos, o shape flat com optionals é aceitável.

**Arquivo:** `src/types/device.ts` (novo):

```ts
export type DevicePlatform = "IOS" | "ANDROID";

export interface Device {
  id: number;
  deviceToken: string;
  platform: DevicePlatform;
  deviceName: string;
  createdAt: string;
}
```

**Confirmado:** `platform` aceita exatamente `"IOS"` e `"ANDROID"` (uppercase, validado via `Rule::in()`).

### 1.2 Labels

**Arquivo:** `src/constants/enums.ts` — adicionar:

```ts
import type { NotificationType } from "@/types/notification";

export const notificationTypeLabel: Record<NotificationType, string> = {
  pet_lost_nearby: "Pet perdido por perto",
  matches_found: "Matches encontrados",
  pet_report_sighting_reported: "Avistamento do seu pet",
  pet_sighting_claimed: "Alguém reconheceu seu avistamento",
};
```

### 1.3 Query Keys

**Arquivo:** `src/constants/query-keys.ts` — adicionar:

```ts
notifications: {
  all: ["notifications"] as const,
  list: () => ["notifications", "list"] as const,
  unreadCount: () => ["notifications", "unreadCount"] as const,
},
```

### 1.4 Módulo API

**Arquivo:** `src/services/api/notifications.ts` (novo)

```ts
export const notificationsApi = {
  // Listar notificações (paginado)
  list: (page: number = 1) =>
    api.get<PaginatedResponse<Notification>>("/user/notifications", {
      params: { page },
    }),

  // Marcar como lida
  markRead: (id: string) =>
    api.patch(`/user/notifications/${id}/read`),

  // Marcar todas como lidas
  markAllRead: () =>
    api.patch("/user/notifications/read-all"),

  // Contagem de não lidas
  unreadCount: () =>
    api.get<ResourceResponse<{ count: number }>>("/user/notifications/unread-count"),

  // Registrar device para push
  registerDevice: (data: { deviceToken: string; platform: DevicePlatform; deviceName: string }) =>
    api.post<ResourceResponse<Device>>("/user/devices", {
      device_token: data.deviceToken,
      platform: data.platform,
      device_name: data.deviceName,
    }),

  // Remover device (logout)
  removeDevice: (id: number) =>
    api.delete(`/user/devices/${id}`),
};
```

**Nota:** o endpoint de claim (`POST /pet-sightings/{id}/claim`) e sua implementação no frontend (API, hook, modal de contato) estão detalhados no **plan 013 (Claim de Avistamento)**.

**Confirmado:** o backend retorna `type` como alias curto (ex: `pet_lost_nearby`) via `TYPE_MAP` no `DatabaseNotificationResource` — não precisa de mapper. Campos do envelope (`id`, `type`, `readAt`, `createdAt`) são camelCase. Campos dentro de `data` são **snake_case** (direto do `toArray()` do Laravel). A response de `GET /user/notifications` é paginada padrão Laravel (`meta.current_page`, `meta.last_page`, `data[]`). Suporta `?page=N`, `?per_page=N` (default 10), `?sort=column:direction`, `?unread=true`. Backend faz upsert de device por `device_token` (`updateOrCreate`) — front não precisa deduplicar.

### 1.5 Hook

**Arquivo:** `src/hooks/useNotifications.ts` (novo)

- `useNotifications()` — `useInfiniteQuery`, `initialPageParam: 1`. Paginação via `getNextPageParam`: usar `meta.current_page < meta.last_page ? meta.current_page + 1 : undefined` (mesmo padrão de `usePetSightingsList`). O hook expõe `notifications` achatado via `data?.pages.flatMap(p => p.data.data) ?? []` (computado fora do `select`, para preservar `pages`/`pageParams`/`hasNextPage`). A tela não deve acessar `data.pages` diretamente — usar apenas o que o hook expõe:
  ```ts
  return { ...query, notifications };
  // A tela usa: notifications, isLoading, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage
  ```
- `useUnreadCount()` — `useQuery`, `select: (r) => r.data.data.count`. Refetch a cada 30s (`refetchInterval: 30_000`) como **fallback de sincronização** — a fonte principal de atualização é a invalidação ao receber push. O polling garante recuperação caso push falhe ou app fique em foreground sem receber push
- `useMarkRead()` — `useMutation`, invalida `["notifications"]` (lista e count)
- `useMarkAllRead()` — `useMutation`, invalida `["notifications"]`. Sem update otimista nesta fase — estado sincronizado por invalidação após sucesso

### 1.6 Helper de navegação por notificação

**Arquivo:** `src/utils/notification-route.ts` (novo)

Função centralizada para resolver a rota de uma notificação. Usada em 3 lugares: tap no card da lista, response listener do push, e deep link.

```ts
export function getNotificationRoute(
  type: NotificationType,
  data: NotificationData,
): { pathname: string; params: Record<string, string> } | null {
  switch (type) {
    case "pet_lost_nearby":
    case "pet_report_sighting_reported":
      // pet_report_sighting_reported leva ao report porque o dono quer ver
      // o report impactado, não o avistamento em si.
      if (!data.report_id) return null;
      return {
        pathname: "/(reports)/[id]",
        params: { id: String(data.report_id) },
      };
    case "matches_found":
      if (!data.report_id) return null;
      return {
        pathname: "/(matches)/matches/[reportId]",
        params: { reportId: String(data.report_id) },
      };
    case "pet_sighting_claimed":
      // Autor do avistamento recebe notificação de que alguém clamou.
      // Navega para o detalhe do avistamento.
      if (!data.sighting_id) return null;
      return {
        pathname: "/(sightings)/[id]",
        params: { id: String(data.sighting_id) },
      };
    default:
      return null;
  }
}
```

**Comportamento quando `getNotificationRoute` retorna `null`:** não navegar, só marcar como lida e mostrar toast "Não foi possível abrir esta notificação".

---

## Etapa 2 — Tela Lista de Notificações

**Arquivo:** `src/app/(tabs)/alerts.tsx` — substituir placeholder

Conforme design Node JAuw8:

Layout:
- `Screen` com `scroll=false` (FlatList gerencia scroll)
- NavHeader com título "Notificações" (`font-montserrat-medium text-lg`) e botão "Marcar todas" (texto `text-primary`, `font-montserrat-medium text-[13px]`, `active:opacity-60`):
  - Visível apenas se `unreadCount > 0`
  - Desabilitado enquanto mutation `markAllRead` roda (`disabled={isMarkingAll}`)
  - Texto muda para "Marcando..." durante loading
- FlatList com infinite scroll (`onEndReached`, `onEndReachedThreshold: 0.5`)
- Separador: `<View className="h-px bg-border" />` entre cada card
- Pull-to-refresh via `RefreshControl` (`tintColor={colors.primary}`)
- Footer: `ActivityIndicator` se `isFetchingNextPage`
- Loading: 4 skeleton cards (altura ~72px cada, simula ícone + 2 linhas de texto)
- Header visível enquanto carrega (só o conteúdo da lista é skeleton)
- Lista linear simples, sem agrupamento por data (Hoje/Ontem/Mais antigas). Cada card exibe tempo relativo individual

### Estado vazio (Node 76mbe)

- Ícone `BellOff` (40px, `color="#E2E2E2"`) dentro de circle 80px (`bg-background`, `rounded-full`)
- Título: "Nenhuma notificação" (`font-montserrat-bold text-base text-text-primary`, `text-center`)
- Descrição: "Quando algo importante acontecer, você verá aqui" (`font-montserrat text-[13px] text-text-secondary`, `text-center`, padding horizontal 48px)

### Estado de erro

- Texto: "Erro ao carregar notificações" (`font-montserrat text-sm text-text-secondary`, `text-center`)
- Botão "Tentar novamente" (`ButtonSecondary`, chama `refetch()`)
- Centralizado verticalmente

### 2.1 Componente NotificationCard

**Arquivo:** `src/components/notification/NotificationCard.tsx` (novo)

Props:
```ts
interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
}
```

Conforme design Nodes is5Mh (não lida) e dPwGJ (lida):

Layout:
- `Pressable` com `active:opacity-80`, padding `[12, 16]`, gap 12, flex-row
- **Não lida** (`readAt === null`):
  - Background: `bg-surface` (branco)
  - Borda esquerda: 3px `border-primary` (stroke left `#FFA001`)
  - Dot indicador: 8px × 8px, `bg-primary`, `rounded-[4px]`, alinhado ao centro vertical
  - Título: `font-montserrat-medium text-sm text-text-primary`
- **Lida** (`readAt !== null`):
  - Background: `bg-background` (`#F8F8F8`)
  - Sem borda esquerda, sem dot
  - Título: `font-montserrat-medium text-sm text-text-secondary`
- Corpo: `font-montserrat text-[13px] text-text-secondary` (não lida) ou `text-text-tertiary` (lida), `lineHeight: 1.3`, `numberOfLines={2}`
- Tempo relativo: `font-montserrat text-xs text-text-tertiary` — usar `relativeTime`

**Textos do card** — montados no frontend a partir dos campos do `data` (não existe `title`/`body` genérico no database record):
- `pet_lost_nearby`: título = `notificationTypeLabel[type]`, corpo = `"{pet_name}, {pet_species}, foi reportado como perdido próximo à sua localização"`
- `matches_found`: título = `notificationTypeLabel[type]`, corpo = `"Encontramos {matches_count} possíveis matches para {pet_name}"`
- `pet_report_sighting_reported`: título = `"Alguém avistou seu pet!"`, corpo = `"Um usuário reportou ter visto {pet_name} próximo à {address_hint}"`
- `pet_sighting_claimed`: título = `notificationTypeLabel[type]`, corpo = `"{claimer_name} reconheceu o pet que você avistou"`
- Ícone por tipo à esquerda (circle 40px, rounded-[20px]):
  - `pet_lost_nearby`: `MapPin` (20px, `#E53935`), bg `#E5393515`
  - `matches_found`: `Sparkles` (20px, `#FFA001`), bg `#AD4FFF15`
  - `pet_report_sighting_reported`: `Eye` (20px, `#FFA001`), bg `#FFA00115`
  - `pet_sighting_claimed`: `Heart` (20px, `#43A047`), bg `#43A04715`

### 2.2 Navegação ao tap

Usa `getNotificationRoute()` do helper centralizado.

| Tipo | Destino | Dados necessários |
|------|---------|-------------------|
| `pet_lost_nearby` | Detalhe do report | `data.report_id` |
| `matches_found` | Lista de matches do report | `data.report_id` |
| `pet_report_sighting_reported` | Detalhe do report (que recebeu o avistamento) | `data.report_id` |
| `pet_sighting_claimed` | Detalhe do avistamento (que foi clamado) | `data.sighting_id` |

**`pet_report_sighting_reported` navega para o report (não para o sighting)** porque o destinatário é o dono do report — ele quer ver o estado do seu report, não o avistamento isolado. O campo `sightingId` fica disponível para uso futuro (ex: scroll até o sighting dentro do report).

**Comportamento do tap — encapsular num handler na tela:**

```ts
function handleNotificationPress(notification: Notification) {
  if (!notification.readAt) {
    markRead.mutate(notification.id); // fire-and-forget
  }

  const route = getNotificationRoute(notification.type, notification.data);

  if (!route) {
    showToast("Não foi possível abrir esta notificação", "error");
    return;
  }

  router.push(route);
}
```

- `markRead` dispara em background — não espera resolver antes de navegar
- Se `markRead` falhar, não bloqueia navegação
- Se `getNotificationRoute` retornar `null` (campo faltando): marca como lida + toast

---

## Etapa 3 — Badge de Notificações

### 3.1 Badge na Tab

**Arquivo:** `src/app/(tabs)/_layout.tsx` — atualizar

Usar `useUnreadCount()` para exibir badge no ícone `Bell`:

```ts
<Tabs.Screen
  name="alerts"
  options={{
    title: "Alertas",
    tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
    tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
    tabBarBadgeStyle: { backgroundColor: colors.error, fontSize: 10, fontFamily: "Montserrat_600SemiBold" },
  }}
/>
```

---

## Etapa 4 — Push Notifications

### 4.1 Dependências

```bash
npx expo install expo-notifications expo-device
```

### 4.2 Provider

**Arquivo:** `src/providers/NotificationProvider.tsx` (novo)

Responsabilidades:
- Solicitar permissão push no boot (somente se autenticado e `permission === "undetermined"`)
- Obter token via `Notifications.getExpoPushTokenAsync()` ou `getDevicePushTokenAsync()` (somente se permission granted)
- **Deduplicação local:** o backend já suporta upsert por `device_token`, então o frontend não depende de deduplicação para funcionar corretamente. Ainda assim, persistir último `deviceToken` e `deviceId` no SecureStore e só registrar se o token mudou — evita request desnecessário a cada boot
- Registrar token no backend via `notificationsApi.registerDevice()` — armazenar `deviceId` retornado
- Configurar listeners:
  - `addNotificationReceivedListener` — foreground: invalidar `["notifications"]` para atualizar lista e badge. **Melhoria futura:** considerar mostrar toast/banner discreto em foreground para tipos urgentes (`matches_found`, `pet_sighting_claimed`) — nesta fase, só invalidação silenciosa
  - `addNotificationResponseReceivedListener` — tap na push: usar `getNotificationRoute()` para navegar. **Atenção:** se o app abrir do zero (cold start), o router pode não estar pronto quando o listener dispara. Solução: enfileirar a navegação pendente e executar após o router montar (ex: ref com `pendingNotification` que o `useEffect` do provider consome após mount)
- Cleanup dos listeners no unmount

**Resumo do fluxo de registro:**

```
app boot + autenticado
  → pedir permissão (se undetermined)
  → se granted, obter token
  → ler tokenSalvo do SecureStore
  → se token === tokenSalvo → skip
  → se token !== tokenSalvo → POST /user/devices
    → salvar { deviceToken, deviceId } no SecureStore
```

**Arquivo:** `src/providers/AppProviders.tsx` — adicionar `NotificationProvider` dentro do `QueryClientProvider` (precisa de acesso ao queryClient):

```tsx
<QueryClientProvider client={queryClient}>
  <NotificationProvider>
    <BottomSheetModalProvider>
      ...
    </BottomSheetModalProvider>
  </NotificationProvider>
</QueryClientProvider>
```

### 4.3 Logout — Remover device

**Arquivo:** `src/hooks/useLogout.ts` — atualizar

Antes de chamar `clearAuth()`:
- Ler `deviceId` do SecureStore
- Chamar `notificationsApi.removeDevice(deviceId)` — **best-effort:**
  - Erro 404/410 → ignorar (device já removido no backend)
  - Qualquer outro erro → ignorar (não bloquear logout)
- Sempre limpar `deviceToken` e `deviceId` do SecureStore, independente do resultado da API

### 4.4 Configuração Expo

**Arquivo:** `app.json` / `app.config.ts` — adicionar config de notifications:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./src/assets/notification-icon.png",
          "color": "#FFA001"
        }
      ]
    ]
  }
}
```

Nota: `color` usa a cor primária atual (`#FFA001`).

---

## Etapa 5 — Deep Links

### 5.1 Schema

**Arquivo:** `app.json` / `app.config.ts`:

```json
{
  "expo": {
    "scheme": "empet"
  }
}
```

### 5.2 Rotas suportadas

| Deep link | Rota |
|-----------|------|
| `empet://pet-report/{id}` | `/(reports)/[id]` |
| `empet://matches/{reportId}` | `/(matches)/matches/[reportId]` |
| `empet://sighting/{id}` | `/(sightings)/[id]` |

### 5.3 Helper de deep link

**Arquivo:** `src/utils/notification-route.ts` — adicionar:

```ts
// Mapa explícito: URL pública → pathname real com route group
const DEEP_LINK_MAP: Record<string, string> = {
  "pet-report": "/(reports)/[id]",
  "matches": "/(matches)/matches/[reportId]",
  "sighting": "/(sightings)/[id]",
};

export function navigateFromDeepLink(url: string, router: Router): boolean {
  // 1. Parse URL: empet://pet-report/42 → segment="pet-report", param="42"
  // 2. Lookup no DEEP_LINK_MAP → pathname real
  // 3. router.push({ pathname, params })
  // 4. Retorna false se URL não reconhecida
}
```

**Importante:** não abstrair demais — o mapa deve ser explícito para facilitar debug. Os route groups `(reports)`, `(matches)`, `(sightings)` não aparecem na URL pública, então o helper traduz. `getNotificationRoute` é reutilizado internamente quando fizer sentido, mas o deep link tem sua própria entrada no `DEEP_LINK_MAP`.

---

## Arquivos

| Arquivo | Ação |
|---------|------|
| `src/types/notification.ts` | Atualizar (adicionar `NotificationData` defensivo) |
| `src/types/device.ts` | Criar |
| `src/constants/enums.ts` | Adicionar `notificationTypeLabel` |
| `src/constants/query-keys.ts` | Adicionar `notifications` |
| `src/services/api/notifications.ts` | Criar |
| `src/hooks/useNotifications.ts` | Criar |
| `src/utils/notification-route.ts` | Criar (helper de roteamento centralizado) |
| `src/app/(tabs)/alerts.tsx` | Substituir placeholder pela lista |
| `src/app/(tabs)/_layout.tsx` | Adicionar badge de unread count |
| `src/components/notification/NotificationCard.tsx` | Criar |
| `src/providers/NotificationProvider.tsx` | Criar |
| `src/providers/AppProviders.tsx` | Adicionar `NotificationProvider` |
| `src/hooks/useLogout.ts` | Atualizar (remover device no logout) |
| `app.json` / `app.config.ts` | Adicionar config notifications + scheme |

## Componentes reutilizados

| Componente | Path |
|------------|------|
| `EmptyState` | `src/components/ui/EmptyState.tsx` |
| `Skeleton` | `src/components/ui/Skeleton.tsx` |
| `ButtonSecondary` | `src/components/ui/ButtonSecondary.tsx` |
| `relativeTime` | `src/utils/relative-time.ts` |
| `colors` | `src/lib/colors.ts` |

## Types existentes

```ts
// src/types/notification.ts (será atualizado)
export type NotificationType =
  | "pet_lost_nearby"
  | "matches_found"
  | "pet_report_sighting_reported"
  | "pet_sighting_claimed";

// src/types/device.ts (novo)
export type DevicePlatform = "IOS" | "ANDROID";

```

## Confirmações do backend (todas resolvidas)

1. **Formato do `type`:** alias curto via `TYPE_MAP` no `DatabaseNotificationResource`. Valores: `pet_lost_nearby`, `matches_found`, `pet_report_sighting_reported`, `pet_sighting_claimed` (a ser adicionado). Sem FQCN — não precisa de mapper
2. **Payload de `data` por tipo (snake_case):**
   - `pet_lost_nearby`: `report_id`, `pet_name`, `pet_species`, `address_hint`, `distance_km`
   - `matches_found`: `report_id`, `pet_name`, `matches_count`
   - `pet_report_sighting_reported`: `sighting_id`, `report_id`, `pet_name`, `address_hint`, `sighted_at`
   - `pet_sighting_claimed`: `sighting_id`, `sighting_title`, `claimer_name`, `claimer_phone`, `claimer_phone_is_whatsapp`
3. **Response de `GET /user/notifications`:** paginação padrão Laravel (`meta.current_page`, `meta.last_page`, `data[]`). Suporta `?page=N`, `?per_page=N` (default 10), `?sort=column:direction`, `?unread=true`. Envelope em camelCase, `data` interno em snake_case
4. **`DevicePlatform`:** `"IOS"` e `"ANDROID"` (uppercase, `Rule::in()`)
5. **Duplicata de device:** backend faz upsert por `device_token` (`updateOrCreate`). Front não precisa deduplicar

## Verificação

- `npx tsc --noEmit` — sem erros
- Tab "Alertas" carrega lista de notificações com infinite scroll
- Pull-to-refresh funciona
- Loading mostra 4 skeleton cards com header visível
- Estado de erro mostra botão "Tentar novamente"
- Estado vazio mostra ícone `BellOff` + mensagem
- Notificação não lida tem bg branco, borda esquerda primary 3px e dot indicador
- Notificação lida tem bg `#F8F8F8`, sem borda/dot
- Tap na notificação → marca como lida (fire-and-forget) + navega imediatamente
- Tap com `report_id` ausente → marca como lida + toast de fallback
- "Marcar todas" → desabilitado durante loading, texto "Marcando..." → badge zera
- Badge na tab atualiza via push (principal) e polling 30s (fallback)
- Push token registra no backend somente se token mudou (deduplicação via SecureStore)
- Logout remove device (best-effort, ignora 404/410) e limpa SecureStore
- Push recebida em foreground → invalida cache (lista e count atualizam)
- Push tapped → navega via `getNotificationRoute()` (mesma lógica do tap no card)
- Deep links `empet://` usam helper centralizado
- Notificação `pet_sighting_claimed` aparece na lista do autor do avistamento
- Tap em `pet_sighting_claimed` → navega para detalhe do avistamento
- Fluxo completo de claim (botão, API, modal de contato) → ver plan 013
