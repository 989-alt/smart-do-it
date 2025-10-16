# 실제 개발 명령어 가이드

## 1. 프로젝트 초기화
```bash
# 현재 디렉토리에서 시작
cd C:\Users\4F 전담실\Downloads\test1

# Capacitor 초기화
npm init -y
npm install @capacitor/core @capacitor/cli
npx cap init "Smart Do-it!" "com.smartdoit.app"
```

## 2. 플랫폼 추가
```bash
# Android 및 iOS 플랫폼 추가
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

## 3. 필요한 플러그인 설치
```bash
# 네이티브 기능 플러그인들
npm install @capacitor/push-notifications
npm install @capacitor/local-notifications
npm install @capacitor/network
npm install @capacitor/status-bar
npm install @capacitor/splash-screen
npm install @capacitor/app
npm install @capacitor/haptics
npm install @capacitor/keyboard
```

## 4. 웹 빌드 및 동기화
```bash
# 웹 파일들을 네이티브 프로젝트에 복사
npx cap sync

# Android Studio 열기
npx cap open android

# Xcode 열기 (macOS에서만)
npx cap open ios
```

## 5. Android 빌드
```bash
# Android 프로젝트로 이동
cd android

# 디버그 빌드
./gradlew assembleDebug

# 릴리스 빌드 (서명 필요)
./gradlew assembleRelease

# AAB 파일 생성 (Play Store 업로드용)
./gradlew bundleRelease
```

## 6. iOS 빌드 (macOS에서만)
```bash
# iOS 프로젝트로 이동
cd ios

# Xcode에서 빌드
# 1. Xcode 열기
# 2. Product > Archive 선택
# 3. Organizer에서 "Distribute App" 클릭
```

## 7. 개발 중 유용한 명령어
```bash
# 실시간 개발 (웹 변경사항을 앱에 반영)
npx cap run android
npx cap run ios

# 특정 기기에서 실행
npx cap run android --target="device-id"
npx cap run ios --target="device-id"

# 플러그인 동기화
npx cap sync

# 프로젝트 정리
npx cap clean
```

## 8. Firebase 설정

### Android
```bash
# google-services.json 파일을 android/app/에 복사
# android/app/build.gradle에 플러그인 추가:
# apply plugin: 'com.google.gms.google-services'
```

### iOS
```bash
# GoogleService-Info.plist 파일을 ios/App/App/에 복사
# Xcode에서 파일을 프로젝트에 추가
```

## 9. 앱 아이콘 생성
```bash
# 온라인 도구 사용 권장:
# - https://appicon.co/
# - https://icon.kitchen/
# - https://realfavicongenerator.net/

# 또는 수동으로 다양한 크기 생성:
# 16x16, 32x32, 48x48, 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
```

## 10. 테스트 및 디버깅
```bash
# Android 디버깅
adb logcat | grep "SmartDoIt"

# iOS 디버깅 (macOS에서만)
# Xcode > Window > Devices and Simulators

# 웹 디버깅
# Chrome DevTools 사용
```

## 11. 출시 준비
```bash
# 최종 빌드
npx cap sync
cd android && ./gradlew bundleRelease
cd ../ios && # Xcode에서 Archive

# 앱 서명 확인
keytool -list -v -keystore smart-do-it-release-key.keystore -alias smart-do-it
```

## 12. 업데이트 프로세스
```bash
# 코드 변경 후
npx cap sync
cd android && ./gradlew bundleRelease
cd ../ios && # Xcode에서 새 Archive 생성

# 버전 업데이트
# capacitor.config.ts에서 version 수정
# 또는 package.json에서 version 수정
```
