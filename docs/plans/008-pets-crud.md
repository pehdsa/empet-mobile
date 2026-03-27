# Fase 8: Pets CRUD

## Status: Implementado

## Referencia visual (Pencil)

- Meus Pets (lista): Node `mBKKq`
- Meus Pets (empty state): Node `JSEud`
- Cadastrar Pet: Node `wGs2G`
- Detalhes do Pet: Node `1aLEH`
- Modal confirmacao exclusao: Node `2SJ3Q`

## Pre-requisitos ja implementados

- **Types:** `src/types/pet.ts` (Pet, PetPhoto, PetSpecies, PetSize, PetSex), `src/types/breed.ts` (Breed), `src/types/characteristic.ts` (Characteristic, CharacteristicCategory)
- **API:** `breedsApi.list(species?)` [ja criado], `characteristicsApi.list()` [ja criado]
- **Hooks:** `useBreeds(species?)` [ja criado], `useCharacteristics()` [ja criado]
- **Query keys:** `breeds.all`, `breeds.bySpecies`, `characteristics.all` [ja existem]
- **Enums:** `speciesLabel`, `sizeLabel`, `sexLabel` [ja existem em `src/constants/enums.ts`]
- **Componentes reutilizaveis de `pet-report/`:**
  - `PhotoCarousel.tsx` — carrossel read-only (aceita `PetPhoto[]`, `PetSpecies`)
  - `CharacteristicsSection.tsx` — caracteristicas agrupadas por categoria com icones
  - `NotesCard.tsx` — card de notas
- **Componentes UI:** Screen, NavHeader, ButtonPrimary, ButtonSecondary, Card, Chip, Skeleton, Modal, BottomSheetModal, EmptyState, FAB, SelectField, ToggleButton, TextInput, Toast
- **Utils:** `mapApiErrors` (422 → react-hook-form), `formatDate`, `relativeTime`
- **Placeholder:** `src/app/(tabs)/pets.tsx` ja existe (texto placeholder)

**Nota sobre PetInfoSection:** O componente `pet-report/PetInfoSection.tsx` esta acoplado a `PetReportStatus`. Nao forcar reuso — criar `PetBasicInfo` proprio para o dominio de pets se necessario, ou extrair versao neutra.

## Escopo desta fase

**Incluido:**
- Tela de lista dos pets do usuario (tab Pets)
- Tela de cadastro de pet com upload de fotos
- Tela de detalhe do pet (read-only)
- Tela de edicao do pet (com gestao de fotos: adicionar novas, remover existentes)
- Toggle ativar/desativar pet
- Exclusao de pet com confirmacao

**Excluido (fases futuras):**
- Botao "Reportar perdido" na tela de detalhe → Fase 9
- Historico de reports do pet → Fase 9
- Reordenacao de fotos (backend nao tem endpoint dedicado)

---

## Decisao de navegacao

Rotas top-level (fora de `(tabs)`) para new/detail/edit — segue o pattern existente de `src/app/pet-report/[id].tsx`. Tab bar desaparece nessas telas (UX padrao mobile).

```
src/app/(tabs)/pets.tsx          → Lista (tab screen, infinite scroll)
src/app/pets/new.tsx             → Cadastrar (stack sobre tabs)
src/app/pets/[id]/index.tsx      → Detalhe (stack sobre tabs)
src/app/pets/[id]/edit.tsx       → Editar (stack sobre tabs)
```

Navegacao:
- Lista → Detalhe: `router.push({ pathname: "/pets/[id]", params: { id } })`
- Lista → Cadastrar: `router.push("/pets/new")`
- Detalhe → Editar: `router.push({ pathname: "/pets/[id]/edit", params: { id } })`
- Apos criar: usar `id` retornado na response do POST → `router.replace({ pathname: "/pets/[id]", params: { id: newId } })`
- Apos deletar: `router.replace("/(tabs)/pets")` + invalidar lista + remover detail do cache

---

## Contrato do backend

### POST `/pets` (create) — multipart/form-data

| Campo | Tipo | Validacao |
|-------|------|-----------|
| `name` | string | required, max:255 |
| `species` | enum | required, DOG \| CAT |
| `size` | enum | required, SMALL \| MEDIUM \| LARGE |
| `sex` | enum | required, MALE \| FEMALE \| UNKNOWN |
| `breed_id` | integer | nullable, exists, filtrado por species |
| `secondary_breed_id` | integer | nullable, exists, different:breed_id |
| `breed_description` | string | nullable, max:255 |
| `primary_color` | string | nullable, max:100 |
| `notes` | string | nullable, max:1000 |
| `characteristic_ids` | integer[] | nullable, each exists |
| `photos` | file[] | nullable, max 5 files, cada max 2MB, jpeg/png/webp |

