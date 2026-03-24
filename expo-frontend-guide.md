# Plano: Empet Mobile — Expo Frontend

## Visao Geral

App mobile para reencontro de pets perdidos. O backend (Laravel 12) ja esta pronto com API REST completa. Este documento guia a criacao do frontend Expo/React Native do zero.

**Nome do app:** Empet
**Proposta:** Conectar donos de pets perdidos com pessoas que os avistaram, usando matching automatico por similaridade.

---

## 1. Stack Tecnologica

| Tecnologia | Uso |
|---|---|
| **Expo SDK 52+** | Framework base (managed workflow) |
| **Expo Router** | File-based routing (navegacao) |
| **TypeScript** | Tipagem obrigatoria em todo o projeto |
| **React Native** | UI components |
| **NativeWind v4** | Tailwind CSS para React Native (estilizacao) |
| **Zustand** | Estado global (auth, user, filtros) |
| **TanStack Query (React Query)** | Cache, fetch, mutations, paginacao |
| **Axios** | HTTP client com interceptors |
| **React Hook Form + Zod** | Formularios + validacao |
| **react-native-maps** | Google Maps no mapa principal |
| **expo-location** | GPS do dispositivo |
| **expo-image-picker** | Upload de fotos de pets |
| **expo-notifications** | Push notifications |
| **expo-secure-store** | Armazenamento seguro do token |
| **date-fns** | Formatacao de datas (pt-BR) |
| **react-native-reanimated** | Animacoes |

---

## 2. Estrutura de Pastas

