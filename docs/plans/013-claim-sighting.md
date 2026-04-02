# Fase 13: Claim de Avistamento ("É meu pet!")

Fluxo que permite ao dono de um pet perdido clamar um avistamento independente, obtendo os dados de contato do avistador.

Referência visual (Pencil): Node `AVCoi` (modal com telefone), Node `eAfFZ` (modal sem telefone)

---

## Pré-requisitos já implementados

- **Tela:** `src/app/(sightings)/[id].tsx` — detalhe do avistamento com botão "É meu pet!" (atualmente `onPress={() => {}}`)
- **API:** `src/services/api/pet-sightings.ts` — módulo existente (`petSightingsApi`)
- **Hook:** `src/hooks/usePetSightings.ts` — hooks existentes
- **Types:** `src/types/pet-sighting.ts` — `PetSighting`, `PetSightingUser`
- **Dialog:** `src/components/ui/Dialog.tsx` — base para modais
- **ButtonPrimary:** `src/components/ui/ButtonPrimary.tsx` — prop `label`, suporta `loading` e `disabled` (já bloqueia clique quando `loading === true`)
- **phoneMask:** `src/utils/phone-mask.ts` — formata digits locais (sem código de país), usado em `PhoneEntry`
- **Badge WhatsApp:** padrão existente em `PhoneEntry.tsx` — `MessageCircle` 12px + texto `#25D366`
- **Toast:** `useToastStore` para feedback
- **Notificação:** `PetSightingClaimed` já documentada no plan 012

---

## Contrato do backend

### Endpoint

`POST /api/v1/pet-sightings/{petSightingId}/claim`

- Auth: Bearer token (Sanctum)
- Body: nenhum
- Idempotente: primeira chamada cria claim + notifica avistador; chamadas seguintes retornam mesmos dados sem reenviar notificação
- Sightings soft-deleted retornam 404 (route model binding padrão)

### Response (200)

```json
{
  "data": {
    "sightingId": 1,
    "sightingOwner": {
      "name": "João",
      "phone": "+5511999999999",
      "phoneIsWhatsapp": true
    }
  }
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `sightingId` | `number` | ID do avistamento |
| `sightingOwner.name` | `string` | Nome do autor do avistamento |
| `sightingOwner.phone` | `string \| null` | Telefone primário do autor — null se `share_phone = false` **ou** se o autor não tem telefone cadastrado |
| `sightingOwner.phoneIsWhatsapp` | `boolean \| null` | Se é WhatsApp — null nos mesmos casos acima |

### Regras de negócio

- O claim **não depende de `share_phone`** — sempre funciona. `share_phone` só controla se o telefone do autor é retornado na response
- Se `share_phone = true` mas o autor não tem telefone primário → `phone` retorna `null`
- Claim não exige telefone do claimer — se não tiver, `claimer_phone` vai `null` na notificação
- Unique constraint `[pet_sighting_id, user_id]` — um claim por usuário por avistamento, definitivo
- Notificação respeita `notify_sightings` do `UserNotificationSetting` (mesma flag do domínio de avistamentos)

### Erros

| Status | Quando | Tratamento no frontend |
|--------|--------|------------------------|
| 401 | Não autenticado | Interceptor global (já existe) |
| 403 | Tentou clamar o próprio avistamento | Toast "Você não pode clamar seu próprio avistamento" |
| 404 | Avistamento não existe ou foi removido | Toast "Avistamento não encontrado" |

---

## Etapa 1 — Infraestrutura (Type, API, Hook)

### 1.1 Type

**Arquivo:** `src/types/pet-sighting.ts` — adicionar:

```ts
export interface SightingOwner {
  name: string;
  phone: string | null;
  phoneIsWhatsapp: boolean | null;
}

export interface SightingClaimResponse {
  sightingId: number;
  sightingOwner: SightingOwner;
}
```

**Nota:** `SightingOwner` representa o autor do avistamento (não o "dono" de algo). O nome segue o contrato do backend (`sightingOwner`) por consistência. Não confundir com "owner do pet".

### 1.2 Módulo API

**Arquivo:** `src/services/api/pet-sightings.ts` — adicionar ao objeto existente:

```ts
/** Clamar avistamento — idempotente */
claim: (sightingId: number) =>
  api.post<ResourceResponse<SightingClaimResponse>>(`/pet-sightings/${sightingId}/claim`),
