# Capacitor 설치 및 설정 가이드

## 1. Capacitor 설치
```bash
npm install -g @capacitor/cli
npm install @capacitor/core @capacitor/cli
npx cap init "Smart Do-it!" "com.smartdoit.app"
```

## 2. 플랫폼 추가
```bash
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

## 3. 웹 빌드 및 동기화
```bash
npx cap sync
npx cap open android  # Android Studio 열기
npx cap open ios      # Xcode 열기
```

## 4. 필요한 플러그인 설치
```bash
npm install @capacitor/push-notifications
npm install @capacitor/local-notifications
npm install @capacitor/network
npm install @capacitor/status-bar
npm install @capacitor/splash-screen
```

## 5. 네이티브 기능 설정

### Android (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

### iOS (ios/App/App/Info.plist)
```xml
<key>UIBackgroundModes</key>
<array>
    <string>background-fetch</string>
    <string>remote-notification</string>
</array>
```

## 6. Firebase 설정

### Android
1. Firebase Console에서 Android 앱 추가
2. google-services.json 파일을 android/app/에 복사
3. android/app/build.gradle에 플러그인 추가

### iOS  
1. Firebase Console에서 iOS 앱 추가
2. GoogleService-Info.plist 파일을 ios/App/App/에 복사
3. Xcode에서 파일 추가