```
empet-mobile/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx               # Root layout (providers)
│   ├── index.tsx                 # Redirect based on auth state
│   ├── (auth)/                   # Grupo de telas publicas (nao autenticado)
│   │   ├── _layout.tsx           # Stack navigator
│   │   ├── welcome.tsx           # Splash/Welcome
│   │   ├── login.tsx             # Login
│   │   ├── register.tsx          # Registro
│   │   ├── forgot-password.tsx   # Esqueci minha senha
│   │   ├── verify-code.tsx       # Verificar codigo
│   │   └── reset-password.tsx    # Nova senha
│   ├── (tabs)/                   # Tab navigator (autenticado)
│   │   ├── _layout.tsx           # Tab layout (Home + Config)
│   │   ├── index.tsx             # Home/Mapa
│   │   └── settings.tsx          # Settings principal
│   ├── pet-report/
│   │   └── [id].tsx              # Detalhe do report
│   ├── pets/
│   │   ├── index.tsx             # Lista meus pets
│   │   ├── new.tsx               # Cadastrar pet
│   │   ├── [id]/
│   │   │   ├── index.tsx         # Detalhe do pet
│   │   │   └── edit.tsx          # Editar pet
│   ├── report-lost/
│   │   ├── select-pet.tsx        # Step 1: selecionar pet
│   │   ├── location.tsx          # Step 2: marcar local
│   │   ├── details.tsx           # Step 3: detalhes da perda
│   │   └── success.tsx           # Tela de sucesso
│   ├── sighting/
│   │   ├── new.tsx               # Formulario de avistamento
│   │   └── success.tsx           # Sucesso do avistamento
│   ├── matches/
│   │   ├── [reportId].tsx        # Lista de matches por report
│   │   └── [reportId]/
│   │       └── [matchId].tsx     # Detalhe/comparacao do match
│   ├── notifications.tsx         # Lista de notificacoes
│   ├── phones/
│   │   └── index.tsx             # Gerenciar telefones
│   ├── notification-settings.tsx # Config de notificacoes
│   └── change-password.tsx       # Alterar senha
├── src/
│   ├── api/                      # Camada de API
│   │   ├── client.ts             # Axios instance + interceptors
│   │   ├── auth.ts               # Auth endpoints
│   │   ├── pets.ts               # Pets CRUD
│   │   ├── pet-reports.ts        # Reports + sightings
│   │   ├── matches.ts            # Matches
│   │   ├── phones.ts             # User phones
│   │   ├── notifications.ts      # Notifications
│   │   ├── breeds.ts             # Breeds (referencia)
│   │   └── characteristics.ts    # Characteristics (referencia)
│   ├── hooks/                    # Custom hooks (React Query wrappers)
│   │   ├── useAuth.ts
│   │   ├── usePets.ts
│   │   ├── usePetReports.ts
│   │   ├── useMatches.ts
│   │   ├── usePhones.ts
│   │   ├── useNotifications.ts
│   │   └── useLocation.ts
│   ├── stores/                   # Zustand stores
│   │   ├── auth.store.ts         # Token, user, isAuthenticated
│   │   └── map-filters.store.ts  # Filtros do mapa (species, size)
│   ├── types/                    # TypeScript types/interfaces
│   │   ├── api.ts                # Response types genericos
│   │   ├── auth.ts
│   │   ├── pet.ts
│   │   ├── pet-report.ts
│   │   ├── match.ts
│   │   ├── sighting.ts
│   │   ├── phone.ts
│   │   ├── notification.ts
│   │   ├── breed.ts
│   │   └── characteristic.ts
│   ├── components/               # Componentes reutilizaveis
│   │   ├── ui/                   # Design system base
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── pet/                  # Componentes de pet
│   │   │   ├── PetCard.tsx
│   │   │   ├── PetForm.tsx
│   │   │   ├── PhotoUploader.tsx
│   │   │   └── CharacteristicsPicker.tsx
│   │   ├── map/                  # Componentes de mapa
│   │   │   ├── PetMarker.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── PetPreviewCard.tsx
│   │   │   └── CenterPin.tsx
│   │   ├── match/
│   │   │   ├── MatchCard.tsx
│   │   │   ├── ComparisonTable.tsx
│   │   │   └── ScoreBadge.tsx
│   │   └── notification/
│   │       ├── NotificationCard.tsx
│   │       └── NotificationBadge.tsx
│   ├── constants/                # Constantes
│   │   ├── colors.ts             # Paleta de cores (light + dark)
│   │   ├── enums.ts              # Enum labels e traducoes
│   │   └── api.ts                # API_BASE_URL
│   ├── utils/                    # Utilitarios
│   │   ├── format-date.ts        # Formatacao pt-BR
│   │   ├── format-distance.ts    # metros/km
│   │   ├── relative-time.ts      # "ha X horas"
│   │   └── phone-mask.ts         # Mascara de telefone
│   └── providers/                # Context providers
│       ├── QueryProvider.tsx      # TanStack Query
│       └── AuthProvider.tsx       # Auth state + redirect logic
├── assets/                       # Icones, fontes, imagens
│   └── fonts/
│       └── Montserrat/           # Montserrat (400, 500, 700)
├── tailwind.config.ts            # NativeWind config com design tokens
├── app.json                      # Expo config
├── tsconfig.json
└── package.json
```

---

## 3. Design System

### 3.1 Cores

```typescript
// src/constants/colors.ts
export const colors = {
  light: {
    primary: '#AD4FFF',
    primaryLight: '#C98AFF',
    primaryDark: '#8A2BE2',
    secondary: '#FFA001',
    secondaryLight: '#FFBE4D',
    secondaryDark: '#CC8000',
    textPrimary: '#313233',
    textSecondary: '#6B6C6D',
    textTertiary: '#9B9C9D',
    textInverse: '#FFFFFF',
    background: '#F8F8F8',
    surface: '#FFFFFF',
    border: '#E2E2E2',
    error: '#E53935',
    success: '#43A047',
    whatsapp: '#25D366',
  },
  dark: {
    primary: '#C98AFF',
    primaryLight: '#DDB3FF',
    primaryDark: '#AD4FFF',
    secondary: '#FFBE4D',
    secondaryLight: '#FFD180',
    secondaryDark: '#FFA001',
    textPrimary: '#F0F0F0',
    textSecondary: '#A0A1A2',
    textTertiary: '#6B6C6D',
    textInverse: '#1A1A1A',
    background: '#121212',
    surface: '#1E1E1E',
    border: '#2E2E2E',
    error: '#EF5350',
    success: '#66BB6A',
    whatsapp: '#25D366',
  },
};
```

### 3.2 Tipografia

- **Fonte:** Montserrat (Google Fonts, carregada via `expo-font`)
- Titulos: Montserrat Bold (700)
- Body/labels: Montserrat Medium (500)
- Captions/hints: Montserrat Regular (400)