### PUT `/pets/{id}` (update) — multipart/form-data

Mesmos campos do create, mais gestao de fotos:

| Campo | Tipo | Proposito |
|-------|------|-----------|
| (todos acima) | — | Mesma validacao |
| `new_photos` | file[] | Novas fotos a adicionar |
| `delete_photo_ids` | integer[] | IDs de fotos a remover |

**Regra:** total apos operacao `(current - deleted + new) <= 5`. Backend reindexa positions automaticamente.

### GET `/pets` (list) — paginado

Response: `PaginatedResponse<Pet>` com `data`, `meta`, `links`. Retorna apenas pets do usuario autenticado (nao deletados). `isActive` e flag separada de soft delete.

### GET `/pets/{id}` (detail)

Response: `ResourceResponse<Pet>` com objeto completo.

### DELETE `/pets/{id}`

Response: `{ data: { message: "..." } }`. Requer confirmacao no frontend.

### PATCH `/pets/{id}/toggle-active`

Body vazio. Response: `ResourceResponse<Pet>` com `isActive` invertido.

---

## Telas

### Lista Meus Pets (`src/app/(tabs)/pets.tsx`)
- Cards com foto, nome, especie, porte, badge ativo/inativo
- **Sem pets:** mostrar `EmptyState` com botao "Cadastrar pet", sem FAB
- **Com pets:** mostrar lista com infinite scroll + FAB "Cadastrar pet"
- **Loading inicial:** Skeleton ou ActivityIndicator
- **Erro:** estado de erro com botao retry
- Paginacao com infinite scroll (pattern de `useLostReportsList`)
- API: GET `/pets`
- **Nota:** GET `/pets` retorna apenas pets nao deletados. `isActive` e flag separada (pet inativo ≠ pet excluido)

### Cadastrar Pet (`src/app/pets/new.tsx`)
- **A tela cria o `useForm` e passa o form object para `PetForm`** (a tela controla o form, nao o componente — facilita integracao com `mapApiErrors`, submit, e effects de species/breed)
- Upload de fotos (max 5, 2MB cada, jpeg/png/webp) via `expo-image-picker`
- Campos: nome, especie, porte, sexo, raca (select filtrado por especie), raca secundaria, descricao da raca, cor primaria, notas
- Caracteristicas picker (multi-select por categoria)
- API: POST `/pets` (multipart/form-data)
- `onSuccess`: usar `response.data.data.id` para navegar ao detalhe

### Detalhe do Pet (`src/app/pets/[id]/index.tsx`)
- Parsear `id` da rota com `Number(params.id)`. Se `NaN`, exibir erro
- `usePet(id)` com `enabled: !isNaN(id)`
- Visualizacao read-only completa
- Reutilizar `PhotoCarousel`, `CharacteristicsSection`, `NotesCard` de `pet-report/`
- Botao "Editar" → `pets/[id]/edit`
- Toggle ativar/desativar → PATCH `/pets/{id}/toggle-active` (desabilitar toggle enquanto mutation roda para evitar double-tap)
- Botao "Excluir" → DELETE `/pets/{id}` (com confirmacao via Modal, Pencil node `2SJ3Q`)

### Editar Pet (`src/app/pets/[id]/edit.tsx`)
- **A tela cria o `useForm`** com `defaultValues` derivados do `usePet(id)`, passa form object para `PetForm`
- **Gestao de fotos no edit:**
  - Exibir fotos existentes (do backend, `PetPhoto[]`)
  - Permitir adicionar novas fotos (via `expo-image-picker`)
  - Permitir remover fotos existentes (marca para `delete_photo_ids`)
  - Validar: total apos operacao <= 5
  - Nao suportar reordenacao nesta fase
- API: PUT `/pets/{id}` (multipart/form-data com `new_photos` e `delete_photo_ids`)

---

## Componentes a criar

