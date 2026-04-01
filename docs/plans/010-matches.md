# Fase 10: Matches

Referência: layouts no Pencil (Nodes: DSTRs, uRqyk, 4Ttlg)

---

## Etapa 1 — Infraestrutura (API, Query Keys, Hook)

### 1.1 Query Keys

**Arquivo:** `src/constants/query-keys.ts` — adicionar:

```ts
matches: {
  byReport: (reportId: number, status?: MatchStatus) =>
    ["matches", "byReport", reportId, status] as const,
},
```

### 1.2 Módulo API

**Arquivo:** `src/services/api/matches.ts` (novo)

```ts
export const matchesApi = {
  list: (reportId: number, status?: MatchStatus) =>
    api.get<ResourceResponse<PetMatch[]>>(`/pet-reports/${reportId}/matches`, {
      params: { status },
    }),
  confirm: (reportId: number, matchId: number) =>
    api.patch<ResourceResponse<PetMatch>>(`/pet-reports/${reportId}/matches/${matchId}/confirm`),
  dismiss: (reportId: number, matchId: number) =>
    api.patch<ResourceResponse<PetMatch>>(`/pet-reports/${reportId}/matches/${matchId}/dismiss`),
};
```

### 1.3 Hook

**Arquivo:** `src/hooks/useMatches.ts` (novo)

- `useMatches(reportId, status?)` — `useQuery`, query key inclui status, enabled se `reportId != null`. O `select` normaliza `score` e `distanceMeters` de string para number:
  ```ts
  select: (r) => r.data.data.map(m => ({
    ...m,
    score: Number(m.score),
    distanceMeters: Number(m.distanceMeters),
  }))
  ```
  Assim a UI trabalha sempre com `number` — score badge, formatDistance, etc. ficam mais simples
- `useConfirmMatch()` — `useMutation`, invalida `["matches"]` (todas as tabs) e `["petReports"]` (report muda para FOUND). Retorna `ResourceResponse<PetMatch>` (match com status CONFIRMED). **Fluxo backend:** MarkPetReportFound muda report para FOUND + todos os pending viram DISMISSED → hard delete de todos os DISMISSED → só sobra o match CONFIRMED
- `useDismissMatch()` — `useMutation`, invalida `["matches"]` (suficiente: item sai de Pendentes e entra em Descartados, ambas as tabs são refetchadas). Retorna `ResourceResponse<PetMatch>` (match com status DISMISSED)

---

## Etapa 2 — Tela Lista de Matches

**Arquivo:** `src/app/matches/[reportId].tsx` (novo)

Dados do pet do report via `usePetReportDetail(reportId)` — fornece `report.pet.name` para o header e `report.pet` para fotos/comparação ("Seu pet").

Layout conforme design Node DSTRs:
- NavHeader "Matches para {petName}" — `petName` vem de `report.pet.name`
- Tabs de filtro: Pendentes | Confirmados | Descartados — chips horizontais
- **Badge count**: 3 queries paralelas (uma por status) alimentam tanto os counts quanto a lista da tab ativa (4 requests no total seria redundante — as 3 queries já trazem os dados). **Tradeoff consciente:** são 3 requests simultâneos para volume baixo (~20 itens), aceitável por simplicidade. Se custo de rede for problema, alternativa: remover badge counts nesta fase e usar só 1 query da tab ativa
- Lista de `MatchCard` — sem paginação (max 20 pending por report; dismissed/confirmed podem ser mais, mas raro)
- Lista vertical simples (sem grid)

### 2.1 Componente MatchCard

**Arquivo:** `src/components/match/MatchCard.tsx` (novo)

Props:
```ts
interface MatchCardProps {
  match: PetMatch;       // match normalizado (score/distance como number)
  pet: Pet;              // report.pet — necessário para fotos "Seu pet" e comparação de características
  onConfirm: () => void;
  onDismiss: () => void;
  onPress: () => void;   // tap fora dos botões → abre detalhe
}
```