```

### 1.3 Hook

**Arquivo:** `src/hooks/usePetSightings.ts` — adicionar:

```ts
export function useClaimSighting() {
  return useMutation<SightingClaimResponse, AxiosError, number>({
    mutationFn: async (sightingId) => {
      const response = await petSightingsApi.claim(sightingId);
      return response.data.data;
    },
  });
}
```

Tipagem explícita: `<SightingClaimResponse, AxiosError, number>` garante autocomplete correto no `onSuccess` (data tipado) e `onError` (error como `AxiosError`).

O hook **não invalida queries** porque o claim não muda o estado do avistamento na lista/mapa. O caller (tela de detalhe) recebe o `SightingClaimResponse` via `onSuccess` da mutation e abre o modal de contato com os dados.

---

## Etapa 2 — Modal de Contato

**Arquivo:** `src/components/sighting/ClaimContactDialog.tsx` (novo)

Modal que exibe os dados de contato do avistador após o claim. Usa `Dialog` como base.

### Props

```ts
interface ClaimContactDialogProps {
  visible: boolean;
  onClose: () => void;
  owner: SightingOwner | null;
}
```

**Guard:** se `!visible || !owner`, não renderizar conteúdo do dialog (retornar `null` ou dialog vazio). Evita estado inconsistente por timing.

### Lógica de exibição

O critério principal é `phone`, não o flag isolado:

| `phone` | `phoneIsWhatsapp` | Layout |
|---------|-------------------|--------|
| `!= null` | `=== true` | Com telefone: botões "Ligar" + "WhatsApp" |
| `!= null` | `!== true` | Com telefone: só botão "Ligar" |
| `=== null` | qualquer | Sem telefone: layout de notificação |

### Layout — Com telefone (Node AVCoi / fgm8V)

Modal card: `cornerRadius: 20`, `padding: 24`, `gap: 20`, `shadow` (blur 24, `#0000002A`, offset y 8)

- **Ícone:** `Phone` (28px, `#FFA001`) em circle 56px (`rounded-[28px]`, bg `#FFA00120`)
- **Título:** "Dados de contato" (`font-montserrat-bold text-xl text-text-primary`, `text-center`)
- **Subtítulo:** "Entre em contato com quem avistou o pet para combinar os próximos passos." (`font-montserrat text-sm text-text-secondary`, `text-center`, `lineHeight: 1.4`)
- **Contact card** (`rounded-xl bg-background p-4 gap-3`):
  - **Name row** (`flex-row items-center gap-3`):
    - Avatar: circle 44px (`rounded-[22px]`, bg `#FFA001`) com inicial do nome (`font-montserrat-bold text-lg text-white`, centralizado). Fallback: `"?"` se nome vazio
    - Nome: `font-montserrat-semibold text-base text-text-primary`
    - Subtítulo: "Criador do avistamento" (`font-montserrat text-xs text-text-tertiary`)
  - **Divider:** `h-px bg-border`
  - **Phone row** (`flex-row items-center gap-3`):
    - Ícone `Phone` (18px, `#9B9C9D`)
    - Número formatado: `+55 (11) 99999-9999` (`font-montserrat-medium text-[15px] text-text-primary`)
    - Badge WhatsApp (se `phoneIsWhatsapp === true`): ícone `MessageCircle` (12px, `#25D366`) + "WhatsApp" (`font-montserrat text-[11px]`, cor `#25D366`), `flex-row items-center gap-1` — mesmo padrão do `PhoneEntry.tsx`
- **Botões** (`gap-3`):
  - **Row** (`flex-row gap-3`, cada botão `flex-1`):
    - "Ligar" (bg `#FFA001`, ícone `Phone` 20px branco, `font-montserrat-semibold text-base text-white`, h-[52], `rounded-[14]`)
    - "WhatsApp" (bg `#25D366`, ícone `MessageCircle` 20px branco, `font-montserrat-semibold text-base text-white`, h-[52], `rounded-[14]`) — **renderizar apenas se `owner.phone != null && owner.phoneIsWhatsapp === true`**
  - "Fechar" (texto `#9B9C9D`, `font-montserrat-medium text-[13px]`, `active:opacity-60`, `text-center`)

