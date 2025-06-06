
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ebfff8e926ab4767aa4f9feb77a2e287',
  appName: 'TDAHFOCUS',
  webDir: 'dist',
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
      requestPermissions: true,
      scheduleOn: "trigger",
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
    webContentsDebuggingEnabled: false, // Desabilitado para produção
    backgroundColor: "#ffffff",
    useLegacyBridge: false,
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
      releaseType: "APK"
    },
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
    includePlugins: [
      "@capacitor/push-notifications",
      "@capacitor/local-notifications"
    ],
  },
};

export default config;
