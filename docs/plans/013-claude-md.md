# Plano: Criar CLAUDE.md para empet-mobile

## Contexto

O projeto acumulou muitas decisoes arquiteturais, convencoes e padroes ao longo das Fases 1 e 2. Sem um CLAUDE.md, cada nova conversa precisa redescobrir esses padroes lendo os arquivos ou os planos. O CLAUDE.md serve como guia rapido para que o Claude (e o desenvolvedor) sigam os padroes estabelecidos sem desviar.

## Estrutura proposta do CLAUDE.md

### 1. Projeto
- O que e, stack principal

### 2. Comandos
- Como rodar, testar, lint, instalar deps

### 3. Estrutura de diretorios
- Layout resumido de `app/` e `src/`

### 4. Regras criticas

Bloco de regras de ouro que evitam desvios:

- Nunca criar novos patterns sem seguir os existentes
- Nunca duplicar fonte de verdade (ex: cores fora do tailwind.config.ts)
- Sempre usar `ResourceResponse<T>` para responses da API
- Nunca usar Zustand para server state (usar React Query)
- Hooks e modulos de API de dominio devem nascer junto com a feature
- Nunca hardcodar versao da API — base path e `/api/v1` definido no client

### 5. Naming

Convencoes de nomeacao para manter consistencia:

- Arquivos de componente/provider: `PascalCase.tsx`
- Hooks: `useXxx.ts`
- Schemas: `xxx.schema.ts`
- Modulos de API: `xxx.ts` (objeto exportado como `xxxApi`)
- Types: `xxx.ts` (PascalCase nos exports)
- Utils: `kebab-case.ts`
- Constantes: `kebab-case.ts`

### 6. Padroes de codigo
- **Types:** unions reutilizaveis, ResourceResponse, payloads separados de responses
- **API:** modulos como objeto, interceptors, baseURL do .env
- **Hooks:** React Query wrappers com query keys centralizadas, select para extrair data
- **Stores:** Zustand para auth, React Query para server state
- **Schemas:** Zod em `src/features/[feature]/schemas/`, tipo inferido com z.infer
- **Providers:** AppProviders + AuthProvider, SplashScreen centralizado no AuthProvider
- **Enums:** apenas labels para UI, type-safe com unions do dominio
- **Estilizacao:** NativeWind v4 + Tailwind como fonte unica de tokens, sem colors.ts

### 7. Navegacao (Expo Router)

- File-based routing com grupos:
  - `/(auth)` — telas publicas (Stack)
  - `/(tabs)` — telas autenticadas (Tabs: Home + Config)
- AuthProvider controla redirect baseado em auth state + `useSegments()`
- Nunca navegar manualmente fora desse fluxo de auth
- typedRoutes habilitado — rotas tipadas em compile-time

### 8. Decisoes arquiteturais
- Dependencias e permissoes faseadas (instalar quando precisar)
- Hooks e modulos de API nascem com a feature
- clearAuth em erro de rede no hydrate (decisao de UX)
- app.config.ts em vez de app.json
- Base path da API: `/api/v1` (definido uma vez no client Axios)

### 9. Backend
- empet-backend no Docker, Laravel 12, Sanctum
- Convencoes de resposta: camelCase em data, snake_case em paginacao
- Endpoint de sessao: `GET /api/v1/auth/user` (sem phones)
- Versionamento: `/api/v1` — nunca hardcodar em multiplos lugares

### 10. Como criar uma nova feature

Checklist operacional para manter consistencia:

1. Criar types em `src/types/` (se necessario)
2. Adicionar query keys em `src/constants/query-keys.ts`
3. Criar modulo API em `src/services/api/`
4. Criar hook React Query em `src/hooks/`
5. Criar schemas Zod em `src/features/[feature]/schemas/` (se tiver form)
6. Criar telas em `app/`
7. Instalar dependencias necessarias via `npx expo install`

### 11. Fases do projeto
- Tabela com as 12 fases e status

## O que NAO incluir

- Codigo completo dos arquivos (pode ser lido direto)
- Detalhes de implementacao que mudam frequentemente
- Informacoes que o git log ou os proprios arquivos ja fornecem

## Verificacao

- CLAUDE.md existe na raiz do projeto
- Conteudo e conciso (< 200 linhas)
- Cobre os padroes que realmente impactam decisoes
- Regras criticas estao explicitas
- Checklist de nova feature esta operacional
