# Fase 6: Home / Mapa

Referencia: `docs/layout/002-home-map-screen.md` + layouts no Pencil

## Tela: Home/Mapa (`app/(tabs)/index.tsx`)

### Mapa Fullscreen
- Provider: Google Maps (react-native-maps)
- Localizacao inicial: GPS do dispositivo, fallback centro da cidade
- Marcadores: roxo (#AD4FFF) para cachorro, laranja (#FFA001) para gato
- Debounce 500ms ao mover o mapa antes de chamar API
- Raio dinamico baseado no zoom (max 100km)

### Componentes do Mapa
- `src/components/map/PetMarker.tsx` — marcador customizado por especie
- `src/components/map/FilterBar.tsx` — filtros species/size (horizontal scroll)
- `src/components/map/PetPreviewCard.tsx` — card preview ao tocar marcador
- `src/components/map/CenterPin.tsx` — pin fixo no centro (para selecao de local)

### Filtros
- Especie: Todos / Cachorro / Gato
- Porte: Todos / Pequeno / Medio / Grande
- Gerenciados pelo `map-filters.store.ts` (Zustand)

### API
- GET `/pet-reports?status=LOST&latitude=X&longitude=Y&radius_km=Z&species=DOG&size=SMALL&paginate=false`
- Chamada via TanStack Query, refetch ao mover mapa ou mudar filtros

### Interacoes
- Tap em marcador → mostra PetPreviewCard (bottom)
- Tap no PetPreviewCard → navega para pet-report/[id]
- FAB (56x56, circular) para "Reportar pet perdido" → navega para report-lost/

### Badge de Notificacao
- Icone de sino flutuante no mapa com badge de contagem nao lidas
- GET `/user/notifications/unread-count`

## Infraestrutura a criar nesta fase

Estes itens foram adiados da Fase 2 para nascer junto com a feature:

- **Modulo de API:** `src/services/api/pet-reports.ts` — listagem com filtros, detalhe, criar, cancelar, marcar encontrado
- **Hook:** `src/hooks/usePetReports.ts` — usePetReports (lista com filtros), usePetReport, useCreateReport, useCancelReport, useMarkFound
- **Dependencias:** instalar `react-native-maps` e `expo-location` via `npx expo install`
- **Hook:** `src/hooks/useLocation.ts` — GPS do dispositivo
- **Store:** `src/stores/map-filters.store.ts` — species, size filters (Zustand, sem persistencia)
- **Query keys:** adicionar `petReports` em `src/constants/query-keys.ts`

## Verificacao

- Mapa carrega com localizacao do dispositivo
- Marcadores aparecem com cores corretas
- Filtros funcionam
- Preview card aparece ao tocar marcador
- Navegacao para detalhe funciona
