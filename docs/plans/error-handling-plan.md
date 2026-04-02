# Plano: Error Handling e Feedback Visual Consistente

## Contexto

O `<Toast />` estava montado diretamente no `_layout.tsx` sem um provider pattern e sem respeitar safe area. Erros de campo usam `ErrorMessage` (caixa vermelha com ícone) mas o padrão desejado é texto vermelho simples abaixo do input. Campos obrigatórios não têm "*" consistente. Erros 422 de negócio caem silenciosamente quando o backend retorna campos que não existem no form.

---

## Fase 1: ToastProvider + Safe Area

Criar provider para encapsular a renderização do `<Toast />` e respeitar safe area no topo.

**Modificar** `src/components/ui/Toast.tsx`:
- Usar `useSafeAreaInsets()` para posicionar o toast respeitando o safe area (`top: insets.top + offset`)
- Trocar `top-14` fixo por `style={{ top: insets.top + 8 }}`

**Criar** `src/providers/ToastProvider.tsx`:
- Wrapper simples: renderiza `{children}` + `<Toast />`
- Zustand store (`stores/toast.ts`) permanece inalterado — já funciona como API

**Modificar** `src/providers/AppProviders.tsx`:
- Adicionar `<ToastProvider>` envolvendo `{children}` dentro do `BottomSheetModalProvider`

**Modificar** `src/app/_layout.tsx`:
- Remover `<Toast />` e seu import

---

## Fase 2: Erro de campo → texto vermelho simples

Trocar `<ErrorMessage />` (caixa com ícone) por texto vermelho simples em **todos** os inputs e forms, incluindo auth.

**Modificar** (4 componentes de input — mesma mudança):
- `src/components/ui/TextInput.tsx`
- `src/components/ui/PasswordInput.tsx`
- `src/components/ui/SelectField.tsx`
- `src/components/ui/DateTimePickerField.tsx`

Em cada um: substituir `{error && <ErrorMessage message={error} />}` por:
```tsx
{error && <Text className="font-montserrat text-xs text-error">{error}</Text>}
```
Remover import de `ErrorMessage`.

**Modificar auth screens** — converter `formError` + `<ErrorMessage />` para usar toast:
- `src/app/(auth)/login.tsx`
- `src/app/(auth)/register.tsx`
- `src/app/(auth)/forgot-password.tsx`
- `src/app/(auth)/reset-password.tsx`
- `src/app/(auth)/verify-code.tsx`

Em cada um: remover state `formError`, remover `<ErrorMessage />`, usar `showToast(msg, "error")` no lugar.

**Modificar** `src/components/shared/phone/PhoneFormDialog.tsx`:
- Mesmo padrão: trocar `<ErrorMessage />` por toast ou texto vermelho conforme contexto.

**Após todas as mudanças**: se `ErrorMessage` não tiver mais consumidores, remover o componente e seu export do barrel.

---

## Fase 3: Adicionar "*" nos campos obrigatórios

**Auth — somente "Criar Conta"** (`src/app/(auth)/register.tsx`):
- `"Nome"` → `"Nome *"`, `"Email"` → `"Email *"`, `"Senha"` → `"Senha *"`, `"Confirmar senha"` → `"Confirmar senha *"`

**Demais telas de auth** — NÃO adicionar "*" (login, forgot-password, reset-password, verify-code).

**`src/components/pet/PetForm.tsx`** (pet new + edit):
- `"Nome do pet"` → `"Nome do pet *"`
- `"Espécie"` → `"Espécie *"`
- `"Porte"` → `"Porte *"`
- `"Sexo"` → `"Sexo *"`
- Fotos: adicionar label `"Fotos *"` acima do `PhotoUploader`

**Já corretos** (não mexer):
- `src/app/(reports)/lost/[petId].tsx` — `"Quando ele se perdeu? *"`
- `src/app/(reports)/lost/update/[reportId].tsx` — idem
- `src/app/(reports)/sighting/new.tsx` — `"Quando você viu? *"`
- `src/app/(sightings)/new.tsx` — `"Título *"`, `"Quando você viu? *"`, `"Espécie *"`

**Não precisa de "*"**:
- `verify-code.tsx` — campo único implícito
- `sharePhone` — toggle com valor default, sempre tem valor
- `latitude/longitude` — definidos pelo mapa, sem label

---

## Fase 4: Melhorar `mapApiErrors` para erros não mapeados

**Modificar** `src/utils/map-api-errors.ts`:
- Retornar `string[]` (mensagens de erros que não mapearam para campos do form) em vez de `void`
- Quando `errors` não existe mas `message` sim → retornar `[message]`
- Quando um campo do backend não tem alias nem existe no form → coletar em `unhandled`

**Modificar call sites** — capturar retorno e mostrar toast:
- `src/app/(auth)/login.tsx`
- `src/app/(auth)/register.tsx`
- `src/app/(auth)/forgot-password.tsx`
- `src/app/(auth)/verify-code.tsx`
- `src/app/(auth)/reset-password.tsx`
- `src/app/(pets)/new.tsx`
- `src/app/(pets)/[id]/edit.tsx`
- `src/app/(reports)/lost/[petId].tsx`
- `src/app/(reports)/lost/update/[reportId].tsx`
- `src/app/(reports)/sighting/new.tsx` — simplificar lógica manual que já fazia isso
- `src/app/(sightings)/new.tsx`

---

## Fase 5: Documentar padrão no CLAUDE.md

Adicionar seção de **Padrões de feedback/erro** no `CLAUDE.md`:
- Toast (via `useToastStore`) para mensagens gerais: sucesso, erros de negócio, erros não mapeados a campos
- Texto vermelho simples (`text-xs text-error`) abaixo do input para erros de validação de campo
- Campos obrigatórios marcados com `*` no label (exceto auth, onde só "Criar Conta" usa `*`)
- `mapApiErrors` retorna erros não mapeados → exibir via toast
- `ToastProvider` no `AppProviders` — nunca montar `<Toast />` manualmente em layouts

---

## Verificação

1. Testar cada form: submeter vazio → erros de campo devem aparecer como texto vermelho simples abaixo dos inputs
2. Testar sighting do próprio pet → toast com mensagem do backend
3. Verificar que Toast aparece em qualquer tela respeitando safe area
4. Confirmar que campos obrigatórios mostram "*" (register, pet form, report forms, sighting forms)
5. Confirmar que auth screens (exceto register) NÃO têm "*"
6. `npx tsc --noEmit` — sem erros de tipo
