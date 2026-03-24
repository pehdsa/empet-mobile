# Fase 5: Telas de Autenticacao

Referencia: `docs/layout/001-auth-screens.md` + layouts no Pencil

## Telas

### Welcome/Splash
- Logo Empet centralizado
- Botao "Entrar" (primary)
- Botao "Criar conta" (outline)

### Login
- Campo email (validacao: obrigatorio, email valido)
- Campo senha (validacao: obrigatorio)
- Botao "Entrar" com loading state
- Link "Esqueci minha senha"
- Link "Criar conta"
- Tratamento: 401 (credenciais invalidas), 422 (validacao), 429 (rate limit)

### Register
- Campo nome (obrigatorio, max 255)
- Campo email (obrigatorio, email valido, max 255)
- Campo senha (min 8, 1 maiuscula, 1 numero, 1 especial)
- Campo confirmar senha (igual a senha)
- Botao "Criar conta" com loading state
- Link "Ja tenho conta"
- Tratamento: 422 (email duplicado, validacao), 429 (rate limit)

### Forgot Password (3 telas)
Referencia: `docs/layout/012-forgot-password.md`

1. **forgot-password.tsx** — Campo email → POST /auth/forgot-password
2. **verify-code.tsx** — 6 inputs de digito → POST /auth/verify-reset-code → retorna resetToken
3. **reset-password.tsx** — Nova senha + confirmacao → POST /auth/reset-password com resetToken

### Change Password
- Campo senha atual
- Campo nova senha (regras de senha)
- Campo confirmar nova senha
- PUT /auth/password

## Validacao Zod

Todos os schemas espelhando regras do backend (secao 12 do guia).

## Verificacao

- Registro cria usuario na API
- Login retorna token e redireciona para tabs
- Forgot password fluxo completo funciona
- Erros de validacao aparecem inline
- Rate limit mostra toast