- `src/components/pet/PetCard.tsx` — card na lista (foto, nome, especie, porte, badge ativo/inativo)
- `src/components/pet/PetForm.tsx` — formulario reutilizavel (new/edit). **Recebe o form object da tela** (nao cria `useForm` internamente). Props: `form: UseFormReturn<PetFormValues>`, `mode: "create" | "edit"`. Responsavel apenas por renderizar os campos e o layout do formulario.
- `src/components/pet/PhotoUploader.tsx` — upload e preview de fotos. Gerencia estado misto de fotos existentes + novas. Cada item tem `id` estavel para render key (`existing-{photoId}` ou `local-{uri}`). Remocao: foto existente → entra em `delete_photo_ids`; foto local ainda nao enviada → so remove do estado local (sem ir para `delete_photo_ids`).
- `src/components/pet/CharacteristicsPicker.tsx` — multi-select agrupado por categoria via bottom sheet.

- `src/components/pet/PetBasicInfo.tsx` — nome, badges (especie/porte/sexo), raca, cor. Versao desacoplada de PetInfoSection (sem dependencia de `PetReportStatus`). Usado na tela de detalhe.

**Reuso de componentes existentes (detalhe do pet, read-only):**
- `pet-report/PhotoCarousel` → carrossel de fotos
- `pet-report/CharacteristicsSection` → caracteristicas
- `pet-report/NotesCard` → notas do dono

---

## Infraestrutura a criar nesta fase

### Types — adicionar em `src/types/pet.ts`

Apenas o tipo auxiliar de foto (estado misto local/backend). O shape do formulario (`PetFormValues`) sera inferido do schema Zod — nao duplicar aqui.

```typescript
/** Estado de uma foto no formulario */
export interface PhotoFormItem {
  /** ID estavel para render key: "existing-{id}" ou "local-{uri}" */
  id: string;
  /** Foto existente do backend (presente se veio do servidor) */
  existing?: PetPhoto;
  /** Nova foto local (presente se veio do image picker) */
  local?: { uri: string; mimeType: string; fileName: string };
}
```

### Query keys — adicionar em `src/constants/query-keys.ts`

```typescript
pets: {
  all: ["pets"] as const,
  list: () => ["pets", "list"] as const,
  detail: (id: number) => ["pets", "detail", id] as const,
},
```

### Modulo de API — `src/services/api/pets.ts`

```typescript
export const petsApi = {
  list(page?: number),                 // GET /pets?page=
  getDetail(id: number),               // GET /pets/{id}
  create(data: FormData),              // POST /pets (multipart)
  update(id: number, data: FormData),  // PUT /pets/{id} (multipart)
  delete(id: number),                  // DELETE /pets/{id}
  toggleActive(id: number),            // PATCH /pets/{id}/toggle-active
};
```

**Nota sobre Content-Type:** O `api` client define `"Content-Type": "application/json"` como default. Para requests com `FormData`, o Axios detecta automaticamente o boundary do multipart **se** nao for setado manualmente. Passar a instancia `FormData` diretamente.

### Hook — `src/hooks/usePets.ts`

- `usePets()` — `useInfiniteQuery`. `getNextPageParam`: retorna `meta.current_page + 1` se `meta.current_page < meta.last_page`, senao `undefined`. Retorna objeto do infinite query + `items` achatado (flatten de todas as paginas, pattern de `useLostReportsList`). Na UI, carregar proxima pagina apenas quando `hasNextPage && !isFetchingNextPage`.
- `usePet(id: number | null)` — `useQuery` para detalhe. `select: (r) => r.data.data`. `enabled: id !== null`. A tela parseia `Number(params.id)` e passa `null` se NaN (pattern consistente com `usePetReportDetail`).
- `useCreatePet()` — `useMutation`. `onSuccess`: invalidar `queryKeys.pets.all`. A tela usa `response.data.data.id` para navegar.
- `useUpdatePet()` — `useMutation`. `onSuccess`: invalidar `queryKeys.pets.all` + `queryKeys.pets.detail(id)`
- `useDeletePet()` — `useMutation`. `onSuccess`: invalidar `queryKeys.pets.all` + remover `queryKeys.pets.detail(id)` do cache
- `useTogglePetActive()` — `useMutation`. `onSuccess`: invalidar `queryKeys.pets.all` + `queryKeys.pets.detail(id)`. **Desabilitar o toggle na UI enquanto mutation estiver pendente** (sem optimistic update — toggle e acao sensivel e o custo de um round-trip e aceitavel)

### Schema — `src/features/pets/schemas/pet.schema.ts`

Zod schema com `import { z } from "zod"`. **Fonte de verdade do shape do formulario:**

```typescript
export const petSchema = z.object({ ... });
export type PetFormValues = z.infer<typeof petSchema>;
```

`PetFormValues` vive apenas aqui (nao duplicar em `types/pet.ts`). `PhotoFormItem` continua em `types/pet.ts` porque e tipo auxiliar usado fora do schema.

