# Smart, Do-it! - Todo App

스마트한 할 일 관리 웹 애플리케이션입니다.

## 🚀 배포 시 Firebase 설정 방법

현재 애플리케이션은 Firebase Firestore를 사용하여 실제 서버에 데이터를 저장합니다. 깃허브로 배포할 때는 반드시 실제 Firebase 프로젝트를 설정해야 합니다.

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: `smart-todo-app`)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

### 2. Authentication 설정

1. Firebase Console에서 생성한 프로젝트 선택
2. 왼쪽 메뉴에서 "Authentication" 클릭
3. "시작하기" 클릭
4. "Sign-in method" 탭 클릭
5. "이메일/비밀번호" 활성화
6. "저장" 클릭

### 3. Firestore Database 설정

1. 왼쪽 메뉴에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. 보안 규칙 선택:
   - **테스트 모드**: 개발/테스트용 (30일 후 자동 비활성화)
   - **프로덕션 모드**: 운영용 (권장)
4. 위치 선택 (asia-northeast3 권장)
5. "완료" 클릭

### 4. 웹 앱 설정

1. 프로젝트 설정(⚙️) 클릭
2. "일반" 탭에서 "내 앱" 섹션
3. 웹 앱 아이콘(</>) 클릭
4. 앱 닉네임 입력 (예: `smart-todo-web`)
5. "앱 등록" 클릭
6. Firebase SDK 설정 복사

### 5. 코드에 설정 적용

**방법 1: 설정 파일 사용 (권장)**

1. `firebase-config.example.js` 파일을 복사하여 `firebase-config.js`로 이름 변경
2. `firebase-config.js` 파일의 설정을 실제 Firebase 설정으로 교체:

```javascript
const firebaseConfig = {
    apiKey: "실제_API_키",
    authDomain: "프로젝트명.firebaseapp.com",
    projectId: "프로젝트_ID",
    storageBucket: "프로젝트명.appspot.com",
    messagingSenderId: "실제_메시징_센더_ID",
    appId: "실제_앱_ID",
    measurementId: "실제_측정_ID"
};

export default firebaseConfig;
```

**방법 2: 환경 변수 사용 (고급)**

1. 프로젝트 루트에 `.env.local` 파일 생성:
```
FIREBASE_API_KEY=실제_API_키
FIREBASE_AUTH_DOMAIN=프로젝트명.firebaseapp.com
FIREBASE_PROJECT_ID=프로젝트_ID
FIREBASE_STORAGE_BUCKET=프로젝트명.appspot.com
FIREBASE_MESSAGING_SENDER_ID=실제_메시징_센더_ID
FIREBASE_APP_ID=실제_앱_ID
FIREBASE_MEASUREMENT_ID=실제_측정_ID
```

2. `firebase-config.js`에서 환경 변수 사용 (이미 설정됨)

**방법 3: 직접 설정 (간단한 방법)**

`index.html` 파일에서 `firebase-config.js` import 부분을 제거하고 직접 설정:

```javascript
const firebaseConfig = {
    apiKey: "실제_API_키",
    authDomain: "프로젝트명.firebaseapp.com",
    projectId: "프로젝트_ID",
    storageBucket: "프로젝트명.appspot.com",
    messagingSenderId: "실제_메시징_센더_ID",
    appId: "실제_앱_ID",
    measurementId: "실제_측정_ID"
};
```

### 6. Firestore 보안 규칙 설정 (선택사항)

Firestore Database > 규칙 탭에서 다음 규칙 적용:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자는 자신의 데이터만 읽고 쓸 수 있음
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🔧 로컬 개발

