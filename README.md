# Empet

App mobile para reencontro de pets perdidos. Tutores registram seus pets, reportam desaparecimentos e a comunidade colabora com avistamentos geolocalizados. O sistema cruza dados automaticamente e notifica quando um possivel match e encontrado.

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | [Expo](https://expo.dev) SDK 55 + React Native 0.83 |
| Navegacao | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based, typed routes) |
| Estilizacao | [NativeWind](https://www.nativewind.dev) v4 + Tailwind CSS 3.4 |
| State (server) | [TanStack React Query](https://tanstack.com/query) v5 |
| State (client) | [Zustand](https://zustand-demo.pmnd.rs) v5 |
| Forms | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) v4 |
| HTTP | [Axios](https://axios-http.com) |
| Icones | [Lucide React Native](https://lucide.dev) |
| Fontes | Montserrat (400, 500, 600, 700) via `@expo-google-fonts` |
| Storage | Expo SecureStore (tokens) |
| Backend | Laravel 12 + Sanctum (repositorio separado: `empet-backend`) |

## Pre-requisitos

- Node.js >= 18
- npm >= 9
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS: Xcode + Simulator (macOS)
- Android: Android Studio + Emulator

## Instalacao

```bash
# Clonar o repositorio
git clone <repo-url>
cd empet-mobile

# Instalar dependencias
npm install

# Configurar variaveis de ambiente
cp .env.example .env
# Editar .env com a URL do backend:
# EXPO_PUBLIC_API_URL=http://localhost:8000
```

## Executando

```bash
# Dev server (abre menu para escolher plataforma)
npm start

# Direto no iOS Simulator
npm run ios

# Direto no Android Emulator
npm run android
```

## Scripts

| Comando | Descricao |
|---------|-----------|
| `npm start` | Inicia o Expo dev server |
| `npm run ios` | Abre no iOS Simulator |
| `npm run android` | Abre no Android Emulator |
| `npm run lint` | Executa ESLint |
| `npm run format` | Formata codigo com Prettier |
| `npx tsc --noEmit` | Verifica tipos TypeScript |

## Estrutura do Projeto

```
app/                          # Expo Router (file-based routing)
  _layout.tsx                 # Root: fonts + providers + auth guard
  index.tsx                   # Redirect baseado em auth state
  (auth)/                     # Rotas publicas (Stack)
    _layout.tsx
    welcome.tsx
  (tabs)/                     # Rotas autenticadas (Tabs)
    _layout.tsx
    index.tsx                 # Home
    settings.tsx              # Configuracoes

src/
  components/ui/              # Design system (17 componentes)
    ButtonPrimary.tsx
    ButtonSecondary.tsx
    Card.tsx
    Chip.tsx
    EmptyState.tsx
    ErrorMessage.tsx
    Modal.tsx
    NavHeader.tsx
    PasswordInput.tsx
    Screen.tsx
    SelectField.tsx
    Skeleton.tsx
    SuccessMessage.tsx
    TextInput.tsx
    TextLink.tsx
    Toast.tsx
    ToggleButton.tsx
    index.ts                  # Barrel export
  constants/                  # Enum labels, query keys
  features/                   # Logica por feature
    auth/schemas/             # Schemas Zod (login, register, etc.)
  hooks/                      # React Query wrappers
  lib/                        # Helpers (colors resolver)
  providers/                  # AppProviders, AuthProvider
  services/
    api/                      # Axios client + modulos por dominio
    storage/                  # SecureStore wrapper
  stores/                     # Zustand (auth, toast)
  styles/                     # global.css (Tailwind directives)
  types/                      # Tipos TypeScript (um por entidade)
  utils/                      # Formatadores (data, distancia, telefone)

docs/plans/                   # Planos de implementacao por fase
```

## Design System

Os componentes UI estao em `src/components/ui/` e seguem o design definido no Pencil (`empet.pen`). Todos sao estilizados com NativeWind — **Tailwind e a fonte unica de design tokens** (cores, fontes, espacamentos).

### Paleta de Cores

| Token | Hex | Uso |
|-------|-----|-----|
| `primary` | `#AD4FFF` | Acoes principais, links, elementos ativos |
| `secondary` | `#FFA001` | Categoria gato, destaques secundarios |
| `text-primary` | `#313233` | Texto principal |
| `text-secondary` | `#6B6C6D` | Labels, texto auxiliar |
| `text-tertiary` | `#9B9C9D` | Placeholders, texto desabilitado |
| `background` | `#F8F8F8` | Fundo de telas |
| `surface` | `#FFFFFF` | Cards, inputs, modais |
| `border` | `#E2E2E2` | Bordas de inputs e separadores |
| `error` | `#E53935` | Mensagens e bordas de erro |
| `success` | `#43A047` | Mensagens de sucesso |

### Tipografia

Fonte unica: **Montserrat** em 4 pesos (Regular 400, Medium 500, SemiBold 600, Bold 700).

### Componentes Disponiveis

**Inputs:** TextInput, PasswordInput, SelectField
**Buttons:** ButtonPrimary, ButtonSecondary, TextLink
**Feedback:** ErrorMessage, SuccessMessage, Toast, Skeleton
**Layout:** Screen, NavHeader, Card, Modal, EmptyState
**Selection:** Chip, ToggleButton

## Arquitetura

### Navegacao

Expo Router com dois grupos de rotas:

- `/(auth)` — Stack Navigator para telas publicas (login, registro, etc.)
- `/(tabs)` — Tab Navigator para telas autenticadas

O `AuthProvider` monitora o estado de autenticacao e redireciona automaticamente entre os grupos usando `useSegments()`.

### Estado

- **Server state** (dados da API): React Query — nunca Zustand
- **Client state** (auth, UI): Zustand com stores minimos
- Auth store persiste tokens no SecureStore e expoe `isAuthenticated`

### API

- Instancia Axios unica em `src/services/api/client.ts`
- Interceptor de request injeta Bearer token
- Interceptor de response trata 401 (limpa auth)
- Base path `/api/v1` configurado uma vez no client
- Modulos por dominio exportados como objeto (`authApi`, `breedsApi`, etc.)

## Roadmap

| Fase | Descricao | Status |
|------|-----------|--------|
| 001 | Setup do projeto | Concluida |
| 002 | Estrutura base (types, API, auth) | Concluida |
| 003 | Design system (componentes UI) | Concluida |
| 004 | Layouts e navegacao | Pendente |
| 005 | Telas de autenticacao | Pendente |
| 006 | Home / Mapa | Pendente |
| 007 | Detalhe do pet report | Pendente |
| 008 | Pets CRUD | Pendente |
| 009 | Report lost + sighting | Pendente |
| 010 | Matches | Pendente |
| 011 | Settings + extras | Pendente |
| 012 | Notificacoes + push | Pendente |

Planos detalhados de cada fase em `docs/plans/`.

## Backend

O backend roda em repositorio separado (`empet-backend`) com Laravel 12 + Docker. Para rodar localmente:

```bash
cd empet-backend
docker compose up -d
```

A API usa Sanctum para autenticacao via Bearer token. Os campos retornados em `data` sao **camelCase**, enquanto campos de paginacao (`meta`, `links`) sao **snake_case**.
