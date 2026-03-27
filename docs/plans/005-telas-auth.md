# Fase 5: Telas de Autenticacao

## Status: Pendente

## Pre-requisitos ja implementados

Toda a infraestrutura necessaria ja existe:

- **Schemas Zod:** `src/features/auth/schemas/` (login, register, forgot-password, verify-code, reset-password, change-password)
- **API:** `src/services/api/auth.ts` (authApi com todos os endpoints)
- **Hooks:** `src/hooks/useAuth.ts` (useLogin, useRegister, useForgotPassword, useVerifyResetCode, useResetPassword, useChangePassword, useLogout)
- **Types:** `src/types/auth.ts` (User, AuthResponse, todos os payloads)
- **Stores:** `src/stores/auth.ts` (setAuth, clearAuth, hydrate) + `src/stores/toast.ts`
- **Componentes UI:** TextInput, PasswordInput, ButtonPrimary, ButtonSecondary, TextLink, ErrorMessage, Screen, NavHeader, Toast
- **Placeholders:** Todas as telas ja existem em `app/(auth)/` como stubs
- **Deps:** react-hook-form, @hookform/resolvers, zod, input-otp-native ja instalados

## Escopo desta fase

Implementar a UI real das telas de autenticacao usando os building blocks existentes. Nenhuma infraestrutura nova precisa ser criada, exceto uma utilitaria para mapear erros 422 da API para campos do react-hook-form (`src/utils/map-api-errors.ts`).

## Telas

### 5.1 Welcome (`app/(auth)/welcome.tsx`)

- Sem NavHeader (tela de entrada)
- Usa Screen com scroll={false} (tela estatica de entrada)
- Logo Empet centralizado
- Botao "Entrar" (ButtonPrimary) → navega para login
- Botao "Criar conta" (ButtonSecondary) → navega para register

### 5.2 Login (`app/(auth)/login.tsx`)

- NavHeader com titulo "Entrar"
- Form com react-hook-form + zodResolver(loginSchema)
- Campo email (TextInput, validacao: obrigatorio, email valido)
- Campo senha (PasswordInput, validacao: obrigatorio)
- ButtonPrimary "Entrar" com loading={isPending}
- TextLink "Esqueci minha senha" → navega para forgot-password
- TextLink "Criar conta" → navega para register
- Tratamento de erro:
  - 422 → erros inline nos campos via mapApiErrors()
  - Credenciais invalidas → ErrorMessage geral acima do botao (independente se backend retorna 401 ou 422)
  - 429 → toast.show("Muitas tentativas, tente novamente", "error")
  - Erro inesperado → ErrorMessage geral "Ocorreu um erro, tente novamente"
- Sucesso: useLogin onSuccess → setAuth(token, user) → AuthProvider redireciona para /(tabs)

### 5.3 Register (`app/(auth)/register.tsx`)

- NavHeader com titulo "Criar conta"
- Form com react-hook-form + zodResolver(registerSchema)
- Campo nome (TextInput, obrigatorio, max 255)
- Campo email (TextInput, obrigatorio, email valido, max 255)
- Campo senha (PasswordInput, min 8, 1 maiuscula, 1 numero, 1 especial)
- Campo confirmar senha (PasswordInput, deve ser igual)
- ButtonPrimary "Criar conta" com loading={isPending}
- TextLink "Ja tenho conta" → navega para login
- Tratamento de erro:
  - 422 → erros inline (email duplicado, validacao) via mapApiErrors()
  - 429 → toast.show("Muitas tentativas, tente novamente", "error")
  - Erro inesperado → ErrorMessage geral "Ocorreu um erro, tente novamente"
- Sucesso: useRegister onSuccess → setAuth(token, user) → AuthProvider redireciona para /(tabs)

### 5.4 Forgot Password (`app/(auth)/forgot-password.tsx`)

- NavHeader com titulo "Esqueci minha senha"
- Form com react-hook-form + zodResolver(forgotPasswordSchema)
- Campo email (TextInput)
- ButtonPrimary "Enviar codigo" com loading={isPending}
- Tratamento de erro:
  - 422 → erro inline via mapApiErrors()
  - 429 → toast
  - Erro inesperado → ErrorMessage geral
- Sucesso: navega para verify-code passando email via route params do Expo Router

### 5.5 Verify Code (`app/(auth)/verify-code.tsx`)

- NavHeader com titulo "Verificar codigo"
- Texto explicativo com email recebido
- Form com react-hook-form + zodResolver(verifyCodeSchema)
- OTP input com 6 slots via input-otp-native (OTPInput + OTPInputSlot)
  - Headless/unstyled — estilizar slots com classes NativeWind
  - Auto-focus, backspace entre campos e paste do clipboard inclusos
  - Integrar com RHF via Controller (onChange/value)
- ButtonPrimary "Verificar" com loading={isPending}
- Tratamento de erro:
  - 422 → erro inline (codigo invalido/expirado) via mapApiErrors()
  - 429 → toast
  - Erro inesperado → ErrorMessage geral
- Guarda de params: se email ausente nos route params → redireciona para forgot-password
- Sucesso: API retorna resetToken → navega para reset-password passando email + resetToken via route params

### 5.6 Reset Password (`app/(auth)/reset-password.tsx`)

- NavHeader com titulo "Nova senha"
- Form com react-hook-form + zodResolver(resetPasswordSchema)
- Campo nova senha (PasswordInput, regras de senha)
- Campo confirmar senha (PasswordInput, deve ser igual)
- ButtonPrimary "Redefinir senha" com loading={isPending}
- Guarda de params: se email ou resetToken ausentes nos route params → redireciona para forgot-password
- Envia email + resetToken (recebidos via route params) + password + password_confirmation
- Tratamento de erro:
  - 422 → erros inline via mapApiErrors()
  - 429 → toast
  - Erro inesperado → ErrorMessage geral
