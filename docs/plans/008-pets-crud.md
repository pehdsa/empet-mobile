# Fase 8: Pets CRUD

Referencia: `docs/layout/004-my-pets-crud.md` + layouts no Pencil

## Telas

### Lista Meus Pets (`app/pets/index.tsx`)
- Cards com foto, nome, especie, porte, status ativo/inativo
- Empty state: "Voce ainda nao cadastrou nenhum pet"
- Botao "Cadastrar pet" (FAB ou botao no empty state)
- Paginacao com infinite scroll
- API: GET `/pets`

### Cadastrar Pet (`app/pets/new.tsx`)
- Formulario com React Hook Form + Zod
- Upload de fotos (max 5, 2MB cada, jpeg/png/webp) via expo-image-picker
- Campos: nome, especie, porte, sexo, raca (select filtrado por especie), raca secundaria, descricao da raca, cor primaria, notas
- Caracteristicas picker (multi-select por categoria)
- API: POST `/pets` (multipart/form-data)
- APIs de referencia: GET `/breeds?species=DOG`, GET `/characteristics`

### Detalhe do Pet (`app/pets/[id]/index.tsx`)
- Visualizacao read-only completa
- Fotos, todas as infos, caracteristicas
- Botao "Editar" → pets/[id]/edit
- Botao "Reportar perdido" → report-lost/select-pet (se nao tem report ativo)
- Toggle ativar/desativar → PATCH `/pets/{id}/toggle-active`
- Botao "Excluir" → DELETE `/pets/{id}` (com confirmacao)

### Editar Pet (`app/pets/[id]/edit.tsx`)
- Mesmo formulario do cadastro, pre-preenchido
- API: PUT `/pets/{id}`

## Componentes
- `src/components/pet/PetCard.tsx` — card na lista
- `src/components/pet/PetForm.tsx` — formulario reutilizavel (new/edit)
- `src/components/pet/PhotoUploader.tsx` — upload e preview de fotos
- `src/components/pet/CharacteristicsPicker.tsx` — multi-select agrupado

## Infraestrutura a criar nesta fase

Estes itens foram adiados da Fase 2 para nascer junto com a feature:

- **Modulo de API:** `src/services/api/pets.ts` — CRUD completo (listar, criar, detalhe, editar, deletar, toggle-active)
- **Hook:** `src/hooks/usePets.ts` — usePets (lista paginada), usePet, useCreatePet, useUpdatePet, useDeletePet, useTogglePetActive
- **Dependencias:** instalar `expo-image-picker` e `expo-image` via `npx expo install`

## Verificacao

- CRUD completo funciona
- Upload de fotos funciona
- Validacoes Zod espelham backend
- Toggle ativo/inativo funciona
- Exclusao com confirmacao