Conforme design Node Ggogq:
- **Top row**: score badge (circle 40px com ícone smile, cor por score) + distância + chevron
- **Photo row**: duas fotos lado a lado ("Seu pet" / "Match") — 120px height, rounded-xl
- **Pet info**: sighting title + subtitle (espécie · porte · raça — fallback "Não informada" se breed null)
- **Chips row**: características em comum e divergentes
  - **Em comum** (verde `#43A04715`): interseção entre `report.pet.characteristics` e `match.sighting.characteristics`
  - **Divergentes** (cinza `#F8F8F8`): características do sighting que não existem no pet
- **Button row**: "É meu pet!" (bg `#43A047`, h-[40]) + "Não é" (outline border-border, texto `#E53935`, h-[40])
- **Interação**: tap no card (fora dos botões) → abre detalhe (`onPress`); tap nos botões → ação direta (`onConfirm`/`onDismiss`), sem navegar
- Se `isSightingDeleted`: badge "Avistamento removido", botões desabilitados
- Se status !== PENDING: botões ocultos

Cores do score badge:
- score >= 70: `#43A047` (verde) + ícone `smile`
- score >= 40: `#FFA001` (amarelo) + ícone `meh`
- score < 40: `#E53935` (vermelho) + ícone `frown`

---

## Etapa 3 — Tela Detalhe do Match

**Arquivo:** `src/app/matches/[reportId]/[matchId].tsx` (novo)

Dados: `usePetReportDetail(reportId)` para o pet do report + `useMatches(reportId)` sem filtro de status para localizar o match por `matchId`. **Premissa:** `GET /pet-reports/{reportId}/matches` sem query param `status` retorna todos os matches do report (não filtra por PENDING por default) — confirmar com backend se necessário. Volume baixo (max ~20 itens) não justifica endpoint de detalhe dedicado. Se match não encontrado: toast "Match não encontrado" + `router.back()`. **Nota:** se o histórico de confirmed/dismissed crescer significativamente, considerar endpoint de detalhe dedicado no futuro.

Layout conforme design Node uRqyk:

### Score Section
- Círculo grande (80px) com ícone + borda colorida por score (stroke 3px)
- Background: cor do score com 20% opacidade
- Label "Alta/Média/Baixa compatibilidade"
- Distância formatada

### Photo Section
- Fotos lado a lado (labels "Seu pet" / "Match")
- Badge "VS" circular (primary, 36px) sobreposto entre as fotos

### Comparison Table

**Arquivo:** `src/components/match/ComparisonTable.tsx` (novo)

Conforme design Node gbkBt — tabela com 3 estados visuais:
- Header (bg `#F8F8F8`): Atributo | Seu pet | Match | Status
- Rows: Espécie, Porte, Sexo, Raça, Cor
- **Cor** é texto livre (string comparison, não enum) — ex: "marrom e branco"
- **Raça** pode ser null em ambos os lados — tratar como "Incerto"
- Status circle (22px) com ícone:
  - **Match** (verde `#43A047`): ícone `check`, row bg `#43A04708`
  - **Incerto** (cinza `#9B9C9D`): ícone `minus`, row bg `#F8F8F8` — quando um ou ambos valores são null
  - **Divergente** (vermelho `#E53935`): ícone `x`, row bg `#E5393508`
- Legenda: Match · Incerto · Divergente

### Characteristics Section
- Título "Características em comum"
- Chips das características do sighting que também existem no pet (verde)

### Sighting Author Section
- Avatar (32px) + nome do avistante (`sighting.user.name`) — dados disponíveis via eager-load

### Location Section
- Mini mapa (140px, readonly) com marker na localização do sighting
- Endereço (addressHint) + distância formatada

### Bottom Bar (fixo)
- "É meu pet!" (bg `#43A047`, ícone `circle-check`, h-[52]) — abre modal de confirmação
- "Não é meu pet" (outline border-border, texto `#6B6C6D`, h-[52]) — chama dismiss
- Se `isSightingDeleted`: botões desabilitados, banner "Avistamento removido"
- Se status !== PENDING: botões ocultos

---

## Etapa 4 — Modal de Confirmação