- Sucesso: chamar toast.show() antes de router.replace("/(auth)/login") — toast e global via useToastStore e sobrevive a navegacao

## Padrao de formulario

Todas as telas seguem o mesmo padrao:

```tsx
const { control, handleSubmit, setError, formState: { errors } } = useForm<XxxFormData>({
  resolver: zodResolver(xxxSchema),
  defaultValues: { /* campos inicializados */ },
});
const mutation = useXxx();

const onSubmit = (data: XxxFormData) => {
  mutation.mutate(data, {
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 422) {
        mapApiErrors(setError, error);
      } else if (isAxiosError(error) && error.response?.status === 429) {
        toast.show("Muitas tentativas, tente novamente", "error");
      }
    },
  });
};
```

- Sempre inicializar `defaultValues` no useForm para evitar warnings e comportamento inesperado
- Erros de validacao Zod aparecem inline via prop `error` dos inputs
- Erros da API (422) sao mapeados via `mapApiErrors(setError, error)` — utilitaria em `src/utils/map-api-errors.ts`
- Erros de rate limit (429) usam `useToastStore().show()`
- Erros gerais (credenciais invalidas, falha inesperada) exibidos com ErrorMessage acima do botao
- Loading state via `mutation.isPending` passado para `loading` do ButtonPrimary
- Botao fica `disabled={isPending}` para prevenir duplo submit

## Navegacao entre telas

```
welcome → login → (tabs) [via AuthProvider]
welcome → register → (tabs) [via AuthProvider]
login → forgot-password → verify-code → reset-password → login
login → register
register → login
```

- Login e Register nao navegam manualmente para /(tabs) — o redirect e reativo via AuthProvider
- Forgot password flow passa email e resetToken via route params do Expo Router
- Telas que dependem de params (verify-code, reset-password) validam presenca antes de renderizar:
  - verify-code sem email → redireciona para forgot-password
  - reset-password sem email ou resetToken → redireciona para forgot-password

## Regras de UX dos formularios

- Sempre usar `defaultValues` no useForm
- Email: `keyboardType="email-address"`, `autoCapitalize="none"`, `autoCorrect={false}`, `textContentType="emailAddress"`
- Senha: `autoCapitalize="none"`, `autoCorrect={false}`, `textContentType="password"` (ou `"newPassword"` em campos de nova senha)
- Nome: `autoCapitalize="words"`, `textContentType="name"`
- Codigo OTP: input-otp-native com `maxLength={6}`, `textContentType="oneTimeCode"` (autofill), slots estilizados com NativeWind
- Conteudo do form (exceto NavHeader) envolvido em `<View className="flex-1 justify-center">` para centralizar verticalmente
- Botao de submit: `disabled={isPending}` para prevenir duplo submit
- Erros de campo: inline via prop `error` dos componentes TextInput/PasswordInput
- Erro geral do form: estado local `const [formError, setFormError] = useState<string | null>(null)`, exibido com ErrorMessage acima do botao de submit
- Limpar `formError` quando usuario comecar a editar qualquer campo (evitar mensagem velha presa na tela)
- Ordem de validacao: Zod valida primeiro (client-side) → API 422 entra depois via mapApiErrors/setError
- Links de texto (TextLink) usam `active:opacity-60` para feedback visual de toque
- Telas com route params obrigatorios validam presenca e redirecionam se ausentes

## Utilitaria: mapApiErrors

Criar `src/utils/map-api-errors.ts` — funcao que recebe `setError` do RHF e um AxiosError, extrai os erros de validacao 422 do Laravel (`errors: { field: ["msg"] }`) e chama `setError(field, { message })` para cada campo.

- Preferir manter nomes de campos do form alinhados aos payloads da API para simplificar o mapeamento
- Quando houver divergencia (ex: backend `password_confirmation` vs form `passwordConfirmation`), a utilitaria deve suportar um map opcional de aliases

Reutilizada em todas as telas de auth (e futuramente em outras features com forms).

## Change Password

> `app/change-password.tsx` nao faz parte desta fase — pertence a Fase 11 (Settings).
> O schema e hook ja existem e serao usados quando a tela for implementada.

## Verificacao

- [ ] Welcome: botoes navegam para login e register, sem NavHeader
- [ ] Login: valida campos, mostra erros inline, faz login e redireciona para tabs
- [ ] Login: credenciais invalidas mostra ErrorMessage geral
- [ ] Register: valida campos (incluindo regras de senha), cria usuario e redireciona para tabs
- [ ] Forgot password: envia email e navega para verify-code com email nos params
- [ ] Verify code: valida codigo, recebe resetToken, navega para reset-password com params
- [ ] Verify code: acesso direto sem email redireciona para forgot-password
- [ ] Reset password: acesso direto sem params redireciona para forgot-password
- [ ] Reset password: valida senha, redefine, navega para login e mostra toast de sucesso
- [ ] Erros 422 aparecem inline nos campos corretos via mapApiErrors
- [ ] Erros 429 mostram toast de rate limit
- [ ] Loading state desabilita botoes e mostra indicador (sem duplo submit)
- [ ] Teclado nao cobre campos (Screen com ScrollView ja trata)
- [ ] Navegacao back funciona em todas as telas (NavHeader)
- [ ] Inputs de email usam keyboardType="email-address" e autoCapitalize="none"
- [ ] Inputs de senha usam autoCorrect={false}