**Linking com fallback:**
```ts
async function openLink(url: string, errorMsg: string) {
  try {
    await Linking.openURL(url);
  } catch {
    showToast(errorMsg, "error");
  }
}

// Ligar
openLink(`tel:${owner.phone}`, "Não foi possível abrir o telefone");

// WhatsApp — usar openURL direto (wa.me abre no browser se app não instalado, que ainda é útil)
const digits = owner.phone!.replace(/\D/g, "");
openLink(`https://wa.me/${digits}`, "Não foi possível abrir o WhatsApp");
```

### Layout — Sem telefone (Node eAfFZ / K2S7Z)

- **Ícone:** `BellRing` (28px, `#43A047`) em circle 56px (`rounded-[28px]`, bg `#43A04720`)
- **Título:** "Avistador notificado!" (`font-montserrat-bold text-xl text-text-primary`, `text-center`)
- **Descrição:** "O avistador optou por não compartilhar o telefone, mas não se preocupe — ele já foi notificado de que você reconheceu o pet.\n\nCaso ele queira, entrará em contato diretamente com você." (`font-montserrat text-sm text-text-secondary`, `text-center`, `lineHeight: 1.5`)
- **Tip card** (`rounded-xl bg-[#FFA00110] p-[14px] gap-3 flex-row items-center`):
  - Ícone `Lightbulb` (20px, `#FFA001`)
  - Texto: "Dica: mantenha seus telefones atualizados no app para facilitar o contato." (`font-montserrat text-xs text-text-secondary`, `lineHeight: 1.4`)
- **Botão "Entendi"** (bg `#FFA001`, `font-montserrat-semibold text-base text-white`, h-[52], `rounded-[14]`, full width)

### Formatação e linking do telefone

O backend retorna `+5511999999999`. Três usos distintos:

