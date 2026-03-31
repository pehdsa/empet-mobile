# Downgrade Expo SDK 55 → SDK 54 (LTS)

Motivo: Expo Go ainda so aceita SDK 54 (55 nao esta estavel).

## Pacotes Expo

| Pacote | Atual (SDK 55) | SDK 54 |
|--------|---------------|--------|
| `expo` | ~55.0.9 | ~54.0.0 |
| `babel-preset-expo` | ~55.0.8 | ~54.0.0 |
| `expo-constants` | ~55.0.9 | ~54.0.0 |
| `expo-font` | ~55.0.4 | ~54.0.0 |
| `expo-image-picker` | ~55.0.14 | ~54.0.0 |
| `expo-linking` | ~55.0.9 | ~54.0.0 |
| `expo-location` | ~55.1.4 | ~54.0.0 |
| `expo-router` | ~55.0.8 | ~54.0.0 |
| `expo-secure-store` | ~55.0.9 | ~54.0.0 |
| `expo-splash-screen` | ~55.0.13 | ~54.0.0 |
| `expo-status-bar` | ~55.0.4 | ~54.0.0 |

## React / React Native

| Pacote | Atual (SDK 55) | SDK 54 |
|--------|---------------|--------|
| `react` | 19.2.0 | 19.0.0 |
| `react-dom` | 19.2.0 | 19.0.0 |
| `react-native` | 0.83.2 | 0.79.x |
| `@types/react` | ~19.2.2 | ~19.0.0 |

## Bibliotecas nativas

| Pacote | Atual (SDK 55) | SDK 54 |
|--------|---------------|--------|
| `react-native-gesture-handler` | ~2.30.0 | ~2.24.0 |
| `react-native-reanimated` | 4.2.1 | ~3.17.0 |
| `react-native-safe-area-context` | ~5.6.2 | ~5.4.0 |
| `react-native-screens` | ~4.23.0 | ~4.10.0 |
| `react-native-svg` | 15.15.3 | ~15.11.0 |
| `react-native-worklets` | 0.7.2 | remover (veio com reanimated 4) |

## Pontos de atencao

1. **Reanimated 4 → 3**: Maior breaking change. Reanimated 4 depende de `react-native-worklets` separado. No SDK 54 volta para Reanimated 3 e `react-native-worklets` pode ser removido.
2. **React 19.2 → 19.0**: Pequenas diferencas, improvavel quebrar algo.
3. **react-native 0.83 → 0.79**: Salto grande. Pode impactar `@gorhom/bottom-sheet` e `react-native-maps` — verificar compatibilidade.
4. **NativeWind ^4.2.3**: Deve funcionar com SDK 54, mas vale testar.
5. **app.json / app.config**: Atualizar `sdkVersion` se existir.

## Como executar

```bash
# 1. Mudar expo no package.json para ~54.0.0
# 2. Alinhar tudo automaticamente
npx expo install --fix

# 3. Remover react-native-worklets (so necessario no reanimated 4)
npm uninstall react-native-worklets

# 4. Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install

# 5. Verificar compatibilidade
npx expo install --check
```
