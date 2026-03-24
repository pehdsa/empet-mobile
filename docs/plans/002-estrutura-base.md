# Fase 2: Estrutura Base (src/)

## Contexto

Construir a infraestrutura de codigo que as telas vao consumir: tipos, API client com auth completa, stores, hooks de auth, constantes, utils e schemas de validacao. O backend Laravel 12 ja esta pronto (roda no Docker via empet-backend) e a Fase 1 (setup) ja criou a base do projeto com providers, client HTTP e auth store esqueleto.

> Esta fase herda e evolui o que a Fase 1 preparou: `src/services/api/client.ts`, `src/types/api.ts`, `src/stores/auth.ts` e `src/services/storage/secure.ts`.

---

## 2.1 Constantes

- `src/constants/enums.ts` — labels traduzidos pt-BR para exibicao na UI (secao 6 do guia)
- `src/constants/query-keys.ts` — chaves centralizadas para TanStack Query

> **`src/constants/colors.ts` nao sera criado.** A Fase 1 definiu que tokens de estilo vivem exclusivamente no `tailwind.config.ts`. Criar um arquivo TS com a paleta quebraria essa decisao e criaria duas fontes de verdade que tendem a divergir. Se no futuro for necessario acessar cores em TS (ex: para componentes nativos que nao suportam className), redesenhar a abordagem de tema nesse momento.

> **`src/constants/api.ts` nao e necessario** — a URL ja vive em `EXPO_PUBLIC_API_URL` e e consumida pelo client Axios criado na Fase 1.

### Enums: apenas mapeamento de exibicao

`enums.ts` deve ser apenas uma camada de traducao para UI, nao a origem dos valores. Usar tipos do dominio como chave para seguranca de tipo:

```ts
// src/constants/enums.ts
import type { PetSpecies, PetSize } from "@/types/pet";

export const speciesLabel: Record<PetSpecies, string> = {
  DOG: "Cachorro",
  CAT: "Gato",
};

export const sizeLabel: Record<PetSize, string> = {
  SMALL: "Pequeno",
  MEDIUM: "Medio",
  LARGE: "Grande",
};

// demais labels conforme necessidade
```

> Usar unions reutilizaveis (`PetSpecies`, `PetSize`) exportadas de `pet.ts` em vez de `Pet["species"]`. Fica mais explicito e nao depende do shape completo de Pet. Adicionar um novo valor a union forca atualizacao dos labels.

### 2.1.1 Query Keys

Nesta fase, criar apenas as keys que serao usadas agora. As demais serao adicionadas quando as features correspondentes forem implementadas:

```ts
// src/constants/query-keys.ts
import type { PetSpecies } from "@/types/pet";

export const queryKeys = {
  auth: {
    user: ["auth", "user"] as const,
  },
  breeds: {
    all: ["breeds"] as const,
    bySpecies: (species: PetSpecies) => ["breeds", species] as const,
  },
  characteristics: {
    all: ["characteristics"] as const,
  },
} as const;

// Query keys de dominio serao adicionadas nas fases correspondentes:
// pets        → Fase 8 (008-pets-crud.md)
// petReports  → Fase 6 (006-home-mapa.md)
// phones      → Fase 11 (011-settings-extras.md)
// notifications → Fase 12 (012-notificacoes-push.md)
```

## 2.2 Types (TypeScript)

Criar todos os tipos da secao 5 do guia. Inclui tanto **responses** quanto **request payloads** relevantes.

### Response types (um arquivo por dominio)

- `src/types/api.ts` — ja existe da Fase 1 (PaginatedResponse, PaginationLinks, PaginationMeta, ValidationError, MessageResponse). Adicionar `ResourceResponse<T>`
- `src/types/auth.ts` — User, AuthResponse
- `src/types/pet.ts` — Pet, PetPhoto, PetSpecies, PetSize, PetSex (unions reutilizaveis usadas pelo proprio Pet e por enums, filters, query keys, etc.)
- `src/types/pet-report.ts` — PetReport
- `src/types/match.ts` — PetMatch
- `src/types/sighting.ts` — PetSighting
- `src/types/phone.ts` — UserPhone
- `src/types/notification.ts` — Notification
- `src/types/breed.ts` — Breed
- `src/types/characteristic.ts` — Characteristic

### ResourceResponse generico (em api.ts)

O Laravel wrapa respostas de JsonResource em `{ data: ... }`. Criar um tipo generico para evitar repetir `{ data: T }` em cada chamada:

