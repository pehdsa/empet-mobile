# Fase 12: Notificacoes + Push

Referencia: `docs/layout/009-notifications.md` + layouts no Pencil

## Telas

### Lista de Notificacoes (`app/notifications.tsx`)
- Lista paginada com infinite scroll
- Tipos: pet_lost_nearby, matches_found, pet_sighting_reported
- Cada card mostra: titulo, corpo, tempo relativo, indicador lida/nao-lida
- Tap → navega para tela relacionada (report, matches)
- Botao "Marcar todas como lidas"
- APIs:
  - GET `/user/notifications` (paginado)
  - PATCH `/user/notifications/{id}/read`
  - PATCH `/user/notifications/read-all`

### Badge Global
- Contagem de nao lidas exibida:
  - No icone de sino flutuante do mapa
  - Dot na tab Config
- API: GET `/user/notifications/unread-count`
- Polling ou refetch periodico

## Push Notifications

### Registro de Device
- No login/app boot: solicitar permissao push
- Obter token via `expo-notifications`
- Registrar: POST `/user/devices` com { device_token, platform: IOS|ANDROID, device_name }
- No logout: DELETE `/user/devices/{id}`

### Handling
- Notification received (app em foreground): mostrar banner/toast
- Notification tapped (app em background/closed): navegar para tela relacionada via deep link
- Dados da notification: { report_id, pet_name, title, body }

### Deep Links
- Schema `empet://`
- Rotas: pet-report/[id], matches/[reportId]

## Componentes
- `src/components/notification/NotificationCard.tsx` — card na lista
- `src/components/notification/NotificationBadge.tsx` — badge de contagem

## Infraestrutura a criar nesta fase

Estes itens foram adiados da Fase 2 para nascer junto com a feature:

- **Modulo de API:** `src/services/api/notifications.ts` — listar notificacoes, marcar lida, marcar todas lidas, unread count, devices CRUD, notification-settings
- **Hook:** `src/hooks/useNotifications.ts` — useNotifications, useMarkRead, useMarkAllRead, useUnreadCount
- **Dependencias:** instalar `expo-notifications` e `expo-device` via `npx expo install`

## Verificacao

- Lista de notificacoes carrega e pagina
- Marcar como lida funciona
- Badge atualiza em tempo real
- Push token registra no backend
- Deep links navegam corretamente
