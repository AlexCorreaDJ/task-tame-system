
#!/bin/bash

echo "🚀 TDAHFOCUS - Build Android Automatizado"
echo "========================================="

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Verificar se o Capacitor CLI está instalado
if ! command -v cap &> /dev/null; then
    echo "📦 Instalando Capacitor CLI..."
    npm install -g @capacitor/cli
fi

echo "📦 Instalando dependências..."
npm install

echo "🏗️ Fazendo build da aplicação web..."
npm run build

echo "🔄 Sincronizando com Android..."
npx cap sync android

echo "📱 Verificando se a plataforma Android existe..."
if [ ! -d "android" ]; then
    echo "➕ Adicionando plataforma Android..."
    npx cap add android
fi

echo "🔨 Gerando APK de debug..."
cd android
chmod +x gradlew
./gradlew assembleDebug

echo "✅ Build concluído!"
echo ""
echo "📁 APK gerado em: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "📱 Para instalar no dispositivo:"
echo "   adb install android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "🎉 Seu app TDAHFOCUS está pronto para ser instalado!"