Validacoes espelham backend (max:255 nome, max:100 cor, max:1000 notas, fotos max 5 e max 2MB cada).

### Builders — `src/features/pets/utils/build-pet-form-data.ts`

Funcoes puras que convertem `PetFormValues` → `FormData`:
- `buildCreatePetFormData`: monta FormData com todos campos + `photos[]`
- `buildUpdatePetFormData`: monta FormData com campos + `new_photos[]` + `delete_photo_ids[]`

**Convencoes de serializacao para FormData:**

| Cenario | Comportamento |
|---------|---------------|
| Arrays com valores | Campos repetidos com `[]`: `characteristic_ids[]` = 1, `characteristic_ids[]` = 3 (padrao Laravel) |

**Atencao especial com arrays vazios no update (contrato do backend):**

O backend usa `$request->has()` para distinguir "campo omitido" de "campo enviado vazio":
- **Omitido** (`null` no DTO) = "nao mexer" — backend nao executa operacao
- **Array vazio `[]`** = "limpar tudo" — backend chama `sync([])` (para characteristics) ou `whereIn(id, [])` (para photos)
- **Array com valores** = "sincronizar com esses IDs"

Regras para os builders:

**Comportamento do backend no update — dois padroes distintos:**

O backend trata campos escalares e campos relacionais de forma diferente:

- **Campos escalares** (`name`, `species`, `size`, `sex`, `breed_id`, `secondary_breed_id`, `breed_description`, `primary_color`, `notes`): o controller **sempre** passa `$request->validated(campo)` para o DTO, sem `$request->has()`. Omitir = setar para `null`. **O builder de update deve sempre enviar todos os campos escalares.**

  Serializacao de escalares vazios no update:
  - IDs opcionais (`breed_id`, `secondary_breed_id`) quando null → enviar string vazia `""` (Laravel converte para `null` via `ConvertEmptyStringsToNull` middleware)
  - Strings opcionais (`breed_description`, `primary_color`, `notes`) quando vazias → enviar `""` (middleware converte para `null`)
  - No create: campos opcionais vazios podem ser omitidos (backend usa defaults)
- **Campos relacionais** (`characteristic_ids`, `delete_photo_ids`, `new_photos`): o controller usa `$request->has()` para distinguir omitido de vazio. Omitir = "nao mexer".

| Campo | Create | Update |
|-------|--------|--------|
| Campos escalares (name, species, breed_id, etc.) | Enviar obrigatorios, omitir opcionais se vazio | **Sempre enviar todos** (omitir = backend seta null) |
| `characteristic_ids` | Omitir se vazio | **Sempre enviar** (mesmo vazio = `sync([])` = limpar todas) |
| `delete_photo_ids` | N/A | Omitir se vazio (seguro — `whereIn([])` nao deleta nada) |
| `photos` / `new_photos` | Omitir se nenhuma foto | Omitir se nenhuma foto nova |

### Dependencias

- `expo-image-picker` — necessario (nao instalado). Instalar via `npx expo install expo-image-picker`

---

## Nota sobre breed dependente de species

No formulario, quando o usuario muda a `species`:
- Resetar `breedId` e `secondaryBreedId` para `null`
- Usar `useBreeds(watchedSpecies)` para buscar racas filtradas
- Exibir opcoes de raca em bottom sheet ou select

Quando `breedId` e `null`:
- `secondaryBreedId` deve ser resetado para `null` e **desabilitado** na UI (nao faz sentido raca secundaria sem primaria)

**Transicao no edit (remover raca):**
Se usuario remove raca principal no edit:
1. `breedId` → `null`
2. `secondaryBreedId` → `null` (reset automatico)
3. Builder envia ambos como `""` (middleware converte para null no backend)
4. Backend atualiza ambos para null

---

## Nota sobre expo-image-picker (permissoes e erros)

- Se usuario negar permissao da galeria → mostrar Toast informativo
- Se usuario cancelar selecao → nao tratar como erro (silencioso)
- Se arquivo invalido (tipo/tamanho) → mostrar Toast com mensagem amigavel ("Foto deve ser JPEG, PNG ou WebP e ter no maximo 2MB")

---

## Decisoes de edge cases

