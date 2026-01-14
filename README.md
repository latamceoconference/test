## LensStore (Brasil) — 렌즈 쇼핑몰 (Pix / Cartão)

브라질 고객을 대상으로 한 **렌즈(의료/뷰티) 이커머스** 프로젝트입니다.  
Next.js(App Router + TypeScript + Tailwind) 기반이며, **Supabase(Postgres + Storage + Auth + Realtime)**로 “상품/옵션/주문/회원/마이페이지”까지 연결되어 있습니다.

- **UI 언어**: pt-BR(포르투갈어)  
- **개발 문서(이 README)**: 한글

---

## 1) 지금까지 구현된 기능(현재 상태)

### 1-1. 스토어(고객 화면)
- **홈(`/`)**
  - 의료/뷰티 이커머스 톤으로 리디자인(Professional/Clean/Trustworthy)
  - 히어로 + 서비스 프라미스 바 + 추천 상품
- **상품 목록(`/products`)**
  - 검색/필터/정렬
- **상품 상세(`/products/[id]`)**
  - **SPH(도수) 선택 UX**(버튼 그리드, 재고/가격 표시)
  - **실시간 재고 반영**(Supabase Realtime 구독)
  - “Adicionar ao carrinho” 클릭 시 **장바구니 등록 완료 모달**(장바구니로 가기/계속 쇼핑)
- **장바구니(`/cart`)**
  - 수량 변경/삭제/합계
- **체크아웃(`/checkout`)**
  - 결제수단 선택: **Pix(우리 사이트에서 QR/코드 표시)**, **Cartão(외부 결제 페이지 리다이렉트)**
  - 로그인 상태면 주소 자동 입력 + 프로필 best-effort 업데이트
- **결제 결과(`/checkout/result`)**
  - 내부 mock 파라미터 + 결제사 리턴 파라미터까지 해석하여 표시
- **정책 페이지**
  - `/policies/*` 템플릿 제공(출시 전 법무 검수 권장)

### 1-2. 회원(로그인/마이페이지)
- **회원가입/로그인**
  - `/signup`, `/login` (Supabase Auth 이메일/비번)
- **마이페이지(상용화 구조)**
  - `/account/profile` : 주소/CPF/전화/CEP 저장
  - `/account/security` : 비밀번호 변경
  - `/account/orders` : 주문내역(진행중/히스토리) + 재구매
  - `/account/orders/[id]` : 주문 상세 + 재구매

### 1-3. 주문/결제/재고(핵심 비즈니스 로직)
- **주문 생성**
  - 주문/주문아이템을 Supabase에 먼저 저장 후 결제 진행
  - 로그인 상태면 `orders.user_id`에 유저가 연결되어 “내 주문”에서 조회 가능
- **재고 차감(예약)**
  - 주문 생성 시점에 `reserve_stock(order_id)`로 차감(오버셀 방지)
  - 실패/취소 시 `release_stock(order_id)`로 복구
- **Pix QR**
  - 서버에서 Pix 결제를 생성하고 QR/코드를 반환 → 체크아웃 화면에 노출
- **결제 웹훅**
  - 결제 상태를 조회 후 `orders.status` 업데이트

### 1-4. 신뢰/전환 요소(상용화 UX)
- 상단 헤더/하단 푸터를 “프리미엄/신뢰” 톤으로 리디자인
- 하단에 회사정보/정책/결제수단/신뢰 스트립 제공
- **오른쪽 하단 WhatsApp 플로팅 버튼**(환경변수로 제어)

---

## 2) 로컬 실행(Windows PowerShell)

```powershell
$desktop=[Environment]::GetFolderPath('Desktop')
cd -LiteralPath (Join-Path (Join-Path $desktop 'Shopping') 'lensstore')
npm install
npm run dev
```

접속:
- `http://localhost:4000`

---

## 3) Supabase 연결(가장 중요)

### 3-1. `.env.local` 만들기
`lensstore/env.example`을 복사해서 `lensstore/.env.local`을 만든 뒤 값을 채웁니다.

- **필수**
  - `NEXT_PUBLIC_SITE_URL=http://localhost:4000`
  - `NEXT_PUBLIC_SUPABASE_URL=...`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
  - `SUPABASE_SERVICE_ROLE_KEY=...` *(서버 전용, 절대 노출 금지)*
- **결제 사용 시**
  - `MERCADOPAGO_ACCESS_TOKEN=...`
- **WhatsApp 버튼**
  - `NEXT_PUBLIC_WHATSAPP_PHONE=5511999999999` *(없으면 버튼 숨김)*

> `.env.local` 수정 후에는 서버를 반드시 재시작하세요. (`Ctrl + C` → `npm run dev`)

### 3-2. Supabase SQL 적용 순서(필수)
Supabase → SQL Editor에서 아래 순서로 실행하세요.

