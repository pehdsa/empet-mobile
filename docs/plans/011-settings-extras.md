# Fase 11: Settings + Extras

Referencia: `docs/layout/008-settings.md` + layouts no Pencil

## Telas

### Settings Principal (`app/(tabs)/settings.tsx`)
- Menu com links:
  - Meus Pets → /pets
  - Telefones → /phones
  - Notificacoes → /notification-settings
  - Alterar Senha → /change-password
  - Logout (com confirmacao)
- Info do usuario (nome, email) no topo

### Gerenciar Telefones (`app/phones/index.tsx`)
- Lista de telefones (max 5)
- Botao adicionar → modal com campos:
  - Telefone (obrigatorio, max 20, com mascara)
  - Label (opcional, max 50)
  - Toggle WhatsApp
  - Toggle Primario
- Editar → mesmo modal pre-preenchido
- Excluir com confirmacao
- APIs: GET/POST/PUT/DELETE `/user/phones`

### Config Notificacoes (`app/notification-settings.tsx`)
- Toggles:
  - Notificar pets perdidos por perto (notify_lost_nearby)
  - Notificar matches encontrados (notify_matches)
  - Notificar avistamentos (notify_sightings)
- Slider/input raio em km (nearby_radius_km, 1-50)
- API: GET/PUT `/user/notification-settings`

### Alterar Senha (`app/change-password.tsx`)
- Campo senha atual
- Campo nova senha (regras: min 8, 1 maiuscula, 1 numero, 1 especial)
- Campo confirmar nova senha
- Validacao: nova senha diferente da atual
- API: PUT `/auth/password`

## Infraestrutura a criar nesta fase

Estes itens foram adiados da Fase 2 para nascer junto com a feature:

- **Modulo de API:** `src/services/api/phones.ts` — listar, criar, editar, deletar telefones
- **Hook:** `src/hooks/usePhones.ts` — usePhones, useCreatePhone, useUpdatePhone, useDeletePhone

> O modulo de notification-settings pode ficar em `src/services/api/notifications.ts` (criado na Fase 12) ou num arquivo proprio se necessario antes.

## Verificacao

- Menu settings navega corretamente
- CRUD telefones funciona
- Toggles de notificacao persistem
- Logout limpa estado e redireciona
- Alterar senha valida e funciona
