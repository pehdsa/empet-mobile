# Fase 3: Design System (Componentes UI)

## Contexto

Criar os componentes base do design system do Empet. Todos estilizados com NativeWind, sem bibliotecas de UI externas. O design system ja esta desenhado no Pencil (`empet.pen`, layer "Mobile Design System - emPet", node `0O13w`) e deve ser a referencia visual para implementacao.

> Esta fase herda o que a Fase 1 preparou: `tailwind.config.ts` (hoje so com `primary`), Montserrat carregando no `_layout.tsx`, NativeWind funcional. E o que a Fase 2 criou: types, enums, infraestrutura base.

> **Referencia visual:** Pencil file `/Volumes/trabalho/empet.pen`, node `0O13w`

---

## 3.1 Expandir tailwind.config.ts com paleta completa

O `tailwind.config.ts` atual so tem `primary: "#AD4FFF"`. Como **Tailwind e a fonte unica de design tokens** (regra critica), a paleta completa — extraida do Pencil — precisa ser adicionada aqui.

```ts
// tailwind.config.ts — secao colors expandida
colors: {
  primary: {
    DEFAULT: "#AD4FFF",
    light: "#C98AFF",
    dark: "#8A2BE2",
  },
  secondary: {
    DEFAULT: "#FFA001",
    light: "#FFBE4D",
    dark: "#CC8000",
  },
  text: {
    primary: "#313233",
    secondary: "#6B6C6D",
    tertiary: "#9B9C9D",
    inverse: "#FFFFFF",
  },
  background: "#F8F8F8",
  surface: "#FFFFFF",
  border: "#E2E2E2",
  error: "#E53935",
  success: "#43A047",
  whatsapp: "#25D366",
},
```

> Cores confirmadas contra o Pencil: primary `#AD4FFF`, secondary/cat `#FFA001`, text-primary `#313233`, text-secondary `#6B6C6D`, text-tertiary `#9B9C9D`, border `#E2E2E2`, error `#E53935`, success `#43A047`.

### Dark mode

> **Decisao:** Adiar dark mode. Focar em light primeiro. Nomes semanticos ja facilitam migracao futura.

## 3.2 Biblioteca de icones

O Pencil usa **Lucide** como icon font. Instalar `lucide-react-native`:

```bash
npx expo install lucide-react-native
```

> Lucide e a mesma familia de icones usada no design system do Pencil. Icones confirmados: `arrow-left`, `eye-off`, `circle-alert`, `circle-check`, `map-pin`, `paw-print`, `bell`, `settings`, `dog`, `cat`, `plus`, `chevron-right`, `chevron-down`, `sliders-horizontal`, `x`, `search`.

## 3.3 Specs de design (do Pencil)

Valores extraidos dos componentes reais do Pencil:

| Spec | Valor Pencil | Classe Tailwind |
|------|-------------|-----------------|
| Button/Input height | 52px / 48px | `h-[52px]` / `h-12` |
| Button corner radius | 14px | `rounded-[14px]` |
| Input corner radius | 12px | `rounded-xl` |
| Card corner radius | 16px | `rounded-2xl` |
| Modal top corner radius | 24px | `rounded-t-3xl` |
| Chip height | 36px | `h-9` |
| Chip corner radius | 18px (pill) | `rounded-full` |
| Toggle height | 40px | `h-10` |
| Toggle corner radius | 12px | `rounded-xl` |
| FAB | 56x56px, radius 28 | `w-14 h-14 rounded-full` |
| Padding horizontal padrao | 24px (telas), 16px (inputs) | `px-6` / `px-4` |
| Gap label-input | 6px | `gap-1.5` |
| Gap entre secoes | 20px | `gap-5` |
| Icone padrao | 24px | `w-6 h-6` |
| Icone inline | 18-20px | `w-5 h-5` |
| NavHeader height | 52px | `h-[52px]` |
| TabBar height | 80px (com safe area) | `h-20` |

> Valores que nao mapeiam para classes padrao do Tailwind (52px, 14px radius) devem ser usados como valores arbitrarios (`h-[52px]`, `rounded-[14px]`) ou adicionados como tokens custom no `tailwind.config.ts`.

## 3.4 Componentes — Bloco A (prioritario)