### 3.3 Espacamento e Tamanhos

| Elemento | Valor |
|---|---|
| Input height | 48px |
| Button height | 48px |
| Border radius (inputs/buttons) | 12px |
| Border radius (cards) | 12px-16px |
| Border radius (modais) | 20px |
| Padding horizontal padrao | 16px |
| Gap entre campos | 8px (label-input), 20px (entre grupos) |
| Tamanho icone | 24px (padrao), 16px (inline) |
| FAB | 56x56px, circular |

---

## 4. API — Endpoints Completos

**Base URL:** `{API_URL}/api/v1`

### 4.1 Auth (publico)

| Metodo | Path | Descricao | Rate Limit |
|---|---|---|---|
| POST | `/auth/register` | Registro | 5/min |
| POST | `/auth/login` | Login (retorna token) | 10/min |
| POST | `/auth/forgot-password` | Envia codigo por email | custom |
| POST | `/auth/verify-reset-code` | Valida codigo 6 digitos → retorna resetToken | custom |
| POST | `/auth/reset-password` | Nova senha com resetToken | custom |

**Regras de senha (Password::defaults()):**
- Minimo 8 caracteres
- Pelo menos 1 letra maiuscula
- Pelo menos 1 numero
- Pelo menos 1 caractere especial
- Confirmacao obrigatoria (campo `password_confirmation`)

### 4.2 Auth (autenticado — Bearer token)

| Metodo | Path | Descricao |
|---|---|---|
| PUT | `/auth/password` | Alterar senha |
| POST | `/auth/logout` | Logout (revoga token) |

### 4.3 Pets

| Metodo | Path | Descricao |
|---|---|---|
| GET | `/pets` | Listar meus pets (paginado) |
| POST | `/pets` | Cadastrar pet (multipart/form-data com fotos) |
| GET | `/pets/{id}` | Detalhe do pet |
| PUT | `/pets/{id}` | Editar pet |
| DELETE | `/pets/{id}` | Remover pet (soft delete) |
| PATCH | `/pets/{id}/toggle-active` | Ativar/desativar |

### 4.4 Pet Reports

| Metodo | Path | Descricao |
|---|---|---|
| GET | `/pet-reports` | Listar reports (aceita filtros: status, latitude, longitude, radius_km, species, size, paginate) |
| POST | `/pet-reports` | Criar report de perda |
| GET | `/pet-reports/{id}` | Detalhe do report |
| PUT | `/pet-reports/{id}` | Editar report |
| PATCH | `/pet-reports/{id}/cancel` | Cancelar report |
| PATCH | `/pet-reports/{id}/found` | Marcar como encontrado |

### 4.5 Matches

| Metodo | Path | Descricao |
|---|---|---|
| GET | `/pet-reports/{id}/matches` | Listar matches (max 20, filtro por status) |
| PATCH | `/pet-reports/{id}/matches/{matchId}/confirm` | Confirmar match (report → FOUND) |
| PATCH | `/pet-reports/{id}/matches/{matchId}/dismiss` | Descartar match |

### 4.6 Sightings (avistamentos)

| Metodo | Path | Descricao |
|---|---|---|
| GET | `/pet-reports/{id}/sightings` | Listar avistamentos |
| POST | `/pet-reports/{id}/sightings` | Reportar avistamento |
| GET | `/pet-reports/{id}/sightings/{sId}` | Detalhe do avistamento |

### 4.7 User Phones

| Metodo | Path | Descricao |
|---|---|---|
| GET | `/user/phones` | Listar telefones (max 5) |
| POST | `/user/phones` | Adicionar telefone |
| PUT | `/user/phones/{id}` | Editar telefone |
| DELETE | `/user/phones/{id}` | Remover telefone |

### 4.8 Notifications

| Metodo | Path | Descricao |
|---|---|---|
| GET | `/user/notifications` | Listar notificacoes (paginado) |
| PATCH | `/user/notifications/{id}/read` | Marcar como lida |
| PATCH | `/user/notifications/read-all` | Marcar todas como lidas |
| GET | `/user/notifications/unread-count` | Contagem de nao lidas |