```ts
// Exibição: usar formatPhone (novo util)
formatPhone("+5511999999999") // → "+55 (11) 99999-9999"

// Ligar: usar valor raw
Linking.openURL(`tel:${owner.phone}`) // tel:+5511999999999

// WhatsApp: usar só dígitos (sem +)
const phoneDigits = owner.phone.replace(/\D/g, "");
Linking.openURL(`https://wa.me/${phoneDigits}`) // https://wa.me/5511999999999
```

**`phoneMask`** (`src/utils/phone-mask.ts`) já existe mas formata digits locais sem código de país — responsabilidade diferente (input masking vs display). Criar `src/utils/format-phone.ts` para display de telefone completo com código de país:

```ts
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("55")) {
    const ddd = digits.slice(2, 4);
    const local = digits.slice(4);
    if (local.length === 9) {
      return `+55 (${ddd}) ${local.slice(0, 5)}-${local.slice(5)}`;
    }
    if (local.length === 8) {
      return `+55 (${ddd}) ${local.slice(0, 4)}-${local.slice(4)}`;
    }
  }
  return phone; // fallback
}
```

---

## Etapa 3 — Conectar na tela de detalhe

**Arquivo:** `src/app/(sightings)/[id].tsx` — atualizar

### Mudanças:

1. Importar `useClaimSighting`, `ClaimContactDialog`, `useToastStore`, `useAuthStore`, `isAxiosError`
2. Adicionar estados e guards:
   ```ts
   const [contactDialogVisible, setContactDialogVisible] = useState(false);
   const [claimedOwner, setClaimedOwner] = useState<SightingOwner | null>(null);
   const claim = useClaimSighting();
   const showToast = useToastStore((s) => s.show);
   const userId = useAuthStore((s) => s.user?.id);
   const isOwnSighting = sighting?.userId === userId;
   ```
3. Conectar o botão "É meu pet!":
   ```ts
   <ButtonPrimary
     label="É meu pet!"
     loading={claim.isPending}
     onPress={() => {
       if (!sighting?.id) return; // guard defensivo
       claim.mutate(sighting.id, {
         onSuccess: (data) => {
           setClaimedOwner(data.sightingOwner);
           setContactDialogVisible(true);
         },
         onError: (error) => {
           if (error.response?.status === 403) {
             showToast("Você não pode clamar seu próprio avistamento", "error");
             return;
           }
           if (error.response?.status === 404) {
             showToast("Avistamento não encontrado", "error");
             return;
           }
           showToast("Erro ao clamar avistamento", "error");
         },
       });
     }}
   />
   ```
   **Notas:**
   - `ButtonPrimary` já bloqueia cliques quando `loading === true` (internamente faz `disabled={disabled || loading}`)
   - `error` já é tipado como `AxiosError` pelo hook, então `error.response?.status` funciona sem cast
4. Renderizar o dialog (resetar owner ao fechar):
   ```tsx
   <ClaimContactDialog
     visible={contactDialogVisible}
     onClose={() => {
       setContactDialogVisible(false);
       setClaimedOwner(null);
     }}
     owner={claimedOwner}
   />
   ```

### Botão "É meu pet!" — visibilidade

O bottom bar inteiro (não só o botão) só renderiza se:
- `sighting` está carregado (não `null` / não loading)
- Não é o próprio avistamento (`!isOwnSighting`)

```ts
{sighting && !isOwnSighting && (
  <View className="border-t border-border bg-surface px-4 py-3" ...>
    <ButtonPrimary ... />
  </View>
)}
```

### Feedback

- **Sucesso:** o modal é o feedback — não mostrar toast adicional (seria redundante)
- **Erro:** toast com mensagem específica por status

### Idempotência

Como o endpoint é idempotente, o botão pode ser clicado múltiplas vezes. Chamadas seguintes reabrem o modal com os mesmos dados. Não precisa de estado "já clamado" no frontend — a API sempre retorna os dados. O `claimedOwner` é resetado ao fechar o modal para manter estado limpo; a mutation repopula na próxima chamada.

---

## Arquivos

| Arquivo | Ação |
|---------|------|
| `src/types/pet-sighting.ts` | Adicionar `SightingOwner`, `SightingClaimResponse` |
| `src/services/api/pet-sightings.ts` | Adicionar `claim` |
| `src/hooks/usePetSightings.ts` | Adicionar `useClaimSighting` |
| `src/components/sighting/ClaimContactDialog.tsx` | Criar |
| `src/utils/format-phone.ts` | Criar (display com código de país — diferente do `phoneMask` de input) |
| `src/app/(sightings)/[id].tsx` | Conectar botão + dialog + guard de own sighting |

## Componentes reutilizados

| Componente | Path |
|------------|------|
| `Dialog` | `src/components/ui/Dialog.tsx` |
| `ButtonPrimary` | `src/components/ui/ButtonPrimary.tsx` |
| `useToastStore` | `src/stores/toast.ts` |
| `useAuthStore` | `src/stores/auth.ts` |
| Badge WhatsApp (padrão) | `src/components/shared/phone/PhoneEntry.tsx` (referência visual) |

## Decisões

1. **Sem estado local de "já clamado":** endpoint idempotente — cada tap chama a API e abre o modal. Simples e robusto
2. **Não ocultar botão após claim:** o usuário pode querer reabrir o modal para ver os dados de contato novamente
3. **Ocultar botão para próprio avistamento:** `sighting.userId === userId` — evita o 403 antes de chamar a API
4. **Modal de contato, não navegação:** modal sobre o detalhe, usuário fecha e continua na mesma tela
5. **Dismiss do modal:** o `Dialog` base já suporta tap fora (backdrop pressable) e back button Android (`onRequestClose`). Comportamento padrão — não bloquear
6. **WhatsApp via `wa.me`:** usar digits sem `+` (`phone.replace(/\D/g, "")`). O backend retorna com `+55`
7. **`formatPhone` separado do `phoneMask`:** responsabilidades diferentes — `phoneMask` é para mascarar input (digits locais), `formatPhone` é para display de telefone completo com código de país
8. **Resetar `claimedOwner` ao fechar:** mantém estado limpo. Mutation repopula na próxima chamada
9. **Guard no dialog:** `!visible || !owner` → não renderiza conteúdo. Evita modal vazio por timing
10. **Guard no onPress:** `if (!sighting?.id) return` — defensivo contra edge case se UI mudar
11. **Linking com fallback:** `canOpenURL` + try/catch — falha silenciosa com toast em simulador/emulador
12. **Wording "Criador do avistamento":** segue o design do Pencil. Alternativas como "Quem avistou o pet" são aceitáveis se o design mudar

## Verificação

- `npx tsc --noEmit` — sem erros
- Botão "É meu pet!" não aparece no próprio avistamento
- Botão não aparece enquanto sighting está carregando (bottom bar omitido)
- Tap em "É meu pet!" → loading no botão (bloqueado para múltiplos taps) → modal abre com dados do avistador
- Modal com telefone e WhatsApp → botões "Ligar" e "WhatsApp" funcionam (`tel:` e `wa.me`)
- Modal com telefone sem WhatsApp → só botão "Ligar" (sem botão WhatsApp)
- Modal sem telefone → layout "Avistador notificado!" com tip card e botão "Entendi"
- Tap fora do modal → fecha (backdrop pressable do Dialog)
- Back button Android → fecha modal (onRequestClose)
- Fechar modal → `claimedOwner` resetado para null
- Tap repetido após fechar → mesmos dados, sem reenviar notificação
- "Ligar" em simulador sem suporte → toast "Não foi possível abrir o telefone"
- "WhatsApp" sem app instalado → toast "Não foi possível abrir o WhatsApp"
- Erro 403 → toast "Você não pode clamar seu próprio avistamento"
- Erro 404 → toast "Avistamento não encontrado"
- Erro genérico → toast "Erro ao clamar avistamento"
