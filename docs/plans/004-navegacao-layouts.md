# Fase 4: Layouts e Navegacao (Expo Router)

## Status: Parcialmente implementado (Fases 001-002)

## 4.1 Root Layout [Implementado]

- `app/_layout.tsx` — font loading + AppProviders → AuthProvider → Slot (nessa ordem)
- `AppProviders.tsx` e o agregador de providers globais (QueryClient, SafeArea, GestureHandler, StatusBar)
- Nao criar QueryProvider ou SafeAreaProvider separados no _layout

## 4.2 Auth Flow [Implementado]

- `AuthProvider` e o dono do fluxo de autenticacao:
  - Executa `hydrate()` do auth store (le token → valida via GET /auth/user)
  - Observa `hasHydrated` + `isAuthenticated`
  - Decide redirect com `useSegments()` + `router.replace()`
  - Centraliza `SplashScreen.hideAsync()` (nao no _layout.tsx)
- `app/index.tsx` — rota inicial minima exigida pelo Expo Router
  - Nao faz leitura direta do SecureStore
  - O redirect autoritativo e sempre do AuthProvider; index.tsx existe apenas como ponto de entrada estrutural

## 4.3 Auth Group [Layout implementado, telas sao placeholders]

- `app/(auth)/_layout.tsx` — Stack navigator [Implementado]
- `app/(auth)/welcome.tsx` — Splash com botoes "Entrar" e "Criar conta" [placeholder]
- `app/(auth)/login.tsx` — Login [placeholder, UI real na Fase 5]
- `app/(auth)/register.tsx` — Registro [placeholder, UI real na Fase 5]
- `app/(auth)/forgot-password.tsx` — Esqueci minha senha [placeholder, UI real na Fase 5]
- `app/(auth)/verify-code.tsx` — Verificar codigo OTP 6 digitos [placeholder, UI real na Fase 5]
- `app/(auth)/reset-password.tsx` — Nova senha [placeholder, UI real na Fase 5]

## 4.4 Tabs Group [Implementado]

- `app/(tabs)/_layout.tsx` — Tab navigator (4 tabs) [Implementado]
- `app/(tabs)/index.tsx` — Home/Mapa [implementado na Fase 6]
- `app/(tabs)/pets.tsx` — Pets [placeholder, conteudo real na Fase 8]
- `app/(tabs)/alerts.tsx` — Alertas [placeholder, conteudo real na Fase 12]
- `app/(tabs)/settings.tsx` — Settings [placeholder implementado, conteudo real na Fase 11]

### Tab Bar (conforme Pencil `5c7tg`)

| Tab | Label | Icone | Token ativo | Token inativo |
|---|---|---|---|---|
| Home | Home | map-pin | colors.primary.DEFAULT | colors.text.tertiary |
| Pets | Pets | paw-print | colors.primary.DEFAULT | colors.text.tertiary |
| Alertas | Alertas | bell | colors.primary.DEFAULT | colors.text.tertiary |
| Config | Config | settings | colors.primary.DEFAULT | colors.text.tertiary |

## 4.5 Mapa de Rotas Futuras (referencia)

> Estas rotas serao criadas nas fases respectivas. Listadas aqui apenas como referencia
> para o planejamento de navegacao.

| Rota | Descricao | Fase |
|---|---|---|
| `app/pet-report/[id].tsx` | Detalhe do report | 7 |
| `app/pets/index.tsx` | Lista meus pets | 8 |
| `app/pets/new.tsx` | Cadastrar pet | 8 |
| `app/pets/[id]/index.tsx` | Detalhe do pet | 8 |
| `app/pets/[id]/edit.tsx` | Editar pet | 8 |
| `app/report-lost/select-pet.tsx` | Step 1: selecionar pet | 9 |
| `app/report-lost/location.tsx` | Step 2: marcar local | 9 |
| `app/report-lost/details.tsx` | Step 3: detalhes da perda | 9 |
| `app/report-lost/success.tsx` | Tela de sucesso | 9 |
| `app/sighting/new.tsx` | Formulario de avistamento | 9 |
| `app/sighting/success.tsx` | Sucesso do avistamento | 9 |
| `app/matches/[reportId].tsx` | Lista de matches | 10 |
| `app/matches/[reportId]/[matchId].tsx` | Detalhe do match | 10 |
| `app/notifications.tsx` | Lista de notificacoes | 12 |
| `app/phones/index.tsx` | Gerenciar telefones | 11 |
| `app/notification-settings.tsx` | Config de notificacoes | 12 |
| `app/change-password.tsx` | Alterar senha | 11 |

## Fluxo de Autenticacao

```
App inicia → _layout.tsx carrega fontes → AppProviders → AuthProvider
  AuthProvider → hydrate() → le token → valida via GET /auth/user
    ├── Sessao valida    → isAuthenticated=true  → redirect /(tabs)
    └── Sem sessao       → isAuthenticated=false → redirect /(auth)/welcome

Login/Register → mutation onSuccess → setAuth(token, user) → AuthProvider detecta → redirect /(tabs)
Logout → POST /auth/logout (best-effort) → clearAuth() (idempotente) → AuthProvider detecta → redirect /(auth)/welcome
401 interceptor → clearAuth() (idempotente) → AuthProvider detecta → redirect /(auth)/welcome
```

## Verificacao

- [ ] Root layout carrega fontes e monta providers na ordem correta
- [ ] AuthProvider executa hydrate() e esconde splash apos hidratar e estabilizar o redirect
- [ ] Usuario nao autenticado e redirecionado para /(auth)/welcome
- [ ] Usuario autenticado e redirecionado para /(tabs)
- [ ] Tab bar renderiza com icones e cores corretas (tokens do Tailwind)
- [ ] Navegacao entre tabs funciona
- [ ] Stack navigator do grupo (auth) funciona (push/pop)
- [ ] Deep links: scheme do app abre corretamente
- [ ] Deep links: rota autenticada redireciona para welcome se nao logado
- [ ] Deep links: parametros dinamicos ([id]) funcionam quando as rotas forem criadas nas fases respectivas
