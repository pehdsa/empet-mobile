# Reorganizar rotas app/ — Groups por domínio

## Contexto

As rotas em `src/app/` estão flat (pets/, pet-report/, pet-sighting/, sighting/, report-lost/). Reorganizar usando groups `()` para agrupar por domínio sem mudar URLs nem comportamento visual. Telas de detalhe/forms continuam como Stack push sem tab bar.

## Estrutura atual → nova

```
src/app/
├── (auth)/                    # ✅ já existe, sem mudanças
│   ├── _layout.tsx
│   ├── welcome.tsx
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   ├── verify-code.tsx
│   └── reset-password.tsx
│
├── (tabs)/                    # ✅ já existe, sem mudanças
│   ├── _layout.tsx
│   ├── index.tsx              # Perdidos
│   ├── sightings.tsx          # Avistados
│   ├── pets.tsx               # Meus Pets
│   ├── alerts.tsx             # Alertas
│   └── settings.tsx           # Config
│
├── (pets)/                    # 🆕 group (antes: pets/)
│   ├── _layout.tsx            # Stack headerShown: false
│   ├── new.tsx                # /pets/new → /(pets)/new
│   └── [id]/
│       ├── index.tsx          # /pets/[id] → /(pets)/[id]
│       └── edit.tsx           # /pets/[id]/edit → /(pets)/[id]/edit
│
├── (reports)/                 # 🆕 group (antes: pet-report/ + report-lost/)
│   ├── _layout.tsx            # Stack headerShown: false
│   ├── [id].tsx               # /pet-report/[id] → /(reports)/[id]
│   ├── lost/
│   │   ├── [petId].tsx        # /report-lost/[petId] → /(reports)/lost/[petId]
│   │   ├── success.tsx        # /report-lost/success → /(reports)/lost/success
│   │   └── update/
│   │       └── [reportId].tsx # /report-lost/update/[reportId] → /(reports)/lost/update/[reportId]
│   └── sighting/              # Avistamento vinculado a report
│       ├── new.tsx            # /sighting/new → /(reports)/sighting/new
│       └── success.tsx        # /sighting/success → /(reports)/sighting/success
│
├── (sightings)/               # 🆕 group (antes: pet-sighting/)
│   ├── _layout.tsx            # Stack headerShown: false
│   ├── new.tsx                # /pet-sighting/new → /(sightings)/new
│   ├── [id].tsx               # /pet-sighting/[id] → /(sightings)/[id]
│   └── success.tsx            # /pet-sighting/success → /(sightings)/success
│
├── (matches)/                 # 🆕 group (futuro, fase 10)
│   ├── _layout.tsx            # Stack headerShown: false
│   ├── [reportId].tsx         # Lista de matches
│   └── [reportId]/
│       └── [matchId].tsx      # Detalhe do match
│
├── _layout.tsx                # Root layout (sem mudanças)
└── index.tsx                  # Auth redirect (sem mudanças)
```

## Mudanças necessárias

### 1. Criar _layout.tsx para cada group

Cada group precisa de um `_layout.tsx` com Stack:

```tsx
import { Stack } from "expo-router";

export default function Layout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

Arquivos a criar:
- `src/app/(pets)/_layout.tsx`
- `src/app/(reports)/_layout.tsx`
- `src/app/(sightings)/_layout.tsx`
- `src/app/(matches)/_layout.tsx`

### 2. Mover arquivos

| De | Para |
|----|----|
| `src/app/pets/new.tsx` | `src/app/(pets)/new.tsx` |
| `src/app/pets/[id]/index.tsx` | `src/app/(pets)/[id]/index.tsx` |
| `src/app/pets/[id]/edit.tsx` | `src/app/(pets)/[id]/edit.tsx` |
| `src/app/pet-report/[id].tsx` | `src/app/(reports)/[id].tsx` |
| `src/app/report-lost/[petId].tsx` | `src/app/(reports)/lost/[petId].tsx` |
| `src/app/report-lost/success.tsx` | `src/app/(reports)/lost/success.tsx` |
| `src/app/report-lost/update/[reportId].tsx` | `src/app/(reports)/lost/update/[reportId].tsx` |
| `src/app/sighting/new.tsx` | `src/app/(reports)/sighting/new.tsx` |
| `src/app/sighting/success.tsx` | `src/app/(reports)/sighting/success.tsx` |
| `src/app/pet-sighting/new.tsx` | `src/app/(sightings)/new.tsx` |
| `src/app/pet-sighting/[id].tsx` | `src/app/(sightings)/[id].tsx` |
| `src/app/pet-sighting/success.tsx` | `src/app/(sightings)/success.tsx` |

### 3. Atualizar navegações (router.push/replace)

Groups `()` não geram segmento de URL, mas no Expo Router typed routes é preciso referenciar o path completo com o group. Atualizar todos os `router.push` e `router.replace`:

| Navegação atual | Nova navegação |
|----|----|
| `"/pets/new"` | `"/(pets)/new"` |
| `"/pets/[id]"` | `"/(pets)/[id]"` |
| `"/pets/[id]/edit"` | `"/(pets)/[id]/edit"` |
| `"/pet-report/[id]"` | `"/(reports)/[id]"` |
| `"/report-lost/[petId]"` | `"/(reports)/lost/[petId]"` |
| `"/report-lost/success"` | `"/(reports)/lost/success"` |
| `"/report-lost/update/[reportId]"` | `"/(reports)/lost/update/[reportId]"` |
| `"/sighting/new"` | `"/(reports)/sighting/new"` |
| `"/sighting/success"` | `"/(reports)/sighting/success"` |
| `"/pet-sighting/new"` | `"/(sightings)/new"` |
| `"/pet-sighting/[id]"` | `"/(sightings)/[id]"` |
| `"/pet-sighting/success"` | `"/(sightings)/success"` |

### 4. Deletar pastas vazias antigas

Após mover, remover:
- `src/app/pets/`
- `src/app/pet-report/`
- `src/app/report-lost/`
- `src/app/sighting/`
- `src/app/pet-sighting/`

## O que NÃO muda

- Nenhuma mudança visual
- Tab bar continua só nas 5 tabs
- Detalhes/forms continuam como Stack push sem tab bar
- Footers com CTA fixo continuam no bottom limpo
- Modais (Dialog, BottomSheet) continuam sobre tudo
- Lógica dos componentes intacta

## Verificação

- `npx tsc --noEmit` — sem erros
- Todas as navegações funcionam (push, replace, back)
- Tab bar visível só nas 5 tabs
- Telas de detalhe/form sem tab bar
- Modais abrem corretamente