### 4.9 User Devices (push tokens)

| Metodo | Path | Descricao |
|---|---|---|
| GET | `/user/devices` | Listar dispositivos |
| POST | `/user/devices` | Registrar push token |
| DELETE | `/user/devices/{id}` | Remover dispositivo |

### 4.10 Notification Settings

| Metodo | Path | Descricao |
|---|---|---|
| GET | `/user/notification-settings` | Obter config |
| PUT | `/user/notification-settings` | Atualizar config |

### 4.11 Referencia

| Metodo | Path | Descricao |
|---|---|---|
| GET | `/breeds` | Listar racas (filtro: `species`) |
| GET | `/characteristics` | Listar caracteristicas |

---

## 5. Tipos TypeScript (baseados na API)

```typescript
// src/types/api.ts
export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface TokenResponse {
  user: User;
  token: string;
  tokenType: 'Bearer';
}

export interface MessageResponse {
  message: string;
}

// src/types/auth.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'CLIENT' | 'SHOP';
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

// src/types/pet.ts
export interface Pet {
  id: number;
  name: string;
  species: 'DOG' | 'CAT';
  size: 'SMALL' | 'MEDIUM' | 'LARGE';
  sex: 'MALE' | 'FEMALE' | 'UNKNOWN';
  primaryColor: string | null;
  breedDescription: string | null;
  notes: string | null;
  isActive: boolean;
  breed: Breed | null;
  secondaryBreed: Breed | null;
  photos: PetPhoto[];
  characteristics: Characteristic[];
}

export interface PetPhoto {
  id: number;
  url: string;
  position: number;
}

// src/types/pet-report.ts
export interface PetReport {
  id: number;
  petId: number;
  status: 'LOST' | 'FOUND' | 'CANCELLED';
  location: { latitude: number; longitude: number };
  addressHint: string | null;
  description: string | null;
  lostAt: string;
  foundAt: string | null;
  isActive: boolean;
  pet: Pet;
  matchesCount: number;
  createdAt: string;
}

// src/types/match.ts
export interface PetMatch {
  id: number;
  reportId: number;
  matchedPetId: number;
  score: string; // "85.50"
  distanceMeters: string; // "1234.56"
  status: 'PENDING' | 'CONFIRMED' | 'DISMISSED';
  matchedPet: Pet;
}

// src/types/sighting.ts
export interface PetSighting {
  id: number;
  reportId: number;
  location: { latitude: number; longitude: number };
  addressHint: string | null;
  description: string | null;
  sightedAt: string;
  sharePhone: boolean;
  contactPhone: string | null; // so visivel para o dono
  isActive: boolean;
  user: { id: number; name: string };
}

// src/types/phone.ts
export interface UserPhone {
  id: number;
  phone: string;
  isWhatsapp: boolean;
  isPrimary: boolean;
  label: string | null;
}

// src/types/notification.ts
export interface Notification {
  id: string;
  type: 'pet_lost_nearby' | 'matches_found' | 'pet_sighting_reported';
  data: {
    title: string;
    body: string;
    report_id?: number;
    pet_name?: string;
  };
  readAt: string | null;
  createdAt: string;
}

// src/types/breed.ts
export interface Breed {
  id: number;
  name: string;
  species: 'DOG' | 'CAT';
}

// src/types/characteristic.ts
export interface Characteristic {
  id: number;
  name: string;
  category: 'MARKING' | 'COAT' | 'BEHAVIOR' | 'IDENTIFICATION';
}
```

---

## 6. Traducao de Enums

```typescript
// src/constants/enums.ts
export const speciesLabel: Record<string, string> = {
  DOG: 'Cachorro',
  CAT: 'Gato',
};

export const sizeLabel: Record<string, string> = {
  SMALL: 'Pequeno',
  MEDIUM: 'Medio',
  LARGE: 'Grande',
};

export const sexLabel: Record<string, string> = {
  MALE: 'Macho',
  FEMALE: 'Femea',
  UNKNOWN: 'Nao informado',
};

export const reportStatusLabel: Record<string, string> = {
  LOST: 'Perdido',
  FOUND: 'Encontrado',
  CANCELLED: 'Cancelado',
};

export const characteristicCategoryLabel: Record<string, string> = {
  MARKING: 'Marcas',
  COAT: 'Pelagem',
  BEHAVIOR: 'Comportamento',
  IDENTIFICATION: 'Identificacao',
};

export const matchStatusLabel: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  DISMISSED: 'Descartado',
};
```

