# 애플 앱스토어 출시 가이드

## 1. 개발자 계정 등록
- **비용**: $99/년 (연간 구독)
- **등록**: https://developer.apple.com/
- **필요 서류**: 신용카드, 신분증, Apple ID

## 2. 앱 업로드 준비

### A. Xcode 설정
```bash
# iOS 프로젝트 열기
npx cap open ios

# Xcode에서:
# 1. 프로젝트 설정 > Signing & Capabilities
# 2. Team 선택 (개발자 계정)
# 3. Bundle Identifier 설정: com.smartdoit.app
```

### B. 앱 빌드 및 아카이브
```bash
# Xcode에서:
# 1. Product > Archive 선택
# 2. Organizer에서 "Distribute App" 클릭
# 3. "App Store Connect" 선택
# 4. 업로드 완료
```

## 3. App Store Connect 설정

### 기본 정보
- **앱 이름**: Smart Do-it! - 할 일 관리
- **부제목**: 스마트한 할 일 관리 앱
- **키워드**: 할일,일정관리,생산성,캘린더,메모,계획
- **카테고리**: 생산성 (Productivity)
- **콘텐츠 권한**: 4+ (모든 연령)

### 앱 정보
- **설명**: 위의 앱 설명 사용
- **프로모션 텍스트**: "Firebase 기반 스마트 할 일 관리 앱"
- **지원 URL**: https://smartdoit.com
- **마케팅 URL**: 선택사항

### 가격 및 가용성
- **가격**: 무료
- **가용성**: 전 세계 또는 선택
- **출시 날짜**: 즉시 또는 예약

## 4. 앱 미리보기 및 스크린샷

### 스크린샷 요구사항
- **iPhone**: 1170x2532px (iPhone 12 Pro)
- **iPad**: 2048x2732px
- **최소 개수**: 3개
- **최대 개수**: 10개

### 앱 미리보기 (선택사항)
- **형식**: MP4 또는 MOV
- **길이**: 15-30초
- **크기**: 최대 500MB

## 5. 앱 검토 정보

### 개인정보처리방침
- Firebase 사용에 대한 설명 필수
- 데이터 수집 및 사용 목적 명시
- 사용자 권리 및 연락처 정보

### 연락처 정보
- **이름**: 개발자 이름
- **전화번호**: 연락 가능한 번호
- **이메일**: support@smartdoit.com

### 앱 검토 정보
- **데모 계정**: 테스트용 계정 정보 제공
- **특별 지침**: 특별한 테스트 방법이 있다면 설명
- **앱 버전**: 1.0.0

## 6. 출시 프로세스

### 1단계: 앱 제출
1. App Store Connect에서 앱 정보 입력
2. 스크린샷 및 미리보기 업로드
3. 빌드 선택 (Xcode에서 업로드한 빌드)
4. 검토 제출

### 2단계: 심사 대기
- **심사 시간**: 보통 24-48시간
- **심사 기준**: App Store Review Guidelines 준수

### 3단계: 출시
- 심사 통과 시 자동 출시 또는 수동 출시
- 출시 알림 이메일 수신

## 7. iOS 특별 고려사항

### 권한 요청
```xml
<!-- Info.plist에 추가 -->
<key>NSUserNotificationsUsageDescription</key>
<string>할 일 알림을 위해 알림 권한이 필요합니다.</string>
```

### Firebase 설정
- GoogleService-Info.plist 파일을 Xcode 프로젝트에 추가
- Firebase iOS SDK 설정 확인

### 앱 아이콘
- **크기**: 1024x1024px (PNG)
- **형식**: PNG (투명도 없음)
- **다양한 크기**: Xcode에서 자동 생성

## 8. 출시 후 관리

### 업데이트
- 새 버전 업로드 시 자동 심사
- 버그 수정 및 기능 추가

### 분석
- App Store Connect에서 다운로드 수 확인
- 사용자 리뷰 및 평점 모니터링
- 크래시 리포트 확인

### 마케팅
- App Store 최적화 (ASO)
- 소셜 미디어 홍보
- 사용자 피드백 수집

## 9. 주의사항

### 정책 준수
- App Store Review Guidelines 준수
- 개인정보 보호 정책 준수
- 콘텐츠 정책 준수

### 기술적 요구사항
- iOS 12.0 이상 지원
- 64비트 아키텍처 지원
- 앱 크기 제한 (4GB)

### 법적 요구사항
- 개인정보처리방침 필수
- 이용약관 제공 권장
- 연락처 정보 제공

## 10. 비용 정리

### 개발자 계정
- **Apple Developer Program**: $99/년
- **Google Play Console**: $25 (일회성)

### 총 예상 비용
- **최소**: $124 (Apple $99 + Google $25)
- **추가 비용**: 디자인, 마케팅, 법적 검토 등