| Cenario | Comportamento |
|---------|---------------|
| Pet sem fotos | Exibir placeholder (icone de pet) no card e no carrossel |
| Pet sem caracteristicas | Ocultar secao de caracteristicas no detalhe |
| Pet sem raca | Exibir "Sem raca definida" (nao ocultar — da mais contexto) |
| Pet sem notas | Ocultar card de notas |
| Lista vazia | `EmptyState` com botao "Cadastrar pet", sem FAB |
| Lista com pets | Lista + FAB visivel |
| Loading inicial da lista | Skeleton ou ActivityIndicator |
| Erro na lista | Estado de erro com botao retry |
| Falha no upload | Exibir erro no Toast, nao salvar pet |
| Falha no toggle | Toast de erro, UI volta ao estado anterior (nao fez optimistic) |
| Falha no delete | Toast de erro, manter pet na lista |
| Fotos no edit: total > 5 | Desabilitar botao de adicionar quando atingir 5 |
| Mudar species no form | Resetar breed e secondary breed |
| breed_id null | Desabilitar secondary_breed_id |
| Id invalido na rota | Exibir estado de erro, nao chamar hook (sem retry util) |
| Erro na query de detalhe/edit | Estado de erro com botao retry (refetch) |
| Remover foto local (nao enviada) | Remove do estado local, nao vai para delete_photo_ids |
| Permissao galeria negada | Toast informativo |
| Selecao de foto cancelada | Silencioso |

---

## Sequencia de implementacao

1. Adicionar type `PhotoFormItem` em `src/types/pet.ts`
2. Adicionar query keys para pets em `src/constants/query-keys.ts`
3. Criar modulo API `src/services/api/pets.ts`
4. Criar hooks `src/hooks/usePets.ts`
5. Instalar `expo-image-picker`
6. Criar schema Zod `src/features/pets/schemas/pet.schema.ts`
7. Criar builders `src/features/pets/utils/build-pet-form-data.ts`
8. Criar componentes: `PhotoUploader` → `CharacteristicsPicker` → `PetForm` → `PetCard`
9. Implementar tela de lista (`src/app/(tabs)/pets.tsx`)
10. Implementar tela de cadastro (`src/app/pets/new.tsx`)
11. Implementar tela de detalhe (`src/app/pets/[id]/index.tsx`)
12. Implementar tela de edicao (`src/app/pets/[id]/edit.tsx`)

---

## Verificacao

- [ ] Lista de pets carrega com infinite scroll e items achatado
- [ ] Empty state aparece quando nao ha pets (sem FAB)
- [ ] FAB aparece quando ha pets na lista
- [ ] Loading/Skeleton aparece durante carregamento inicial
- [ ] Erro na lista exibe estado de erro com retry
- [ ] Cadastro de pet funciona com todos os campos
- [ ] Upload de fotos funciona (max 5, validacao de tamanho/tipo)
- [ ] Permissao de galeria negada mostra Toast
- [ ] Selecao de raca filtra por especie selecionada
- [ ] Reset de raca ao mudar especie
- [ ] Secondary breed desabilitado quando breed e null
- [ ] Selecao de caracteristicas funciona (multi-select por categoria)
- [ ] Validacoes Zod espelham backend
- [ ] Erros 422 do backend aparecem nos campos corretos (via `mapApiErrors`)
- [ ] Create usa id retornado na response para navegar ao detalhe
- [ ] Detalhe do pet exibe todas as informacoes
- [ ] Id invalido na rota exibe estado de erro
- [ ] Pet sem raca exibe "Sem raca definida"
- [ ] Edicao pre-preenche formulario e salva alteracoes
- [ ] Edicao permite adicionar novas fotos e remover existentes
- [ ] Limite de 5 fotos respeitado no edit (botao desabilitado)
- [ ] FormData serializa arrays com `[]` (padrao Laravel)
- [ ] Create: campos opcionais vazios omitidos do FormData
- [ ] Update: campos escalares sempre enviados (vazios como "" → middleware converte null)
- [ ] Toggle ativo/inativo funciona (desabilitado durante mutation)
- [ ] Exclusao com confirmacao funciona (modal Pencil `2SJ3Q`)
- [ ] Apos delete: volta para lista, cache invalidado, detail removido do cache
- [ ] Cache invalidado corretamente apos cada mutation
- [ ] Navegacao entre telas funciona corretamente
- [ ] `isActive` (flag) ≠ soft delete (nao exibe pets deletados)
- [ ] Update envia characteristic_ids mesmo vazio (clear all via sync)
- [ ] Update envia todos campos escalares (breed_id, etc.) — omitir = backend seta null
- [ ] Remover foto local nao envia delete_photo_ids
- [ ] Erro na query de detalhe/edit exibe erro com retry
- [ ] Infinite scroll respeita hasNextPage && !isFetchingNextPage