```ts
// Em src/types/api.ts
export interface ResourceResponse<T> {
  data: T;
}
```

Uso:

```ts
api.get<ResourceResponse<User>>("/auth/user");
api.post<ResourceResponse<AuthResponse>>("/auth/login", payload);
```

### AuthResponse (em auth.ts, nao em api.ts)

Manter `AuthResponse` em `auth.ts` junto com `User` para evitar que `api.ts` importe tipos de dominio e vire um "dump":

```ts
// Em src/types/auth.ts
export type UserRole = "ADMIN" | "CLIENT" | "SHOP";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  tokenType: "Bearer";
}
```

> **Confirmado contra o backend real** (`empet-backend`): `TokenResource` retorna `{ user, token, tokenType }` e `UserResource` inclui `emailVerifiedAt` e `updatedAt`. A resposta vem wrapada em `{ data: { ... } }` pelo JsonResource do Laravel. `phones` **nao** vem no endpoint de sessao (`GET /auth/user`) — buscar via `GET /user/phones` quando necessario.

### Request payload types

Adicionar nos mesmos arquivos de dominio os tipos de request que a API espera:

```ts
// Em src/types/auth.ts
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyResetCodePayload {
  email: string;
  code: string;
}

export interface ResetPasswordPayload {
  email: string;
  resetToken: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}
```

```ts
// Em src/types/pet-report.ts
import type { PetSpecies, PetSize } from "./pet";

export type PetReportStatus = "LOST" | "FOUND" | "CANCELLED";

export interface PetReportFilters {
  status?: PetReportStatus;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  species?: PetSpecies;
  size?: PetSize;
  page?: number;
}
```

> Os demais payloads de request (criar pet, criar sighting, etc.) serao tipados quando suas features forem implementadas. Nesta fase, focar nos que auth e listagem precisam.

## 2.3 Schemas de Validacao (Zod)

Como esta fase implementa auth completa, criar os schemas de validacao dos formularios de autenticacao:

```
src/features/auth/schemas/
  login.schema.ts
  register.schema.ts
  forgot-password.schema.ts
  verify-code.schema.ts
  reset-password.schema.ts
  change-password.schema.ts
```

Exemplo:

```ts
// src/features/auth/schemas/login.schema.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(1, "Senha obrigatoria"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

> Schemas de outras features (pet, sighting, etc.) serao criados nas fases correspondentes.

## 2.4 API Client — Evolucao

A Fase 1 criou `src/services/api/client.ts` com instancia base do Axios. Nesta fase, **evoluir** esse arquivo para incluir:

### 2.4.1 Interceptor de Bearer token

```ts
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2.4.2 Interceptor de 401 (logout forcado)

```ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await useAuthStore.getState().clearAuth();
      // Redirect para login sera tratado pelo AuthProvider
    }
    return Promise.reject(error);
  },
);
```

> O interceptor de 401 so limpa auth para respostas com `error.response` (ou seja, o servidor respondeu 401). Erros de rede/timeout **nao** tem `error.response`, entao nao disparam logout. Isso e o comportamento correto por padrao do Axios.

### 2.4.3 Modulos de endpoint

Criar nesta fase apenas os modulos que serao consumidos diretamente:

**Obrigatorios nesta fase:**

- `src/services/api/auth.ts` — login, register, forgot-password, verify-code, reset-password, logout, change-password, **getCurrentUser**
- `src/services/api/breeds.ts` — listar racas (dados auxiliares de formularios)
- `src/services/api/characteristics.ts` — listar caracteristicas (dados auxiliares de formularios)

**Criados nas fases de dominio correspondentes (ja documentados nos respectivos planos):**

| Modulo | Fase | Plano |
| --- | --- | --- |
| `src/services/api/pets.ts` | Fase 8 — Pets CRUD | `008-pets-crud.md` |
| `src/services/api/pet-reports.ts` | Fase 6 — Home/Mapa | `006-home-mapa.md` |
| `src/services/api/matches.ts` | Fase 10 — Matches | `010-matches.md` |
| `src/services/api/phones.ts` | Fase 11 — Settings | `011-settings-extras.md` |
| `src/services/api/notifications.ts` | Fase 12 — Notificacoes | `012-notificacoes-push.md` |

> Modulos de API ficam melhores quando nascem junto com a feature e a tela que os consome. Cada plano de fase ja inclui a secao "Infraestrutura a criar nesta fase" com os itens correspondentes.

### 2.4.4 getCurrentUser

Endpoint ja criado no backend:

