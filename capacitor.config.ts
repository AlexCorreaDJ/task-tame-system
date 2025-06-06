
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ebfff8e926ab4767aa4f9feb77a2e287',
  appName: 'TDAHFOCUS',
  webDir: 'dist',
  server: {
    url: 'https://ebfff8e9-26ab-4767-aa4f-9feb77a2e287.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    LocalNotifications: {
      smallIcon: "ic_notification",
      iconColor: "#4F46E5",
      sound: "default",
      // Configurações para funcionar em segundo plano
      requestPermissions: true,
      scheduleOn: "trigger",
      // Habilitando configurações de estilo balão para Android
      actionTypes: [
        {
          id: "REMINDER_ACTION",
          actions: [
            {
              id: "view",
              title: "Ver"
            },
            {
              id: "dismiss",
              title: "Dispensar",
              destructive: true
            }
          ]
        }
      ]
    },
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    backgroundColor: "#ffffff",
    // Permite que o app funcione em segundo plano
    useLegacyBridge: false,
    // Configurações para notificações em estilo balão
    intentFilters: [
      {
        action: "android.intent.action.VIEW",
        autoVerify: true,
        data: {
          scheme: "tdahfocus",
        },
        category: [
          "android.intent.category.DEFAULT",
          "android.intent.category.BROWSABLE"
        ]
      }
    ],
    // Configurações adicionais para FCM
    includePlugins: [
      "@capacitor/push-notifications",
      "@capacitor/local-notifications"
    ],
  },
};

export default config;
