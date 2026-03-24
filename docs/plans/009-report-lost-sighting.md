# Fase 9: Reportar Pet Perdido + Avistamento

## Reportar Pet Perdido (3 steps)

Referencia: `docs/layout/005-report-lost-pet.md` + layouts no Pencil

### Step 1: Selecionar Pet (`app/report-lost/select-pet.tsx`)
- Lista de pets do usuario (ativos, sem report ativo)
- Selecionar um pet → proximo step

### Step 2: Marcar Local (`app/report-lost/location.tsx`)
- Mapa fullscreen com CenterPin fixo no centro
- Usuario move o mapa para posicionar o pin
- Campo opcional: dica de endereco (address_hint)
- Botao "Confirmar local"

### Step 3: Detalhes (`app/report-lost/details.tsx`)
- Campo descricao (opcional, max 2000)
- Data/hora da perda (obrigatorio, <= agora)
- Resumo: pet selecionado + local marcado
- Botao "Reportar perdido" → POST `/pet-reports`

### Sucesso (`app/report-lost/success.tsx`)
- Mensagem de sucesso
- Botao "Ver no mapa" → volta para home
- Botao "Ver report" → pet-report/[id]

## Avistamento

Referencia: `docs/layout/006-pet-sighting.md` + layouts no Pencil

### Formulario (`app/sighting/new.tsx`)
- Recebe reportId via query param
- Mapa com CenterPin para marcar local do avistamento
- Data/hora do avistamento (obrigatorio, <= agora)
- Descricao (opcional, max 2000)
- Dica de endereco (opcional, max 500)
- Toggle "Compartilhar meu telefone" (share_phone)
- API: POST `/pet-reports/{reportId}/sightings`

### Sucesso (`app/sighting/success.tsx`)
- Mensagem de agradecimento
- Botao "Voltar ao mapa"

## Infraestrutura a criar nesta fase

Estes itens foram adiados da Fase 2 para nascer junto com a feature:

- **Hook:** `src/hooks/useSightings.ts` — useSightings, useCreateSighting

> O modulo `src/services/api/pet-reports.ts` ja deve existir (criado na Fase 6). Se sightings tiverem funcoes de API separadas, adicionar em `pet-reports.ts` ou criar `src/services/api/sightings.ts` conforme necessidade.

## Verificacao

- Fluxo 3 steps completo funciona
- Localizacao no mapa funciona
- Avistamento cria registro na API
- Validacoes Zod corretas