Componentes base que as telas de auth (Fase 5) vao precisar imediatamente. Criar em `src/components/ui/`.

### Screen.tsx

Container padrao para telas:

- Props: `children`, `scroll` (boolean, default true), `className`
- Usa `useSafeAreaInsets()` para aplicar padding top/bottom (mais flexivel que `SafeAreaView`)
- `bg-background`, `px-6` (24px do Pencil)
- Se `scroll=true`, usa `ScrollView` com:
  - `keyboardShouldPersistTaps="handled"`
  - `contentContainerStyle` recebe o padding (nao o wrapper externo)
  - `flex-grow` no contentContainer para permitir centralizar conteudo em telas curtas

### ButtonPrimary.tsx

Extraido do Pencil (`Component/ButtonPrimary`, node `JOguz`):

- Height 52px, corner radius 14px, bg `#AD4FFF`, texto branco Montserrat Medium 16px
- Props: `label`, `loading`, `disabled`, `onPress`, `className`
- Loading: substitui texto por `ActivityIndicator`
- Disabled: opacity 50%
- Usa `label` (string) nesta fase. Se no futuro precisar de icone + texto, evoluir para `children`

### ButtonSecondary.tsx

Extraido do Pencil (`Component/ButtonSecondary`, node `vVdPo`):

- Height 52px, corner radius 14px, bg transparente, border `#AD4FFF` 1.5px, texto `#AD4FFF`
- Mesmas props que ButtonPrimary

> **Decisao:** Dois componentes separados (ButtonPrimary e ButtonSecondary) em vez de um Button com variantes. Reflete o Pencil que tem componentes separados. Manter separados enquanto houver apenas 2 variantes estaveis. Refatorar para `Button` com `variant` apenas se surgir repeticao estrutural forte (3+ variantes com mesma base).

### TextInput.tsx

Extraido do Pencil (`Component/TextInput`, node `x4Ujk`):

- Label: Montserrat Medium 13px, cor `#6B6C6D`
- Field: height 48px, corner radius 12px, bg branco, border `#E2E2E2` 1px, padding horizontal 16px
- Placeholder: Montserrat Regular 15px, cor `#9B9C9D`
- Props: `label`, `error`, `placeholder`, `value`, `onChangeText`, `onBlur`, `className`, demais props de `TextInput` via spread
- Usa `React.forwardRef` para permitir ref forwarding (necessario para focus chain entre campos em forms de auth)
- **Nao** importa React Hook Form — recebe props simples. Integracao pelo consumidor via `Controller`
- Erro exibido abaixo do campo com `ErrorMessage` component

### PasswordInput.tsx

Extraido do Pencil (`Component/PasswordInput`, node `DvHfC`):

- Mesmo que TextInput, mas com toggle de visibilidade (icone `eye-off` / `eye`)
- Icone Lucide 20px, cor `#9B9C9D`

### SelectField.tsx

Extraido do Pencil (`Component/SelectField`, node `ZTMIU`):

- Mesma estrutura visual do TextInput
- Icone `chevron-down` a direita, 20px, cor `#9B9C9D`
- Props: `label`, `value`, `placeholder`, `onPress`, `error`, `className`
- **Nao** abre modal internamente — `onPress` e delegado ao consumidor (que decidira como exibir opcoes)
- Single select apenas nesta fase, sem busca

### ErrorMessage.tsx

Extraido do Pencil (`Component/ErrorMessage`, node `8XwfQ`):

- Icone `circle-alert` 18px, cor `#E53935`
- Texto Montserrat Regular 13px, cor `#E53935`
- Background `#FDEDED`, corner radius 12px, padding 12x16
- Props: `message`

### SuccessMessage.tsx

Extraido do Pencil (`Component/SuccessMessage`, node `rTcwF`):

- Icone `circle-check` 18px, cor `#43A047`
- Texto Montserrat Regular 13px, cor `#43A047`
- Background `#E8F5E9`, corner radius 12px, padding 12x16
- Props: `message`

### TextLink.tsx

Extraido do Pencil (`Component/TextLink`, node `jMUvA`):

- Montserrat Medium 14px, cor `#AD4FFF`
- Props: `label`, `onPress`

