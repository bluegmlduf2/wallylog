# WallyLog - Next.js Markdown Blog

Next.js와 Tailwind CSS를 사용한 마크다운 기반 블로그입니다.

## ✨ 특징

-   📝 **마크다운 지원** - 마크다운으로 쉽게 글 작성
-   🚀 **빠른 성능** - Next.js 15의 App Router와 정적 생성 기능 활용
-   🎨 **모던한 디자인** - Tailwind CSS로 만든 깔끔하고 반응형 UI
-   🏷️ **태그 시스템** - 포스트를 태그로 분류
-   ⚡ **TypeScript** - 타입 안전성과 개발 생산성
-   🌐 **다국어 지원** - 다국어 지원

## 🛠️ 사용 기술

-   **Next.js 15** - React 기반 풀스택 프레임워크
-   **TypeScript** - 정적 타입 체크
-   **Tailwind CSS** - 유틸리티 퍼스트 CSS 프레임워크
-   **gray-matter** - 마크다운 front matter 파싱
-   **remark** & **remark-html** - 마크다운을 HTML로 변환
-   **@tiptap/react** - 리치 텍스트 에디터
-   **AI SDK** - OpenRouter API 연동
-   **next-intl** - 다국어 지원

## 🎯 주요 기능

-   📝 **웹 에디터** - 브라우저에서 직접 포스트 작성 및 수정
-   � **GitHub 저장** - 선택적으로 GitHub에 파일 저장 및 자동 커밋
-   👨‍💻 **관리자 인증** - 안전한 포스트 관리
-   🏷️ **카테고리 시스템** - 포스트를 카테고리별로 분류
-   🖼️ **이미지 업로드** - 드래그 앤 드롭으로 이미지 업로드
-   🤖 **AI 지원** - OpenRouter API를 통한 AI 기능
-   📱 **반응형 디자인** - 모든 디바이스에서 최적화된 UI
-   🌐 **다국어 지원** - 한국어 및 영어 일본어 지원

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local.example` 파일을 `.env.local`로 복사하고 필요한 값들을 설정하세요:

```bash
cp .env.local.example .env.local
```

주요 환경 변수:

```env
# 사이트 URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 관리자 비밀번호
ADMIN_PASSWORD=your-admin-password

# JWT 비밀키
JWT_SECRET=your-jwt-secret-key

# GitHub 파일 저장 비활성화 (로컬 개발용)
USE_GITHUB_STORAGE=false

# GitHub 설정 (GitHub 저장 기능 사용시)
GITHUB_TOKEN=your-github-token
GITHUB_REPOSITORY=your-username/your-repo
GITHUB_BRANCH=main

# Git 사용자 정보
GIT_USER_NAME="WallyLog Bot"
GIT_USER_EMAIL="bot@wallylog.com"

# OpenRouter API Key (AI 기능 사용시)
OPENROUTER_API_KEY=your-openrouter-api-key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

## 🔄 GitHub 저장 기능

WallyLog는 GitHub API를 사용하여 포스트를 저장할 때 자동으로 GitHub 리포지토리에 커밋하고 푸시하는 기능을 제공합니다.

### � 설정 방법

#### 1. GitHub Personal Access Token 생성

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 다음 권한 부여:
    - `repo` (전체 리포지토리 접근)
    - `contents:write` (파일 생성/수정)

#### 2. 환경 변수 설정

**로컬 개발 (.env.local)**

```env
USE_GITHUB_STORAGE=true
GITHUB_TOKEN=ghp_your_token_here
GITHUB_REPOSITORY=your-username/your-repo
GITHUB_BRANCH=main
GIT_USER_NAME="WallyLog Bot"
GIT_USER_EMAIL="bot@wallylog.com"
```

**Vercel 배포 (Environment Variables)**

-   Vercel Dashboard → 프로젝트 → Settings → Environment Variables
-   위의 환경 변수들을 모든 환경(Production, Preview, Development)에 추가

### 🔧 작동 방식

-   **GitHub API 사용**: 모든 환경에서 일관된 동작
-   **자동 커밋**: 웹 에디터에서 포스트 저장 시 자동 실행
-   **커밋 메시지**: `Add new post: {포스트 제목} (#{포스트 번호})`
-   **자동 재배포**: GitHub 푸시 → Vercel 자동 재배포 (GitHub 연동 시)
-   **안전한 실패**: GitHub API 실패 시에도 포스트 작성은 정상 완료

### 🎯 장점

-   ✅ **환경 무관**: 로컬/Vercel 모든 환경에서 동일하게 작동
-   ✅ **간단한 설정**: 복잡한 Git 설정 불필요
-   ✅ **안정성**: 서버리스 환경에 최적화
-   ✅ **자동 배포**: GitHub 푸시 시 Vercel 자동 재배포

### 3. 새 포스트 작성

웹 에디터를 통해 포스트를 작성하거나, 직접 `/posts/` 디렉토리에 마크다운 파일을 생성할 수 있습니다:

```markdown
---
title: "새로운 포스트"
date: "2024-12-01"
category: "태그"
---

# 포스트 내용

여기에 마크다운으로 내용을 작성하세요.
```

## 📁 프로젝트 구조

```
wallylog/
├── posts/                    # 마크다운 포스트 파일들
│   ├── 1.md
│   ├── 2.md
│   └── ...
├── public/
│   ├── storage/              # 이미지 파일들
│   └── favicon.ico
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── posts/[slug]/     # 동적 포스트 페이지
│   │   ├── api/              # API 라우트
│   │   └── page.tsx          # 홈페이지
│   ├── components/           # React 컴포넌트
│   ├── lib/                  # 유틸리티 함수들
│   │   ├── posts.ts          # 마크다운 처리 유틸리티
│   │   ├── github.ts         # GitHub API 관련 함수
│   │   └── github-api.ts     # GitHub API 추가 유틸리티
│   └── hooks/                # 커스텀 훅들
├── scripts/                  # 스크립트 파일들
├── .github/
│   └── copilot-instructions.md
└── package.json
```

## 🎨 커스터마이징

### 스타일링

Tailwind CSS 클래스를 사용하여 스타일을 커스터마이징할 수 있습니다.

### 포스트 메타데이터

각 마크다운 파일의 front matter에서 다음 필드를 지원합니다:

-   `title`: 포스트 제목
-   `date`: 발행 날짜 (YYYY-MM-DD)
-   `category`: 카테고리 (문자열)

## 📦 빌드 및 배포

### 빌드

```bash
npm run build
```

### 로컬에서 프로덕션 버전 실행

```bash
npm start
```

### Vercel에 배포

가장 쉬운 방법은 [Vercel Platform](https://vercel.com/new)을 사용하는 것입니다.

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

💡 **팁**: 웹 에디터를 사용하여 포스트를 작성하면 GitHub에 자동으로 저장되고 사이트가 업데이트됩니다. 관리자 페이지는 `/admin`에서 접근할 수 있습니다.
