# Refatorar PhoneSection — Layout do Design + Modal para Criar/Editar

## Contexto

O `PhoneSection` atual usa um layout inline (NewPhoneEntry inline no form) que diverge do design. O design mostra:
- **Lista de telefones** com layout compacto: ícone phone + número + badge WhatsApp + botões editar (pencil) e excluir (trash-2)
- **Criar/Editar telefone** via Dialog modal (não inline) com campo número, toggle WhatsApp, botão Salvar e texto Cancelar
- **Excluir telefone** via Dialog de confirmação (já existe e está correto)
- **Estado vazio**: mensagem quando não há telefones cadastrados
- **Duas variantes de uso**:
  - **Sighting (avistamento independente e vinculado)**: toggle "Compartilhar meu telefone com o dono?" + helper text + lista + adicionar (dentro de card com borda) — controlado externamente pelo form
  - **Report-lost (reportar perda e atualizar)**: label "Telefones para contato" + lista + adicionar (sem card wrapper)

## Plano

### 1. Reescrever `PhoneEntry` — layout do design

**Arquivo:** `src/components/shared/phone/PhoneEntry.tsx`

Layout atual: campo de input readonly + toggle WhatsApp + botão delete.
Layout design: row horizontal com ícone phone + coluna (número formatado + badge WhatsApp opcional) + botão pencil + botão trash-2.

```
[phone icon] [número           ] [pencil] [trash-2]
             [🟢 WhatsApp badge]
```

- Ícone phone (16px, textTertiary)
- Coluna flex-1: número (Montserrat 14 normal) + se isWhatsapp: badge com messageCircle 12px + "WhatsApp" (11px, #25D366)
- Botão pencil (18px, textTertiary) → chama `onEdit`
- Botão trash-2 (18px, error #E53935) → chama `onDelete`
- Container: `rounded-xl bg-surface border border-border p-3 px-4 flex-row items-center gap-3`

Props: `phone: UserPhone`, `onEdit: () => void`, `onDelete: () => void`
(Remove: `onWhatsappToggle`, `isDeleting`, `isUpdating`)

### 2. Criar `PhoneFormDialog` — modal para criar e editar

**Arquivo:** `src/components/shared/phone/PhoneFormDialog.tsx` (novo)

Usa o `Dialog` existente. Layout conforme design Node OcKcU:

- Ícone circular: phone 28px em circle 56px com bg primary/20
- Título: "Adicionar telefone" ou "Editar telefone" (Montserrat 20 bold)
- Descrição: "Insira o número e indique se possui WhatsApp." (14 normal)
- Campo número: input com placeholder, border, rounded-[10px], height 48
- Toggle WhatsApp: row com "Este número tem WhatsApp?" + switch
- Helper: "Facilita o contato com quem avistar seu pet" (12, textTertiary)
- Botão Salvar: ButtonPrimary full-width
- Texto "Cancelar" abaixo (13px, textTertiary)

Props:
```ts
interface PhoneFormDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { phone: string; is_whatsapp: boolean }) => void;
  isSaving?: boolean;
  error?: string;
  initialData?: { phone: string; isWhatsapp: boolean }; // para edição
  title?: string; // default "Adicionar telefone"
}
```

Quando `initialData` é passado, preenche os campos (modo edição). Quando não, campos vazios (modo criação).

### 3. Reescrever `PhoneSection` — orquestrar tudo

**Arquivo:** `src/components/shared/phone/PhoneSection.tsx`

O PhoneSection fica simples — sempre renderiza a lista + botão adicionar + dialogs. O wrapper e toggle ficam no consumidor (como já é feito em `pet-sighting/new.tsx`).

Mudanças:
- **Estado vazio**: quando `phones?.length === 0`, mostrar mensagem "Nenhum telefone cadastrado" + "Adicione um telefone para facilitar o contato"
- Substituir `NewPhoneEntry` inline por `PhoneFormDialog` (modal)
- Adicionar estado para edição: `editTarget: UserPhone | null`
- Usar `PhoneFormDialog` tanto para criar quanto editar (diferenciado por `initialData`)
- Manter dialog de exclusão (já correto, conforme design Node Ijoae)

### 4. Deletar `NewPhoneEntry`

**Arquivo:** `src/components/shared/phone/NewPhoneEntry.tsx` — deletar

Substituído pelo `PhoneFormDialog`.

### 5. Atualizar consumidores

- **`src/app/pet-sighting/new.tsx`** — O toggle + wrapper já existe inline. Sem mudanças necessárias.
- **`src/app/report-lost/[petId].tsx`** — Já usa `<PhoneSection />` direto. Sem mudanças.
- **`src/app/report-lost/update/[reportId].tsx`** — Já usa `<PhoneSection />` direto. Sem mudanças.

## Arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/shared/phone/PhoneEntry.tsx` | Reescrever (layout design) |
| `src/components/shared/phone/PhoneFormDialog.tsx` | Criar (modal criar/editar) |
| `src/components/shared/phone/PhoneSection.tsx` | Reescrever (estado vazio, modal, edição) |
| `src/components/shared/phone/NewPhoneEntry.tsx` | Deletar |

## Verificação

- `npx tsc --noEmit` — sem erros
- Tela "Registrar avistamento" → toggle compartilhar → mostra PhoneSection → adicionar abre dialog → salvar funciona
- Tela "Reportar perda" → PhoneSection visível → editar abre dialog com dados preenchidos → salvar atualiza
- Excluir → dialog de confirmação → confirma → remove
- Estado vazio → mensagem exibida
