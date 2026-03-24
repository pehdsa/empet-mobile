# Fase 4: Layouts e Navegacao (Expo Router)

## 4.1 Root Layout

- `app/_layout.tsx` — providers (QueryProvider, AuthProvider), font loading, SafeAreaProvider

## 4.2 Auth Check

- `app/index.tsx` — verifica token no SecureStore → redirect para (tabs) ou (auth)/welcome

## 4.3 Auth Group

- `app/(auth)/_layout.tsx` — Stack navigator
- `app/(auth)/welcome.tsx` — Splash com botoes "Entrar" e "Criar conta"
- `app/(auth)/login.tsx` — Login
- `app/(auth)/register.tsx` — Registro
- `app/(auth)/forgot-password.tsx` — Esqueci minha senha
- `app/(auth)/verify-code.tsx` — Verificar codigo OTP 6 digitos
- `app/(auth)/reset-password.tsx` — Nova senha

## 4.4 Tabs Group

- `app/(tabs)/_layout.tsx` — Tab navigator (Home + Config)
- `app/(tabs)/index.tsx` — Home/Mapa
- `app/(tabs)/settings.tsx` — Settings principal

### Tab Bar

| Tab | Label | Icone | Cor ativa | Cor inativa |
|---|---|---|---|---|
| Home | Home | map-pin | #AD4FFF | #9B9C9D |
| Config | Config | settings/gear | #AD4FFF | #9B9C9D |

## 4.5 Telas Autenticadas (push screens)

- `app/pet-report/[id].tsx` — Detalhe do report
- `app/pets/index.tsx` — Lista meus pets
- `app/pets/new.tsx` — Cadastrar pet
- `app/pets/[id]/index.tsx` — Detalhe do pet
- `app/pets/[id]/edit.tsx` — Editar pet
- `app/report-lost/select-pet.tsx` — Step 1: selecionar pet
- `app/report-lost/location.tsx` — Step 2: marcar local
- `app/report-lost/details.tsx` — Step 3: detalhes da perda
- `app/report-lost/success.tsx` — Tela de sucesso
- `app/sighting/new.tsx` — Formulario de avistamento
- `app/sighting/success.tsx` — Sucesso do avistamento
- `app/matches/[reportId].tsx` — Lista de matches por report
- `app/matches/[reportId]/[matchId].tsx` — Detalhe/comparacao do match
- `app/notifications.tsx` — Lista de notificacoes
- `app/phones/index.tsx` — Gerenciar telefones
- `app/notification-settings.tsx` — Config de notificacoes
- `app/change-password.tsx` — Alterar senha

## Fluxo de Autenticacao

```
app/index.tsx → verifica token no SecureStore
  ├── Token valido    → redirect para /(tabs)/
  └── Sem token/invalido → redirect para /(auth)/welcome
```

- Login/Register → API retorna { token, user } → salvar no SecureStore → Zustand → redirect (tabs)
- Interceptor Axios → Authorization: Bearer {token}
- 401 response → limpar token → redirect (auth)/login
- Logout → POST /auth/logout → limpar token + store → redirect (auth)/welcome

## Verificacao

- Navegacao auth → tabs funciona
- Redirect baseado em estado de auth
- Tab bar renderiza com icones corretos
- Deep links funcionam