1. 저장소 클론
2. 실제 Firebase 설정 적용
3. 로컬 서버 실행:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve .
   ```

## 📱 기능

- ✅ 사용자 인증 (회원가입/로그인/로그아웃)
- ✅ 할 일 관리 (추가/수정/삭제/완료)
- ✅ 우선순위 설정
- ✅ 마감일 설정
- ✅ 카테고리 분류
- ✅ 하위 작업 관리
- ✅ 캘린더 뷰
- ✅ 다크/라이트 테마
- ✅ 반응형 디자인

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase Authentication + Firestore
- **배포**: GitHub Pages

## ⚠️ 주의사항

- Firebase 설정이 올바르지 않으면 회원가입/로그인이 작동하지 않습니다
- Firestore 보안 규칙을 적절히 설정하여 데이터 보안을 유지하세요
- 프로덕션 환경에서는 테스트 모드가 아닌 프로덕션 모드를 사용하세요

## 🔒 시크릿 보안 문제 해결

**문제**: 깃허브에서 "Secrets detected" 알림이 발생하는 경우

**해결 방법**:

1. **설정 파일 분리** (권장):
   - `firebase-config.js` 파일을 `.gitignore`에 추가
   - 실제 설정은 로컬에서만 관리
   - `firebase-config.example.js`를 예시로 제공

2. **깃허브 시크릿 사용**:
   - Repository Settings → Secrets and variables → Actions
   - Firebase 설정을 환경 변수로 추가
   - GitHub Actions에서 빌드 시 주입

3. **API 키 제한 설정**:
   - Google Cloud Console에서 API 키 제한 설정
   - 특정 도메인에서만 사용 가능하도록 제한

4. **즉시 해결 방법**:
   - 깃허브 저장소에서 `firebase-config.example.js` 파일 수정
   - 실제 API 키를 `YOUR_FIREBASE_API_KEY`로 교체
   - 커밋하여 시크릿 알림 해결

## 📞 문제 해결

### 회원가입 오류가 발생하는 경우:

1. **Firebase 설정 확인**: 브라우저 개발자 도구 콘솔에서 Firebase 초기화 오류 확인
2. **Authentication 활성화**: Firebase Console에서 이메일/비밀번호 인증이 활성화되어 있는지 확인
3. **네트워크 연결**: 인터넷 연결 상태 확인
4. **브라우저 콘솔**: F12를 눌러 콘솔에서 상세 오류 메시지 확인

### 🔑 API 키 오류 해결 방법:

**오류**: `Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)`

**해결 방법**:

1. **Firebase Console 확인**:
   - [Firebase Console](https://console.firebase.google.com/) → 프로젝트 선택
   - 프로젝트 설정(⚙️) → 일반 탭
   - "내 앱" 섹션에서 웹 앱의 설정 확인

2. **API 키 제한 확인**:
   - Google Cloud Console → API 및 서비스 → 사용자 인증 정보
   - API 키 선택 → 애플리케이션 제한사항 확인
   - **HTTP 리퍼러(웹사이트)** 제한이 설정되어 있다면:
     - `https://yourusername.github.io/*` 추가
     - `https://yourusername.github.io/your-repo-name/*` 추가
     - 또는 임시로 제한 해제

3. **도메인 설정 확인**:
   - Firebase Console → Authentication → 설정
   - "승인된 도메인"에 GitHub Pages 도메인 추가:
     - `yourusername.github.io`
     - `your-repo-name.github.io`

4. **프로젝트 ID 확인**:
   - Firebase Console에서 정확한 프로젝트 ID 복사
   - `index.html`의 `projectId` 값과 일치하는지 확인

### 일반적인 오류 코드:

- `auth/api-key-not-valid`: Firebase API 키가 유효하지 않음
- `auth/project-not-found`: Firebase 프로젝트를 찾을 수 없음
- `auth/email-already-in-use`: 이미 존재하는 사용자명
- `auth/weak-password`: 비밀번호가 너무 약함 (최소 6자)
- `auth/operation-not-allowed`: 이메일/비밀번호 인증이 비활성화됨
- `auth/network-request-failed`: 네트워크 연결 문제

## 📄 라이선스

MIT License