---

## 7. Navegacao (Expo Router)

### Fluxo de Autenticacao

```
app/index.tsx → verifica token no SecureStore
  ├── Token valido    → redirect para /(tabs)/
  └── Sem token/invalido → redirect para /(auth)/welcome
```

### Arvore de Navegacao

```
(auth)/ [Stack]
  ├── welcome          → Splash com botoes "Entrar" e "Criar conta"
  ├── login            → Login
  ├── register         → Registro
  ├── forgot-password  → Email para recuperacao
  ├── verify-code      → Codigo OTP 6 digitos
  └── reset-password   → Nova senha

(tabs)/ [Tab Navigator — requer auth]
  ├── index (Home)     → Mapa fullscreen com marcadores
  └── settings         → Menu de configuracoes

pet-report/[id]        → Detalhe do report (push da tab)
pets/                  → CRUD de pets (push de settings)
report-lost/           → Fluxo 3 steps (push de pet detail)
sighting/              → Formulario avistamento (push de report detail)
matches/               → Lista e detalhe de matches (push de report detail)
notifications          → Lista de notificacoes (push de home/settings)
phones/                → Gerenciar telefones (push de settings)
notification-settings  → Config notificacoes (push de settings)
change-password        → Alterar senha (push de settings)
```

### Tab Bar

| Tab | Label | Icone | Tela |
|---|---|---|---|
| Home | Home | map-pin | Mapa interativo |
| Config | Config | settings/gear | Settings |

- Ativa: `#AD4FFF` icone + texto
- Inativa: `#9B9C9D` icone + texto
- Badge de notificacao no icone de sino (floating no mapa) e dot na tab Config

---

## 8. Autenticacao

### Fluxo

1. **Login/Register** → API retorna `{ token, user }` → salvar token no `expo-secure-store` → atualizar store Zustand → redirect para `(tabs)`
2. **Interceptor Axios** → adiciona `Authorization: Bearer {token}` em todas as requests autenticadas
3. **401 response** → limpar token → redirect para `(auth)/login`
4. **Logout** → `POST /auth/logout` → limpar token + store → redirect para `(auth)/welcome`

### Auth Store (Zustand)

```typescript
interface AuthState {
  token: string | null;
  user: { id: number; name: string; email: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean; // true enquanto verifica token no boot
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>; // carrega token do SecureStore no boot
}
```

---

## 9. Telas — Ordem de Implementacao

A implementacao deve seguir esta ordem, que respeita dependencias entre telas:

### Fase 1: Fundacao

| # | Tela | Descricao | Doc de Referencia |
|---|---|---|---|
| 1 | Setup do projeto | Expo init, dependencias, NativeWind, fontes | — |
| 2 | Design system (ui/) | Button, Input, Badge, Card, Modal, Toast, Skeleton, EmptyState | 001 |
| 3 | API client + Auth store | Axios, interceptors, Zustand, SecureStore | — |
| 4 | Root layout + providers | QueryProvider, AuthProvider, font loading | — |

### Fase 2: Auth

| # | Tela | Descricao | Doc de Referencia |
|---|---|---|---|
| 5 | Welcome/Splash | Logo Empet + CTAs "Entrar"/"Criar conta" | 001 |
| 6 | Login | Email + senha, link para registro e forgot-password | 001 |
| 7 | Register | Nome + email + senha + confirmacao | 001 |
| 8 | Forgot Password (3 telas) | Email → OTP → Nova senha | 012 |

### Fase 3: Home (Mapa)

| # | Tela | Descricao | Doc de Referencia |
|---|---|---|---|
| 9 | Home/Mapa | Mapa fullscreen, marcadores, filtros, preview card | 002 |
| 10 | Pet Report Detail | Detalhe completo (fotos, info, caracteristicas, mapa, acoes) | 003 |