### NavHeader.tsx

Extraido do Pencil (`Component/NavHeader`, node `EUdnc`):

- Height 52px, padding horizontal 24px
- Icone `arrow-left` 24px a esquerda, titulo Montserrat Medium 18px
- Props: `title`, `onBack` (opcional — se omitido, usa `router.back()`), `showBack` (boolean, default true — permite esconder o botao explicitamente quando nao fizer sentido)
- Na implementacao, verificar se `router.canGoBack()` esta disponivel no Expo Router para decidir automaticamente. Se nao for confiavel, usar `showBack` como fallback explicito

### EmptyState.tsx

Extraido do Pencil (`Component/EmptyState`, node `VfF1h`):

- Icone em circulo 56px com fundo `#AD4FFF1A`, icone `#AD4FFF` 28px
- Titulo Montserrat Bold 16px, subtitulo Montserrat Regular 13px, text-align center
- Acao opcional (TextLink)
- Props: `icon`, `title`, `description`, `actionLabel`, `onAction`

### Chip.tsx

Componente unico com prop `active`. Extraido do Pencil (nodes `G7PC8`, `hPnkt`):

- Active: bg `#AD4FFF`, texto branco Montserrat Medium 13px, height 36px, pill shape (`rounded-full`)
- Inactive: bg branco, border `#E2E2E2`, texto `#313233` Montserrat Regular 13px
- Props: `label`, `active`, `onPress`, `className`

### ToggleButton.tsx

Componente unico com prop `active`. Extraido do Pencil (nodes `zBgqE`, `UtynZ`):

- Active: bg `#AD4FFF`, texto branco Montserrat Medium 14px, height 40px, radius 12px (`rounded-xl`)
- Inactive: bg branco, border `#E2E2E2`, texto `#313233` Montserrat Regular 14px
- Props: `label`, `active`, `onPress`, `className`

> Diferente do Chip (pill shape vs rounded rect, tamanhos diferentes). Chip e para filtros horizontais, ToggleButton para selecao binaria como "Cachorro / Gato".

## 3.5 Componentes — Bloco B (criar ao final da fase ou adiar)

Componentes mais complexos que podem ser necessarios nas fases seguintes.

### Card.tsx

- Container base com `bg-surface rounded-2xl border border-border` + shadow
- Props: `children`, `className`
- Aceita `className` para override controlado

### Modal.tsx (bottom sheet simples)

- **Implementacao simples** com `Modal` nativo do React Native + `Animated` basico
- **Nao** implementar bottom sheet com gesture completo nesta fase — complexidade alta demais
- Overlay `bg-black/50`, conteudo com `bg-surface rounded-t-3xl`
- Handle bar no topo (barra cinza 40x4px, radius 2px — confirmado no Pencil `R5Um3`)
- Props: `visible`, `onClose`, `title`, `children`
- Se no futuro precisar de swipe-to-dismiss, evoluir para Reanimated + GestureHandler

### Toast.tsx

- Implementacao simples com `Animated` basico
- Variantes: `success` (reutiliza visual do SuccessMessage), `error` (reutiliza visual do ErrorMessage)
- Aparece no topo, desaparece apos 3s
- **Nao** criar infra complexa (fila, stacking, provider) nesta fase
- **Apenas um toast por vez** — novo toast substitui o anterior
- Gerenciado por um store Zustand simples: `useToastStore` com `{ message, variant, show(), hide() }`

### Skeleton.tsx

- Loading placeholder com **animacao pulsante** (opacity cycling via `Animated`)
- **Nao** implementar shimmer com gradiente nesta fase (requer lib de gradiente extra)
- Props: `width`, `height`, `borderRadius`, `className`
- Background `#E2E2E2`, animacao opacity 0.3 ↔ 1.0

## 3.6 Componentes que NAO entram nesta fase

Estes componentes pertencem a features especificas e serao criados nas fases correspondentes:

| Componente | Fase |
|------------|------|
| `PetCard.tsx` | Fase 8 — Pets CRUD |
| `PetPreviewCard.tsx` | Fase 6 — Home/Mapa |
| `PetMarker.tsx` / `MarkerCluster.tsx` | Fase 6 — Home/Mapa |
| `FilterBar.tsx` / `FilterModal.tsx` | Fase 6 — Home/Mapa |
| `FAB.tsx` | Fase 6 — Home/Mapa |
| `TabBar.tsx` | Fase 4 — Navegacao |
| `StatusBar.tsx` | Fase 4 — Navegacao |