Conforme design Node 4Ttlg — usar `Dialog` existente (`src/components/ui/Dialog.tsx`):
- Ícone `party-popper` (28px, `#43A047`) em círculo 56px (bg `#43A04720`)
- Título "Confirmar que é seu pet?"
- Descrição: "Ao confirmar, o reporte será atualizado como "encontrado" e o avistante será notificado. Essa ação não pode ser desfeita."
- Botão "Sim, é meu pet!" (bg `#43A047`, h-[52], rounded-[14])
- Botão "Cancelar" (outline border `#6B6C6D` thickness 1.5, h-[52], rounded-[14], full width)

### Comportamento pós-confirmação
- Report vira FOUND → tela de matches perde sentido
- Após sucesso do confirm:
  - Toast de sucesso
  - ```ts
    router.replace({
      pathname: "/(pets)/[id]",
      params: { id: String(report.pet.id) },
    })
    ```
  - Funciona tanto a partir da lista quanto do detalhe do match

---

## Etapa 5 — Conectar navegação

### 5.1 Pet Detail → Matches

**Arquivo:** `src/app/pets/[id]/index.tsx`

Trocar `showToast("Em breve")` por navegação:
```ts
router.push({
  pathname: "/matches/[reportId]",
  params: { reportId: String(activeReport.id) },
})
```

### 5.2 Pet Sighting Detail → "É meu pet!"

**Arquivo:** `src/app/pet-sighting/[id].tsx`

O botão "É meu pet!" não se conecta ao fluxo de matches (matches são gerados pelo backend automaticamente). Atualizar para `showToast("Em breve")` até que o fluxo de reivindicação seja definido.

---

## Arquivos

| Arquivo | Ação |
|---------|------|
| `src/constants/query-keys.ts` | Adicionar `matches` |
| `src/services/api/matches.ts` | Criar |
| `src/hooks/useMatches.ts` | Criar |
| `src/app/matches/[reportId].tsx` | Criar (lista) |
| `src/app/matches/[reportId]/[matchId].tsx` | Criar (detalhe) |
| `src/components/match/MatchCard.tsx` | Criar |
| `src/components/match/ComparisonTable.tsx` | Criar |
| `src/app/pets/[id]/index.tsx` | Atualizar navegação |
| `src/app/pet-sighting/[id].tsx` | Adicionar toast temporário |

## Componentes reutilizados

| Componente | Path |
|------------|------|
| `Dialog` | `src/components/ui/Dialog.tsx` |
| `ButtonPrimary` | `src/components/ui/ButtonPrimary.tsx` |
| `NavHeader` | `src/components/ui/NavHeader.tsx` |
| ~~`CharacteristicsSection`~~ | Não reutilizar — chips "em comum" e "divergentes" no match têm lógica e visual próprios; implementar inline nos componentes de match |
| `formatDistance` | `src/utils/format-distance.ts` |
| `relativeTime` | `src/utils/relative-time.ts` |
| `speciesLabel`, `sizeLabel`, `sexLabel`, `matchStatusLabel` | `src/constants/enums.ts` |

## Types existentes (já atualizados)

```ts
// src/types/match.ts
export type MatchStatus = "PENDING" | "CONFIRMED" | "DISMISSED";
export interface PetMatch {
  id: number;
  reportId: number;
  sightingId: number;
  score: number;
  distanceMeters: number;
  status: MatchStatus;
  sighting: PetSighting;
  isSightingDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
// Nota: API retorna score e distanceMeters como string (decimal cast).
// A normalização para number é feita no select do useMatches hook.
```

## Verificação

- `npx tsc --noEmit` — sem erros
- Pet Detail → "Ver Matches" → abre lista de matches
- Lista filtra por status via query param (tabs Pendentes/Confirmados/Descartados)
- Confirmar match invalida todas as tabs — backend faz hard delete de todos os DISMISSED + converte PENDING restantes em DISMISSED e deleta também. Após confirmar, só sobra o match CONFIRMED. Tabs "Pendentes" e "Descartados" esvaziam
- Card mostra score com cor, fotos lado a lado, info, chips, botões
- Tap no card → abre detalhe com comparação visual (3 estados)
- "É meu pet!" → modal de confirmação → confirma → report muda para FOUND
- "Não é meu pet" → dismiss funciona
- `isSightingDeleted` → botões desabilitados, badge visível