### Fase 4: Pets CRUD

| # | Tela | Descricao | Doc de Referencia |
|---|---|---|---|
| 11 | Lista Meus Pets | Cards com foto, nome, especie, status | 004 |
| 12 | Cadastrar/Editar Pet | Formulario completo com upload de fotos | 004 |
| 13 | Detalhe do Pet | Visualizacao read-only completa | 004 |

### Fase 5: Report + Sighting

| # | Tela | Descricao | Doc de Referencia |
|---|---|---|---|
| 14 | Reportar Pet Perdido (3 steps) | Selecionar pet → local → detalhes → sucesso | 005 |
| 15 | Formulario de Avistamento | Mapa + data + descricao + share phone | 006 |

### Fase 6: Matches

| # | Tela | Descricao | Doc de Referencia |
|---|---|---|---|
| 16 | Lista de Matches | Cards com score, fotos, atributos, acoes | 007 + 010 |
| 17 | Detalhe/Comparacao Match | Fotos lado a lado, tabela 3 estados, distancia | 007 + 010 |

### Fase 7: Settings + Extras

| # | Tela | Descricao | Doc de Referencia |
|---|---|---|---|
| 18 | Settings principal | Menu com links para sub-telas | 008 |
| 19 | Gerenciar Telefones | Lista + add/edit modal | 008 |
| 20 | Config Notificacoes | Toggles push notification | 008 |
| 21 | Alterar Senha | Form com senha atual + nova | 001 |
| 22 | Notificacoes | Lista paginada + badge global | 009 |

### Fase 8: Push Notifications

| # | Tela | Descricao | Doc de Referencia |
|---|---|---|---|
| 23 | Push notifications | Registro de device, handling, deep links | 009 |

---

## 10. Comportamentos Globais

### Loading States
- **Telas:** Skeleton/shimmer enquanto carrega dados
- **Botoes:** Spinner substituindo texto durante requests
- **Listas paginadas:** Spinner no bottom durante load mais

### Tratamento de Erros
- **422 (validacao):** Erros inline abaixo de cada campo
- **401:** Redirect automatico para login
- **429 (rate limit):** Toast "Muitas tentativas. Aguarde um momento."
- **500:** Toast generico "Erro inesperado. Tente novamente."
- **Sem internet:** Banner persistente no topo "Sem conexao"

### Paginacao
- API usa `page` e `per_page` query params (default: page=1, per_page=15)
- Resposta paginada retorna: `{ data: T[], links: {...}, meta: { total, current_page, per_page, last_page } }`
- Frontend usa infinite scroll com TanStack Query `useInfiniteQuery`
- Excecoes: matches (max 20, sem paginacao), mapa (paginate=false)

### Imagens
- Upload: multipart/form-data, max 5 fotos, 2MB cada, jpeg/png/webp
- Exibicao: usar `expo-image` para cache e lazy loading
- Placeholder: silhueta de pet em fundo `#F8F8F8`