> Esses componentes ja estao desenhados no Pencil e devem ser implementados seguindo os mesmos padroes desta fase.

## 3.7 Tipografia (confirmada no Pencil)

| Uso | Font | Weight | Size | Classe Tailwind |
|-----|------|--------|------|-----------------|
| Titulos principais | Montserrat | Bold 700 | 18px | `font-montserrat-bold text-lg` |
| Titulos secundarios | Montserrat | Bold 700 | 16px | `font-montserrat-bold text-base` |
| Body/labels | Montserrat | Medium 500 | 14-15px | `font-montserrat-medium text-sm` |
| Labels de campo | Montserrat | Medium 500 | 13px | `font-montserrat-medium text-[13px]` |
| Captions | Montserrat | Regular 400 | 13px | `font-montserrat text-[13px]` |
| Tabs | Montserrat | Medium/Regular | 11px | `font-montserrat text-[11px]` |
| Buttons | Montserrat | Medium 500 | 16px | `font-montserrat-medium text-base` |

> **Decisao:** Nao criar wrappers tipograficos (AppText, Heading, etc.) nesta fase. Usar `Text` nativo com classes Tailwind. Se a repeticao ficar pesada nas fases de telas, reavaliar.

## 3.8 Convencoes dos componentes

- Todos aceitam `className` para override controlado (via spread no container principal)
- Exportados por barrel em `src/components/ui/index.ts`
- Nenhuma cor hardcodada diretamente no JSX — usar classes Tailwind para elementos nativos
- Icones via `lucide-react-native`: como sao SVGs, aceitam `color` como prop. Nao usar hex literal — quando precisar ler token em TS, usar `resolveConfig` do Tailwind. **Nao criar arquivo de cores paralelo** (reabriria a ambiguidade ja resolvida). Aceitar que icones SVG sao a excecao onde `color` prop e necessaria
- Componentes nao importam React Hook Form, React Query, ou stores — sao puramente visuais

## 3.9 Dependencias a instalar

```bash
npx expo install lucide-react-native
```

> Nenhuma outra dependencia nova. Reanimated, GestureHandler e @expo/vector-icons ja estao instalados.

---

## Verificacao

- [ ] `npx tsc --noEmit` sem erros
- [ ] `tailwind.config.ts` expandido com paleta completa (confirmada contra Pencil)
- [ ] Nenhuma cor hardcodada fora do Tailwind nos componentes
- [ ] Barrel export em `src/components/ui/index.ts`
- [ ] Validacao visual contra os nodes do Pencil citados no plano (IDs: `JOguz`, `vVdPo`, `x4Ujk`, `DvHfC`, `8XwfQ`, `rTcwF`, `jMUvA`, `EUdnc`, `VfF1h`, `G7PC8`, `hPnkt`, `zBgqE`, `UtynZ`, `ZTMIU`)
- [ ] **Bloco A:**
  - [ ] Screen: safe area + scroll + padding correto
  - [ ] ButtonPrimary: renderiza, loading, disabled
  - [ ] ButtonSecondary: renderiza, loading, disabled
  - [ ] TextInput: label, placeholder, erro, focus
  - [ ] PasswordInput: toggle visibilidade funciona
  - [ ] SelectField: renderiza com chevron, onPress funciona
  - [ ] ErrorMessage / SuccessMessage: renderizam com icone e cor correta
  - [ ] TextLink: renderiza com cor primary
  - [ ] NavHeader: renderiza com back icon e titulo
  - [ ] EmptyState: renderiza com icone, titulo, acao
  - [ ] Chip: estados active/inactive
  - [ ] ToggleButton: estados active/inactive
- [ ] **Bloco B:**
  - [ ] Card: renderiza com borda e shadow
  - [ ] Modal: abre, fecha, overlay funciona
  - [ ] Toast: aparece, desaparece com timeout
  - [ ] Skeleton: pulsa
- [ ] ESLint/Prettier passam sem erros