1) `supabase/schema.sql` (상품/옵션/주문 기본 테이블 + 카탈로그 RLS)
2) `supabase/seed.sql` (선택) 샘플 상품/옵션
3) `supabase/functions.sql` (재고 차감/복구 함수)
4) `supabase/auth_profiles.sql` (profiles + 유저 생성 트리거 + RLS)
5) `supabase/orders_auth.sql` (orders.user_id + 내 주문 조회 RLS)

### 3-3. “연동 됐는지” 확인
- `/api/debug/catalog` → `ok:true`면 카탈로그 읽기 성공
- `/products`에서 Supabase 상품이 보이면 성공

---

## 4) 결제 테스트(로컬/실결제)

### 4-1. 토큰 없이(흐름 확인)
목표: 상품→장바구니→체크아웃→결과 페이지까지.
- 토큰이 비어있으면(=실결제 불가) **개발 흐름 확인**만 가능합니다.

### 4-2. Pix(QR/코드 표시)
목표: 체크아웃 화면에 QR/코드가 뜨는지.
- `.env.local`에 `MERCADOPAGO_ACCESS_TOKEN` 필요
- `/checkout`에서 Pix 선택 → “Gerar Pix …” 클릭

### 4-3. Cartão(리다이렉트 결제)
목표: 외부 결제 페이지로 이동하는지.
- `/checkout`에서 Cartão 선택 → “Pagar …” 클릭

### 4-4. 웹훅(주문 상태 자동 업데이트)
웹훅은 공개 URL이 필요합니다.
- **권장**: Vercel 배포 후 테스트
- 로컬 테스트는 ngrok 등을 사용해 `NEXT_PUBLIC_SITE_URL`을 공개 URL로 설정해야 합니다.

---

## 5) 이미지(실사 히어로/상품 이미지) 운영

### 5-1. 홈 히어로 실사 이미지
실사 히어로 이미지를 쓰려면:
- `public/images/hero-photo.jpg`에 파일을 넣으세요.
- 파일이 없으면 자동으로 SVG(폴백)를 사용합니다.

### 5-2. 상품 이미지
상용 운영은 Supabase Storage 권장:
- 버킷 예: `product-images`
- 경로 예: `products/{productId}/cover.webp`
- DB `products.image_url`에 URL(또는 path)을 저장

---

## 6) 핵심 파일/폴더 지도(요약)
- `src/app/page.tsx` : 홈(리디자인)
- `src/components/HeroBanner.tsx` : 히어로
- `src/components/BenefitBar.tsx` : 서비스 프라미스 바
- `src/components/header.tsx`, `src/components/footer.tsx` : 상단/하단(신뢰 톤)
- `src/components/floating-whatsapp.tsx` : WhatsApp 플로팅 버튼
- `src/lib/catalog.ts` : Supabase 카탈로그 로더(폴백 포함)
- `src/store/cart.ts` : 장바구니 스냅샷 저장
- `src/app/checkout/page.tsx` : Pix/Cartão 분기 + Pix QR 표시
- `src/app/api/checkout/create-pix/route.ts` : Pix 결제 생성
- `src/app/api/checkout/create-preference/route.ts` : 카드 결제 세션 생성
- `src/app/api/mercadopago/webhook/route.ts` : 웹훅
- `src/app/account/*` : 마이페이지(프로필/보안/주문)
- `supabase/*.sql` : DB 스키마/정책/함수

---

## 7) 상업적으로 “추가하면 매출/신뢰에 큰 도움” 되는 아이디어(우선순위)

### P0 (출시 직전 필수)
- **OD/OE(좌/우 눈) 분리 선택**(렌즈 쇼핑몰 전환율에 매우 큼)
- **주문 상태 라벨/UX 개선**(결제대기/결제완료/처리중/배송중/완료)
- **고객 주문 조회/알림**(이메일/WhatsApp: 결제 완료, 배송 시작 등)
- **실제 사업자 정보/연락처/정책 문구 확정**(LGPD 포함)

### P1 (매출/재구매 강화)
- **원클릭 재구매**(최근 구매 기반 추천 + “같은 도수로 다시 구매”)
- **구독/정기구매**(월/분기)
- **쿠폰/프로모션/번들**(2박스 할인 등)
- **장바구니 이탈 리마인더**(이메일/WhatsApp)

### P2 (신뢰/콘텐츠/SEO)
- **리뷰(사진/별점) + Q&A**
- **의료 콘텐츠(가이드)**: 착용/관리/부작용/주의사항
- **SEO 기본**: 상품 메타/OG/사이트맵/robots

### P3 (운영 자동화)
- **관리자(Backoffice)**: 상품/재고/주문/환불/CS
- **재고 알림**: 임계치 이하 알림 + 자동 발주 리스트
- **A/B 테스트 + 분석**(GA4/Meta Pixel)