### Mapa
- Provider: Google Maps (via `react-native-maps`)
- Localizacao inicial: GPS do dispositivo, fallback para centro da cidade
- Marcadores: roxo (#AD4FFF) para cachorro, laranja (#FFA001) para gato
- Debounce de 500ms ao mover o mapa antes de chamar API
- Raio dinamico baseado no zoom (max 100km)
- Pin fixo no centro para selecao de local (report/sighting)

### Datas
- API envia ISO 8601 (UTC)
- Exibir em pt-BR: "15 de marco de 2026, 14:00"
- Tempo relativo: "ha 3 dias", "ha 2 horas"
- Usar `date-fns` com locale `pt-BR`

---

## 11. Configuracao Inicial do Projeto

### Comandos para setup

```bash
# Criar projeto Expo com template
npx create-expo-app empet-mobile --template blank-typescript

cd empet-mobile

# Dependencias core
npx expo install expo-router expo-linking expo-constants expo-status-bar

# Estilizacao
npx expo install nativewind tailwindcss react-native-reanimated react-native-safe-area-context

# Estado e data fetching
npm install zustand @tanstack/react-query axios

# Formularios
npm install react-hook-form @hookform/resolvers zod

# Mapa
npx expo install react-native-maps expo-location

# Imagens
npx expo install expo-image-picker expo-image

# Notificacoes
npx expo install expo-notifications expo-device

# Storage seguro
npx expo install expo-secure-store

# Fontes
npx expo install expo-font @expo-google-fonts/montserrat

# Datas
npm install date-fns

# Gestures (necessario para bottom sheets, swipe, etc.)
npx expo install react-native-gesture-handler
```

### app.json (campos importantes)

```json
{
  "expo": {
    "name": "Empet",
    "slug": "empet",
    "scheme": "empet",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#AD4FFF"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.empet.app",
      "config": {
        "googleMapsApiKey": "SUA_CHAVE_AQUI"
      },
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Precisamos da sua localizacao para mostrar pets perdidos perto de voce.",
        "NSCameraUsageDescription": "Precisamos da camera para tirar fotos do pet.",
        "NSPhotoLibraryUsageDescription": "Precisamos acessar suas fotos para adicionar fotos do pet."
      }
    },
    "android": {
      "package": "com.empet.app",
      "config": {
        "googleMaps": {
          "apiKey": "SUA_CHAVE_AQUI"
        }
      },
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE"
      ]
    },
    "plugins": [
      "expo-router",
      "expo-location",
      "expo-image-picker",
      "expo-notifications",
      "expo-secure-store",
      "expo-font"
    ]
  }
}
```

### Variaveis de ambiente

Usar `expo-constants` + `.env`:

```
EXPO_PUBLIC_API_URL=http://localhost:8000
```

Acessar via:
```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL;
```

---

## 12. Validacao Client-Side (Zod Schemas)

Espelhar as regras do backend. Os schemas abaixo sao referencia para o agente criar os Zod schemas:

### Register
- `name`: obrigatorio, string, max 255
- `email`: obrigatorio, email valido, max 255
- `password`: obrigatorio, min 8, 1 maiuscula, 1 numero, 1 especial
- `password_confirmation`: obrigatorio, deve ser igual a password

### Login
- `email`: obrigatorio, email valido
- `password`: obrigatorio, string

### Forgot Password
- `email`: obrigatorio, email valido, max 255

### Verify Reset Code
- `email`: obrigatorio, email valido
- `code`: obrigatorio, exatamente 6 digitos numericos

### Reset Password
- `email`: obrigatorio, email valido
- `resetToken`: obrigatorio, string
- `password`: obrigatorio, min 8, 1 maiuscula, 1 numero, 1 especial
- `password_confirmation`: obrigatorio, igual a password

### Change Password
- `current_password`: obrigatorio, string
- `password`: obrigatorio, min 8, 1 maiuscula, 1 numero, 1 especial, diferente de current_password
- `password_confirmation`: obrigatorio, igual a password

### Store Pet
- `name`: obrigatorio, string, max 255
- `species`: obrigatorio, enum DOG|CAT
- `size`: obrigatorio, enum SMALL|MEDIUM|LARGE
- `sex`: obrigatorio, enum MALE|FEMALE|UNKNOWN
- `breed_id`: opcional, number
- `secondary_breed_id`: opcional, number, diferente de breed_id
- `breed_description`: opcional, string, max 255
- `primary_color`: opcional, string, max 100
- `notes`: opcional, string, max 1000
- `characteristic_ids`: opcional, array de numbers
- `photos`: opcional, array, max 5 itens, cada max 2MB, jpeg/png/webp

### Store Pet Report
- `pet_id`: obrigatorio, number
- `latitude`: obrigatorio, number, -90 a 90
- `longitude`: obrigatorio, number, -180 a 180
- `address_hint`: opcional, string, max 500
- `description`: opcional, string, max 2000
- `lost_at`: obrigatorio, date, <= agora

### Store Sighting
- `latitude`: obrigatorio, number, -90 a 90
- `longitude`: obrigatorio, number, -180 a 180
- `address_hint`: opcional, string, max 500
- `description`: opcional, string, max 2000
- `sighted_at`: obrigatorio, date, <= agora
- `share_phone`: opcional, boolean (default false)

### Store Phone
- `phone`: obrigatorio, string, max 20
- `is_whatsapp`: opcional, boolean
- `is_primary`: opcional, boolean
- `label`: opcional, string, max 50

### Update Notification Settings
- `notify_lost_nearby`: opcional, boolean
- `notify_matches`: opcional, boolean
- `notify_sightings`: opcional, boolean
- `nearby_radius_km`: opcional, number, 1 a 50

### Register Device
- `device_token`: obrigatorio, string, max 500
- `platform`: obrigatorio, enum IOS|ANDROID
- `device_name`: opcional, string, max 255

---

## 13. Documentacao de Layout (Referencia Visual)

### Docs de especificacao

Os docs de layout estao em `docs/layout/` no repositorio do backend. Cada um contem:
- Descricao detalhada de cada tela
- Specs de design (cores, fontes, tamanhos)
- Prompts para ferramentas de design (Pencil)
- Mapeamento API → tela
- Fluxos de interacao
- Comportamentos esperados

| Doc | Conteudo |
|---|---|
| `001-auth-screens.md` | Welcome, Login, Register, Change Password + paleta de cores + tipografia |
| `002-home-map-screen.md` | Mapa fullscreen, filtros, marcadores, preview card, tab bar |
| `003-pet-report-detail.md` | Detalhe completo do report (fotos, info, caracteristicas, mapa, acoes) |
| `004-my-pets-crud.md` | Lista, cadastro, edicao, detalhe, exclusao de pets |
| `005-report-lost-pet.md` | Fluxo 3 steps para reportar pet perdido |
| `006-pet-sighting.md` | Formulario de avistamento + lista de avistamentos |
| `007-matches.md` | Lista de matches, detalhe/comparacao, confirmacao |
| `008-settings.md` | Settings principal, telefones, notificacoes, logout |
| `009-notifications.md` | Lista de notificacoes, badge global |
| `010-match-scoring-indicators.md` | 3 estados visuais na comparacao de matches |
| `012-forgot-password.md` | Fluxo de recuperacao de senha (3 telas) |

### Layouts visuais no Pencil

Os layouts das telas mobile ja foram criados no **Pencil** e estao abertos no editor. O layer com todos os designs mobile se chama **"Mobile App - emPet"**. O agente deve usar as ferramentas do Pencil MCP para consultar os designs:

- Usar `get_editor_state()` para ver o arquivo .pen ativo
- Usar `batch_get(patterns)` para buscar componentes e telas pelo nome dentro do layer "Mobile App - emPet"
- Usar `get_screenshot()` para visualizar cada tela e validar a implementacao
- Usar `snapshot_layout()` para inspecionar a estrutura e espacamentos dos elementos

**IMPORTANTE:** O agente deve consultar os layouts no Pencil E ler os docs de layout antes de implementar cada tela. Os docs contem as specs tecnicas (endpoints, validacoes, comportamentos) e o Pencil contem a referencia visual final.

---

## 14. Regras para o Agente Frontend

1. **TypeScript obrigatorio** — sem `any`, tipar todas as props, responses e states
2. **Componentes funcionais** — usar hooks, nunca class components
3. **NativeWind** — toda estilizacao via classes Tailwind, nao usar StyleSheet.create
4. **Expo Router** — file-based routing, nao instalar react-navigation separadamente
5. **TanStack Query** — para TODA comunicacao com API. Nunca useEffect + fetch manual
6. **React Hook Form + Zod** — para TODO formulario. Nunca controlled inputs manuais
7. **Zustand** — apenas para estado global (auth, filtros). Estado local com useState
8. **Nunca hardcodar strings** — usar constantes de enums para labels traduzidos
9. **Tratar todos os status HTTP** — 200, 201, 401, 403, 422, 429, 500
10. **Loading states** — toda tela e botao deve ter estado de carregamento
11. **Empty states** — toda lista deve ter estado vazio com mensagem amigavel
12. **Validacao client-side** — com Zod, espelhando as regras do backend
13. **Idioma** — toda interface em portugues (pt-BR)
14. **Sem bibliotecas de UI** — construir componentes do zero com NativeWind (sem React Native Paper, NativeBase, etc.)
15. **Ler o doc de layout** — antes de implementar qualquer tela, ler o doc correspondente em `docs/layout/`
