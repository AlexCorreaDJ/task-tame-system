
# 📱 TDAHFOCUS - Instruções de Build Android

## Pré-requisitos

1. **Node.js** (versão 16 ou superior)
2. **Android Studio** (para SDK e ferramentas Android)
3. **Java 11** ou superior

## Passos para Gerar o APK

### 1. Preparar o Projeto
```bash
# Instalar dependências
npm install

# Build da aplicação web
npm run build

# Sincronizar com o Android
npx cap sync android
```

### 2. Adicionar Plataforma Android (primeira vez)
```bash
npx cap add android
```

### 3. Gerar APK de Debug (para testes)
```bash
# Abrir no Android Studio
npx cap open android

# Ou via linha de comando
cd android
./gradlew assembleDebug
```

### 4. Gerar APK de Release (produção)
```bash
cd android
./gradlew assembleRelease
```

## Localizações dos APKs

- **Debug**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release**: `android/app/build/outputs/apk/release/app-release.apk`
- **Cópia automática**: `build/outputs/TDAHFOCUS-v1.0.0.apk`

## Instalação no Dispositivo

### Via ADB
```bash
adb install caminho/para/o/arquivo.apk
```

### Via Arquivo
1. Copie o APK para o dispositivo Android
2. Ative "Fontes desconhecidas" nas configurações
3. Toque no arquivo APK para instalar

## Funcionalidades do App Nativo

✅ **Notificações Locais**: Funcionam offline, aparecem como balões no Android
✅ **Alarmes do Sistema**: Integração com app de alarmes nativo
✅ **Armazenamento Local**: Todos os dados salvos localmente
✅ **Funciona Offline**: Não precisa de internet após instalação
✅ **Permissões Automáticas**: Solicita permissões necessárias na primeira execução

## Configurações de Produção

- ✅ Debug desabilitado em produção
- ✅ Configuração de keystore para assinatura
- ✅ Otimizações de build habilitadas
- ✅ Ícones e splash screen configurados
- ✅ Permissões Android otimizadas

## Próximos Passos

1. **Personalizar Ícones**: Substitua os ícones em `android/app/src/main/res/mipmap/`
2. **Assinatura de Release**: Configure keystore próprio para publicação
3. **Play Store**: Siga as diretrizes do Google Play para publicação

## Suporte

- O app funciona 100% offline após instalação
- Todas as notificações são locais (não dependem de servidor)
- Compatível com Android 7.0+ (API 24+)
