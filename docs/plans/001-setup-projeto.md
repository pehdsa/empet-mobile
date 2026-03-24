# Fase 1: Setup do Projeto (Fundacao)

## Contexto

Criar o frontend mobile do app **Empet** (reencontro de pets perdidos) do zero usando Expo/React Native. O backend Laravel 12 ja esta pronto com API REST completa. O guia `expo-frontend-guide.md` define toda a stack, estrutura, endpoints e ordem de implementacao.

---

## 1.1 Criar projeto Expo

```bash
npx create-expo-app empet-mobile --template blank-typescript
```

> Como ja estamos dentro do diretorio `empet-mobile/`, vamos criar num diretorio temporario e mover os arquivos para ca.

## 1.2 Instalar dependencias

### Essenciais para a fundacao (instalar agora)

> **Importante:** Para dependencias com binding nativo ou integracao com o SDK Expo, usar `npx expo install` em vez de `npm install`. Isso garante versoes compativeis com o SDK atual. Exemplos: expo-router, expo-font, expo-splash-screen, react-native-reanimated, react-native-safe-area-context, react-native-gesture-handler.

- **Navegacao:** expo-router, expo-linking, expo-constants, expo-status-bar
- **Estilizacao:** nativewind, tailwindcss, react-native-reanimated, react-native-safe-area-context
- **Estado/Data:** zustand, @tanstack/react-query, axios
- **Forms:** react-hook-form, @hookform/resolvers, zod
- **Storage:** expo-secure-store
- **Fontes:** expo-font, @expo-google-fonts/montserrat
- **Gestures:** react-native-gesture-handler
- **Splash:** expo-splash-screen
- **Datas:** date-fns

### Instalar em fases futuras (quando forem necessarias)

- **Mapa (Fase 3 - Mapa):** react-native-maps, expo-location
- **Imagens (Fase 2 - Telas de pet):** expo-image-picker, expo-image
- **Notificacoes (Fase 5 - Push):** expo-notifications, expo-device

> Isso reduz conflitos de dependencia e mantem a fase 1 leve e focada.

## 1.3 Configurar app.config.ts

Usar `app.config.ts` em vez de `app.json` para suportar configs dinamicas e variaveis de ambiente.

```ts
// app.config.ts
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Empet",
  slug: "empet",
  scheme: "empet",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#AD4FFF",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.empet.app",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#AD4FFF",
    },
    package: "com.empet.app",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-font",
    "expo-splash-screen",
  ],
  experiments: {
    typedRoutes: true,
  },
});
```

### Politica de permissoes

- **Nao** adicionar permissoes antecipadas (camera, localizacao, fotos, notificacoes)
- Adicionar apenas quando a feature for implementada, junto com os respectivos plugins/configs
- Isso mantem a build limpa e evita prompts desnecessarios ao usuario

## 1.4 Configurar NativeWind / Tailwind

> **Importante:** Conferir compatibilidade entre a versao do Expo SDK usada e o NativeWind v4 antes de executar. O problema costuma ser a combinacao das versoes, nao o NativeWind isolado. Seguir a doc oficial para a versao exata do par Expo SDK + NativeWind.

### 1.4.1 tailwind.config.ts

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#AD4FFF",
        // demais tokens do design system
      },
      fontFamily: {
        montserrat: ["Montserrat_400Regular"],
        "montserrat-medium": ["Montserrat_500Medium"],
        "montserrat-semibold": ["Montserrat_600SemiBold"],
        "montserrat-bold": ["Montserrat_700Bold"],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

> Os tokens de estilo (cores, fontes, espacamentos) vivem exclusivamente no Tailwind. Nao criar um `theme.ts` separado — usar apenas `tailwind.config.ts` como fonte unica de design tokens.

### 1.4.2 global.css

```css
/* src/styles/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 1.4.3 babel.config.js

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: ["react-native-reanimated/plugin"],
  };
};
```

> O plugin do `react-native-reanimated` deve ser o **ultimo** na lista de plugins. Sem ele, animacoes e gestos podem falhar silenciosamente.

### 1.4.4 metro.config.js

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./src/styles/global.css" });
```

### 1.4.5 Typings (opcional)

Criar `nativewind-env.d.ts` na raiz se necessario para tipagem do `className`.

## 1.5 Configurar TypeScript

```json
// tsconfig.json (campos relevantes)
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

> Manter as demais opcoes geradas pelo `create-expo-app`. Apenas adicionar `baseUrl` e `paths`.

## 1.6 Configurar ESLint e Prettier

- Instalar `eslint`, `prettier`, `eslint-config-expo`
- Criar `.eslintrc.js` com config base do Expo
- Criar `.prettierrc` com regras do projeto
- Adicionar scripts no `package.json`:

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write \"**/*.{ts,tsx,js,json}\""
  }
}
```

## 1.7 Criar `.env`

```
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000
```

### Consideracoes por plataforma

| Plataforma        | URL da API                          | Notas                                      |
| ----------------- | ----------------------------------- | ------------------------------------------ |
| Emulador iOS      | `http://localhost:8000`             | Funciona na maioria dos casos               |
| Emulador Android  | `http://10.0.2.2:8000`             | Alias do localhost do host no Android       |
| Device fisico     | `http://192.168.x.x:8000`          | IP real da maquina na rede local            |

### Requisitos no backend

- Laravel precisa aceitar conexoes na rede local (`php artisan serve --host=0.0.0.0`)
- CORS configurado para aceitar requests do IP/porta do dispositivo
- Verificar firewall da maquina host

