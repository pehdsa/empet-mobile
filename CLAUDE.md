# Empet Mobile

App mobile (Expo/React Native) para reencontro de pets perdidos. Backend Laravel 12 em `empet-backend` (Docker).

## Comandos

```bash
npm start              # Expo dev server
npm run ios            # iOS simulator
npm run android        # Android emulator
npm run lint           # ESLint
npm run format         # Prettier
npx tsc --noEmit       # Type check
npx expo install <pkg> # Deps com binding nativo (garante compatibilidade com SDK)
```

## Regras criticas

- Nunca criar novos patterns sem seguir os existentes
- Nunca duplicar fonte de verdade (ex: cores fora do `tailwind.config.ts`)
- Sempre usar `ResourceResponse<T>` para responses de JsonResource da API
- Nunca usar Zustand para server state — usar React Query
- Hooks e modulos de API de dominio nascem junto com a feature, nao antecipadamente
- Base path da API (`/api/v1`) definido uma vez no client Axios — nunca hardcodar em multiplos lugares
- Labels de UI vivem em `enums.ts` como `Record<UnionType, string>` — nunca `Record<string, string>`

## Naming

| Tipo | Convencao | Exemplo |
|------|-----------|---------|
| Componentes/Providers | `PascalCase.tsx` | `AppProviders.tsx` |
| Hooks | `useXxx.ts` | `useAuth.ts` |
| Schemas | `xxx.schema.ts` | `login.schema.ts` |
| Modulos de API | `xxx.ts` (export como `xxxApi`) | `auth.ts` → `authApi` |
| Types | `xxx.ts` (exports PascalCase) | `pet.ts` → `Pet`, `PetSpecies` |
| Utils/Constants | `kebab-case.ts` | `format-date.ts`, `query-keys.ts` |

## Estrutura

```
app/                    # Expo Router (file-based routing)
  _layout.tsx           # Root: fonts → AppProviders → AuthProvider → Slot
  index.tsx             # Redirect baseado em auth state
  (auth)/               # Grupo publico (Stack)
  (tabs)/               # Grupo autenticado (Tabs: Home + Config)

src/                    # Logica da aplicacao (alias @/)
  types/                # Um arquivo por entidade (unions reutilizaveis)
  services/api/         # client.ts (Axios + interceptors) + modulos por dominio
  services/storage/     # Wrapper generico do SecureStore
  stores/               # Zustand (apenas auth e UI global)
  hooks/                # React Query wrappers (um por dominio)
  constants/            # enums.ts (labels), query-keys.ts
  features/             # Logica por feature (schemas Zod, etc.)
  providers/            # AppProviders, AuthProvider
  components/           # Componentes reutilizaveis (NativeWind)
  utils/                # Formatadores (data, distancia, telefone)
  styles/               # global.css (Tailwind base)
```

## Navegacao (Expo Router)

- File-based routing com grupos: `/(auth)` (Stack) e `/(tabs)` (Tabs)
- `AuthProvider` controla redirect com `useSegments()` — so redireciona se no grupo errado
- `SplashScreen.hideAsync()` centralizado no AuthProvider (nao no _layout.tsx)
- `typedRoutes: true` — rotas tipadas em compile-time
- Nunca navegar manualmente fora do fluxo de auth

## Padroes de codigo

**Types:** unions reutilizaveis exportadas do tipo base (`PetSpecies`, `PetSize`, `UserRole`). Payloads separados de responses. `ResourceResponse<T>` para envelope `{ data: T }`. `PaginatedResponse<T>` para listas com `links`/`meta` (snake_case).

**API:** instancia unica Axios em `services/api/client.ts`. Modulos como objeto: `export const authApi = { ... }`. Interceptor de request injeta Bearer token do Zustand. Interceptor de 401 chama `clearAuth()` (idempotente).

**Hooks:** React Query wrappers com query keys de `constants/query-keys.ts`. `select: (r) => r.data.data` para extrair do envelope. Mutations de auth chamam `setAuth()` no onSuccess. `useLogout` limpa auth local **incondicionalmente** (best-effort no backend).

**Stores:** Auth store com `hydrate()`, `setAuth()`, `clearAuth()`. Estados: `isHydrating`, `hasHydrated`, `isAuthenticated`. `clearAuth()` e idempotente.

**Schemas:** Zod em `src/features/[feature]/schemas/`. Tipo inferido: `type XxxFormData = z.infer<typeof xxxSchema>`. Senha: min 8, 1 maiuscula, 1 numero, 1 especial. Confirmacao via `.refine()`.

**Estilizacao:** NativeWind v4 + Tailwind 3.4. **Tailwind e a fonte unica de design tokens** — nao existe `colors.ts` nem `theme.ts`. Cor primaria: `#AD4FFF`. Fontes: Montserrat (400, 500, 600, 700).

## Como criar uma nova feature

1. Criar types em `src/types/` (se necessario)
2. Adicionar query keys em `src/constants/query-keys.ts`
3. Criar modulo API em `src/services/api/`
4. Criar hook React Query em `src/hooks/`
5. Criar schemas Zod em `src/features/[feature]/schemas/` (se tiver form)
6. Criar telas em `app/`
7. Instalar deps necessarias via `npx expo install`

## Backend (empet-backend)

- Laravel 12, Docker, Sanctum (Bearer token)
- Base: `{EXPO_PUBLIC_API_URL}/api/v1`
- Campos de `data`: **camelCase** (API Resources)
- Campos de paginacao (`meta`, `links`): **snake_case**
- Sessao: `GET /auth/user` (retorna User sem phones)
- Phones: `GET /user/phones` (endpoint separado)

## Fases

| # | Descricao | Status |
|---|-----------|--------|
| 001 | Setup do projeto (fundacao) | Implementado |
| 002 | Estrutura base (types, API, auth, hooks) | Implementado |
| 003 | Design system (componentes UI) | Pendente |
| 004 | Layouts e navegacao | Pendente |
| 005 | Telas de autenticacao | Pendente |
| 006 | Home / Mapa | Pendente |
| 007 | Detalhe do pet report | Pendente |
| 008 | Pets CRUD | Pendente |
| 009 | Report lost + sighting | Pendente |
| 010 | Matches | Pendente |
| 011 | Settings + extras | Pendente |
| 012 | Notificacoes + push | Pendente |

Planos detalhados em `docs/plans/`.