```
GET /api/v1/auth/user
Authorization: Bearer <token>

200: { data: { id, name, email, role, avatarUrl, isActive, emailVerifiedAt, createdAt, updatedAt } }
401: token ausente, invalido ou revogado
```

Incluir em `src/services/api/auth.ts`:

```ts
export const getCurrentUser = () => api.get<ResourceResponse<User>>("/auth/user");
```

> `phones` nao vem neste endpoint (endpoint de sessao, nao de perfil). Buscar via `GET /user/phones` quando necessario.

## 2.5 Stores (Zustand) — Evolucao

### 2.5.1 Auth store (evoluir o esqueleto da Fase 1)

O `src/stores/auth.ts` da Fase 1 tem `token`, `isAuthenticated`, `setToken()` e `clearToken()`. Evoluir para:

```ts
// src/stores/auth.ts
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  hasHydrated: boolean;
  setAuth: (token: string, user: User) => Promise<void>;
  clearAuth: () => Promise<void>;
  hydrate: () => Promise<void>;
}
```

Distincao dos estados:

| Estado | Significado |
| --- | --- |
| `isHydrating: true, hasHydrated: false` | App bootando, auth ainda nao checada |
| `isHydrating: false, hasHydrated: true, isAuthenticated: false` | Hydrate concluido, usuario e guest |
| `isHydrating: false, hasHydrated: true, isAuthenticated: true` | Hydrate concluido, usuario autenticado |

> `isHydrating` substitui o antigo `isLoading` generico. Isso evita ambiguidade com loading de mutations de login/register (que sao gerenciados pelo React Query, nao pelo store).

### Fluxo de autenticacao completo

1. **App abre** → AuthProvider chama `hydrate()`
2. **hydrate** → le token do SecureStore. Se existir, seta no state e chama `getCurrentUser()`:
   - **Sucesso** → seta user e isAuthenticated
   - **401/403** → token invalido/expirado → chama `clearAuth()`
   - **Erro de rede/timeout** → token pode ser valido, so a rede falhou → chama `clearAuth()` e manda para login
   - Ao final (qualquer caso), seta `hasHydrated: true`
3. **Login/Register** → API retorna `{ data: { token, user, tokenType } }` → chama `setAuth(token, user)`
4. **setAuth** → persiste token no SecureStore + atualiza state (token, user, isAuthenticated)
5. **401 interceptor** → chama `clearAuth()` → remove token do SecureStore + limpa state. `clearAuth()` deve ser **idempotente** — chamar multiplas vezes (ex: hydrate + interceptor ao mesmo tempo) nao deve causar efeitos colaterais
6. **AuthProvider** → observa `hasHydrated` e `isAuthenticated` para decidir navegacao

> **Decisao de produto/UX (nao tecnica):** limpar auth em erro de rede e uma escolha intencional que prioriza consistencia e simplicidade sobre conveniencia. Um usuario com token valido mas sem rede sera forcado a re-login. Essa decisao pode ser revisada se a UX mostrar que e agressiva demais — alternativas incluem retry com backoff, fallback offline, ou manter sessao local sem user atualizado.

### 2.5.2 Map filters store

> `src/stores/map-filters.store.ts` **nao entra nesta fase.** Movido para a Fase 6 (Home/Mapa) onde sera realmente consumido.

## 2.6 Providers — Evolucao

### 2.6.1 QueryProvider

O `QueryClientProvider` ja esta montado no `AppProviders.tsx` da Fase 1. **Nao criar um QueryProvider separado** — usar o que ja existe.

### 2.6.2 AuthProvider

Criar `src/providers/AuthProvider.tsx` com responsabilidades explicitas:

**Comportamento:**

- `hydrate()` roda **uma unica vez** ao montar (useEffect com deps vazio)
- Enquanto `hasHydrated === false`, **manter a splash screen nativa** (nao esconder o SplashScreen). Nao renderizar tela customizada de loading — a splash nativa ja esta visivel desde o boot
- Quando `hasHydrated === true`:
  - Usar `useSegments()` para checar o segmento atual antes de redirecionar
  - So redirecionar se estiver no grupo **errado** (evita navegacao redundante e loops)
  - Se `isAuthenticated === true` e segmento nao e `(tabs)` → `router.replace("/(tabs)")`
  - Se `isAuthenticated === false` e segmento nao e `(auth)` → `router.replace("/(auth)")`
  - Esconde o SplashScreen apos o redirect
- Se token existir no SecureStore mas `getCurrentUser()` falhar → chama `clearAuth()` e manda para `/(auth)`

**Onde montar:**