> Para simplificar o desenvolvimento, recomenda-se usar o IP da maquina na rede local como padrao no `.env`, pois funciona em todas as plataformas. Outra alternativa e usar um tunel (ex: ngrok).

### HTTPS

- Desenvolvimento local usa HTTP, o que e suficiente
- Ambientes de homologacao e producao devem usar HTTPS
- Em device fisico com iOS, HTTP pode ser bloqueado pelo App Transport Security — configurar excecao no Info.plist se necessario durante dev

## 1.8 Criar estrutura de pastas

```
app/
  _layout.tsx          # Layout raiz com providers
  index.tsx            # Tela inicial (redirect ou splash)

src/
  components/          # Componentes reutilizaveis
  features/            # Modulos por feature (auth, pets, map, etc)
  services/
    api/
      client.ts        # Instancia base do Axios
    storage/
      secure.ts        # Wrapper generico do SecureStore
  stores/              # Zustand stores
  hooks/               # Hooks customizados
  lib/                 # Utilitarios internos
  constants/           # Constantes do app
  types/
    api.ts             # Tipos base da API (envelopes, erros, paginacao)
  utils/               # Helpers genericos
  providers/
    AppProviders.tsx   # Wrapper com todos os providers
  styles/
    global.css         # Tailwind base
```

## 1.9 Configurar Expo Router

### 1.9.1 Verificar entrypoint

No `package.json`, garantir:

```json
{
  "main": "expo-router/entry"
}
```

### 1.9.2 Criar src/providers/AppProviders.tsx

Encapsular todos os providers num componente proprio para manter o layout raiz limpo:

```tsx
// src/providers/AppProviders.tsx
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          {children}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

### 1.9.3 Criar app/_layout.tsx

Layout raiz com carregamento de fontes e providers:

```tsx
// app/_layout.tsx
import "@/styles/global.css";
import { useEffect } from "react";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { AppProviders } from "@/providers/AppProviders";

// Chamado fora do componente intencionalmente — executa uma unica vez no carregamento do modulo.
// Evitar mover para dentro do componente, pois causaria chamadas multiplas.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AppProviders>
      <Slot />
    </AppProviders>
  );
}
```

### 1.9.4 Criar app/index.tsx

```tsx
// app/index.tsx
import { View, Text } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="font-montserrat-bold text-2xl text-primary">
        Empet
      </Text>
    </View>
  );
}
```

## 1.10 Criar cliente HTTP base

```ts
// src/services/api/client.ts
import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error("EXPO_PUBLIC_API_URL nao definida no .env");
}

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Interceptors de auth serao adicionados na Fase 2
```

## 1.11 Criar tipos base da API

Esqueleto com os formatos que o backend Laravel retorna.

> O backend usa snake_case nos campos de paginacao (padrao cru do Laravel). Apenas os campos dentro de `data` sao camelCase (transformados pelos API Resources). Manter essa convencao nos tipos do front.

```ts
// src/types/api.ts

/** Links de navegacao da paginacao */
export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

/** Metadados de paginacao (snake_case — padrao Laravel) */
export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
  path: string;
}

/** Envelope de resposta paginada do Laravel */
export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

/** Erro de validacao 422 */
export interface ValidationError {
  message: string;
  errors: Record<string, string[]>;
}

/** Message resource padrao */
export interface MessageResponse {
  message: string;
}
```

> Popular com mais tipos conforme as features forem implementadas. Validar o envelope paginado real (`links` e `meta`) contra a resposta da API na primeira integracao de listagem.

## 1.12 Criar storage seguro generico

Wrapper generico do SecureStore para reutilizar em auth e outros contextos:

```ts
// src/services/storage/secure.ts
import * as SecureStore from "expo-secure-store";

export const secureStorage = {
  get: (key: string) => SecureStore.getItemAsync(key),
  set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  remove: (key: string) => SecureStore.deleteItemAsync(key),
};
```

## 1.13 Preparar base para autenticacao

Nao implementar agora, mas deixar a estrutura pronta:

### Auth store (esqueleto)

```ts
// src/stores/auth.ts
import { create } from "zustand";
import { secureStorage } from "@/services/storage/secure";

const TOKEN_KEY = "auth_token";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,
  setToken: async (token) => {
    await secureStorage.set(TOKEN_KEY, token);
    set({ token, isAuthenticated: true });
  },
  clearToken: async () => {
    await secureStorage.remove(TOKEN_KEY);
    set({ token: null, isAuthenticated: false });
  },
}));
```

> Nesta fase **nao havera hidratacao inicial** da sessao a partir do SecureStore. Ao reabrir o app, o token nao sera restaurado automaticamente. A funcao `hydrateAuth()` e o fluxo completo de autenticacao (interceptors, refresh token, redirect de login) entram na Fase 2.

---

## Verificacao

- [ ] `npx expo start` roda sem erros
- [ ] NativeWind funciona (testar `className="bg-primary"` renderiza a cor correta)
- [ ] Fontes Montserrat carregam (texto com `font-montserrat-bold` aparece correto)
- [ ] Splash screen segura ate fontes carregarem
- [ ] Expo Router navega (app/index.tsx renderiza)
- [ ] Providers estao montados (QueryClient, SafeArea, GestureHandler)
- [ ] `api` client importa e tem baseURL correta
- [ ] Path alias `@/` resolve corretamente
- [ ] ESLint/Prettier rodam sem erros (`npm run lint`, `npm run format`)
- [ ] Estrutura de pastas esta criada