- Dentro do `app/_layout.tsx`, como filho do `AppProviders` e pai do `Slot`
- **Nao** dentro do `AppProviders.tsx` diretamente, pois o AuthProvider depende de navegacao (expo-router) que precisa estar montada

```tsx
// app/_layout.tsx (evolucao)
return (
  <AppProviders>
    <AuthProvider>
      <Slot />
    </AuthProvider>
  </AppProviders>
);
```

> **Migracao do SplashScreen:** O controle migra da `_layout.tsx` para o AuthProvider. Ao implementar:
> 1. **Remover** a chamada de `SplashScreen.hideAsync()` do `_layout.tsx` (hoje dispara quando fontes carregam)
> 2. **Manter** `SplashScreen.preventAutoHideAsync()` no topo do modulo `_layout.tsx`
> 3. **Garantir** que o AuthProvider so rode apos fontes estarem prontas (esta naturalmente garantido pois o `_layout.tsx` retorna `null` ate fontes carregarem)
> 4. **Centralizar** `SplashScreen.hideAsync()` no AuthProvider, apos hydrate + redirect
> Isso evita dois controladores do splash disputando o hide.
> **Atencao na implementacao:** esconder o splash *antes* da navegacao estabilizar pode causar flash de tela errada. Preferir esconder apos a renderizacao do grupo correto (`(auth)` ou `(tabs)`).

## 2.7 Hooks (React Query wrappers)

### Criar nesta fase

- `src/hooks/useAuth.ts` — useLogin, useRegister, useForgotPassword, useVerifyCode, useResetPassword, useChangePassword, useLogout

> **useLogout:** chama `POST /auth/logout` para revogar o token no backend e **sempre** limpa auth local, mesmo que a chamada falhe (rede fora, 500, etc.). Revogar o token e best-effort; a sessao local deve ser limpa incondicionalmente.
- `src/hooks/useBreeds.ts` — useBreeds (filtrado por species)
- `src/hooks/useCharacteristics.ts` — useCharacteristics

> Estes hooks sao necessarios nesta fase porque auth e dados auxiliares de formularios sao infraestrutura base.

### Criar nas fases de dominio (ja documentados nos respectivos planos)

| Hook | Fase | Plano |
| --- | --- | --- |
| `src/hooks/usePets.ts` | Fase 8 — Pets CRUD | `008-pets-crud.md` |
| `src/hooks/usePetReports.ts` | Fase 6 — Home/Mapa | `006-home-mapa.md` |
| `src/hooks/useLocation.ts` | Fase 6 — Home/Mapa | `006-home-mapa.md` |
| `src/hooks/useMatches.ts` | Fase 10 — Matches | `010-matches.md` |
| `src/hooks/useSightings.ts` | Fase 9 — Report/Sighting | `009-report-lost-sighting.md` |
| `src/hooks/usePhones.ts` | Fase 11 — Settings | `011-settings-extras.md` |
| `src/hooks/useNotifications.ts` | Fase 12 — Notificacoes | `012-notificacoes-push.md` |

> Hooks de dominio ficam melhores quando nascem junto com a feature e a tela que os consome. As query keys ja estao centralizadas em `src/constants/query-keys.ts` e prontas para quando forem necessarios. Cada plano de fase ja inclui a secao "Infraestrutura a criar nesta fase" com os hooks correspondentes.

## 2.8 Utils

- `src/utils/format-date.ts` — formatacao pt-BR com date-fns
- `src/utils/format-distance.ts` — metros/km
- `src/utils/relative-time.ts` — "ha X horas"
- `src/utils/phone-mask.ts` — mascara telefone

---

## Pre-requisitos

- [x] ~~**Criar endpoint `GET /api/v1/auth/user`** no backend~~ — ja criado no `empet-backend`

## Verificacao

- [ ] Todos os tipos compilam sem erros (`npx tsc --noEmit`)
- [ ] API client exporta instancia com interceptors de auth e 401
- [ ] Auth store faz hydrate (com `hasHydrated`/`isHydrating`), setAuth e clearAuth corretamente
- [ ] Token e restaurado corretamente apos restart via hydrate()
- [ ] 401 da API limpa auth e redireciona para login
- [ ] Query keys centralizadas e usadas em todos os hooks desta fase
- [ ] Schemas Zod de auth compilam e validam payloads corretamente
- [ ] Hooks de auth, breeds e characteristics funcionam
- [ ] AuthProvider redireciona corretamente conforme estado de auth
- [ ] ESLint/Prettier passam sem erros
