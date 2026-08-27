const sections = [
  {
    title: "1. 개인정보 처리 목적",
    intro: "blogmate는 소상공인과 마케터가 네이버 블로그 초안을 만들 수 있도록 필요한 범위에서 개인정보를 처리합니다.",
    points: [
      "카카오 로그인, 회원 식별, 세션 유지 및 관리자 권한 확인",
      "브랜드 프로필·말투·기존 글을 저장하고 톤 분석 및 초안 생성에 활용",
      "키워드, SEO 점검, 생성 이력, 브랜드별 월간 이용량 관리",
      "청구서 신청, 결제선생을 통한 청구서 발송, 수납 확인 및 구독 승인",
      "문의 대응, 오류 분석, 보안 유지 및 부정 이용 방지",
    ],
  },
  {
    title: "2. 처리하는 개인정보 항목",
    intro: "서비스 제공에 필요한 최소한의 항목만 처리합니다. 실제 공개 전 사용하는 로그인·결제·저장 설정에 맞춰 최종 확정합니다.",
    points: [
      "카카오 로그인: 카카오 계정 식별자, 카카오가 제공하는 이름·프로필 등 기본 정보",
      "청구서 신청: 신청자 이름 또는 입금자명, 사업자명, 연락처, 선택 플랜 및 결제주기",
      "서비스 이용: 브랜드명·업종·지역·소개, 키워드, 해시태그 템플릿, 생성 초안 및 SEO 결과",
      "콘텐츠 분석: 이용자가 입력하거나 URL로 분석을 요청한 공개 블로그 텍스트와 그 분석 결과",
      "자동 수집: 접속 일시, IP 주소, 브라우저·기기 정보, 오류 및 서비스 이용 기록",
    ],
  },
  {
    title: "3. 이용자가 입력·업로드하는 콘텐츠",
    intro: "브랜드 자료, 기존 글, 사진과 생성 초안은 이용자 요청에 따른 서비스 제공을 위해 처리됩니다.",
    points: [
      "URL 분석을 요청한 경우 공개 웹페이지에서 텍스트를 수집해 톤 분석에 사용할 수 있습니다.",
      "업로드한 사진은 썸네일 제작 및 AI 이미지 기능을 제공하기 위해 처리될 수 있습니다.",
      "이용자는 타인의 개인정보·초상·저작물이 포함된 자료를 업로드할 때 적법한 권한을 확보해야 합니다.",
      "blogmate는 이용자가 입력한 콘텐츠를 서비스 목적 외의 광고나 제3자 제공 목적으로 사용하지 않습니다. 다만 법령상 의무 또는 별도 동의가 있는 경우는 예외입니다.",
    ],
  },
  {
    title: "4. AI 및 외부 서비스 처리",
    intro: "초안 생성, 톤 분석, SEO 보조 및 이미지 기능을 제공하는 과정에서 입력 내용의 일부가 외부 기술 제공자에게 전송될 수 있습니다.",
    points: [
      "DeepSeek: 입력된 브랜드 정보와 콘텐츠 일부를 텍스트 초안·톤 분석 처리에 사용할 수 있습니다.",
      "Manus 호스팅·저장소: 서비스 운영, 인증 세션, 데이터베이스 및 이미지 저장을 위해 사용될 수 있습니다.",
      "카카오: 간편 로그인과 계정 인증을 위해 사용됩니다.",
      "결제선생: 이용자가 청구서 신청 시 제공한 이름·사업자명·연락처를 청구서 발송과 수납 확인에 사용할 수 있습니다.",
      "외부 제공자의 실제 명칭, 처리 국가, 보유 기간, 재위탁 및 국외 이전 여부는 계약과 운영 설정 확정 후 최종 공개본에 반영합니다.",
    ],
  },
  {
    title: "5. 보유 및 이용 기간",
    intro: "개인정보는 목적 달성 또는 회원 탈퇴 후 지체 없이 파기하는 것을 원칙으로 하며, 법령·분쟁·보안상 필요한 정보는 필요한 기간 동안 분리 보관할 수 있습니다.",
    points: [
      "계정 및 브랜드 정보: 회원 탈퇴 또는 서비스 이용계약 종료 시까지. 탈퇴 후 지체 없이 파기합니다.",
      "생성 초안·톤 프로필·SEO 결과: 이용자가 삭제하거나 계정이 종료될 때까지. 백업·분쟁 대응에 필요한 경우 별도 보관할 수 있습니다.",
      "청구서 신청·수납·구독 승인 기록: 거래·회계·분쟁 대응에 필요한 기간 동안 보관한 뒤 파기합니다.",
      "접속 로그 및 보안 기록: 보안과 오류 대응에 필요한 기간 동안 보관한 뒤 파기합니다.",
      "정확한 기간은 운영자 정보, 외부 서비스 계약 및 적용 법령을 확정한 후 최종 방침에서 구체적으로 고지합니다.",
    ],
  },
  {
    title: "6. 제3자 제공 및 처리 위탁",
    intro: "blogmate는 원칙적으로 이용자의 개인정보를 제3자에게 판매하거나 제공하지 않습니다. 서비스 제공에 필요한 위탁이 발생하면 수탁자와 위탁 업무를 공개하고 관련 법령에 따라 관리합니다.",
    points: [
      "법령에 근거하거나 수사·감독기관의 적법한 요청이 있는 경우",
      "이용자가 사전에 동의한 경우",
      "카카오 로그인, Manus 인프라, DeepSeek 처리, 결제선생 청구서 처리 등 서비스 운영에 필요한 경우",
      "수탁자·처리 국가·위탁 업무·보유 기간은 실제 계약과 리전 설정이 확정되는 즉시 별도 목록으로 업데이트합니다.",
    ],
  },
  {
    title: "7. 국외 이전",
    intro: "외부 클라우드 또는 AI 제공자의 서버 위치에 따라 개인정보와 콘텐츠가 국외에서 저장·처리될 수 있습니다.",
    points: [
      "이전 항목: 계정 식별자, 접속 기록, 브랜드·콘텐츠 데이터 중 기능 제공에 필요한 범위",
      "이전 목적: 인증, 호스팅, 저장, AI 기반 분석 및 초안 생성",
      "이전받는 자·국가·시점·방법·보유 기간: 실제 계약과 서비스 설정 확정 후 최종 공개본에 기재",
      "국외 이전에 동의하지 않을 경우 일부 AI·저장·로그인 기능 이용이 제한될 수 있습니다.",
    ],
  },
  {
    title: "8. 이용자의 권리와 행사 방법",
    intro: "이용자는 관계 법령에 따라 자신의 개인정보에 대한 권리를 행사할 수 있습니다.",
    points: [
      "개인정보 열람, 정정, 삭제 및 처리정지 요청",
      "카카오 로그인 연결 해제 또는 회원 탈퇴 요청",
      "청구서 신청 정보의 정정 요청",
      "권리 행사는 서비스 내 문의 채널 또는 개인정보 보호 문의처를 통해 요청할 수 있으며, 본인 확인 후 처리합니다.",
    ],
  },
  {
    title: "9. 파기 절차 및 방법",
    intro: "보유 기간이 지나거나 처리 목적이 달성된 개인정보는 내부 확인 후 지체 없이 파기합니다.",
    points: [
      "전자 파일과 데이터베이스 기록: 복구가 어려운 방법으로 삭제",
      "출력물: 분쇄 또는 소각",
      "법령·분쟁·보안 목적으로 분리 보관하는 정보는 해당 기간 종료 후 파기",
    ],
  },
  {
    title: "10. 안전성 확보조치",
    intro: "blogmate는 접근 권한 관리, 인증 세션 보호, 전송 구간 암호화, 오류·접속 기록 관리 등 합리적인 보안 조치를 적용합니다.",
    points: [
      "개인정보 접근 권한 최소화 및 관리자 권한 분리",
      "HTTPS 전송과 서버 환경변수 기반 비밀정보 관리",
      "인증·결제·관리자 승인 기능에 대한 권한 확인",
      "보안 사고 또는 개인정보 침해가 확인되면 관계 법령에 따라 안내하고 조치",
    ],
  },
  {
    title: "11. 쿠키 및 온라인 식별자",
    intro: "로그인 상태 유지와 서비스 보안을 위해 세션 쿠키 또는 유사 기술을 사용할 수 있습니다.",
    points: [
      "필수 쿠키를 차단하면 로그인과 일부 서비스 이용이 제한될 수 있습니다.",
      "브라우저 설정으로 쿠키 저장을 제한할 수 있으며, 서비스 이용 기록과 오류 분석을 위해 최소한의 로그가 생성될 수 있습니다.",
    ],
  },
  {
    title: "12. 개인정보 보호 문의 및 방침 변경",
    intro: "운영자명, 사업자등록번호, 주소, 개인정보 보호책임자, 문의 이메일과 전화번호는 실제 사업자 정보 확정 후 이 페이지에 공개합니다.",
    points: [
      "현재 문의처: 운영자 정보 확정 전으로, 서비스 내 문의 채널을 통해 접수",
      "시행일: 2026년 8월 27일(운영 공개 전 초안)",
      "개인정보 처리방침을 추가·삭제·수정하는 경우 서비스 내 공지 등 합리적인 방법으로 안내합니다.",
      "개인정보 침해 신고·상담: 개인정보침해신고센터 118, 개인정보 분쟁조정위원회 1833-6972",
    ],
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#fbfaf8] text-[#18202b]">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6 lg:px-10">
        <a href="/landing" aria-label="blogmate 랜딩페이지로 이동" className="flex items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e86550] focus-visible:ring-offset-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#18202b] text-sm font-black text-white">b.</span><span className="text-sm font-extrabold tracking-[-.03em]">blogmate</span></a>
        <a href="/landing" className="rounded-sm text-xs font-bold text-[#727c83] underline-offset-4 hover:text-[#e86550] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e86550] focus-visible:ring-offset-2">랜딩페이지로 돌아가기</a>
      </header>
      <main className="mx-auto max-w-4xl px-6 pb-20 pt-10 lg:px-10 lg:pt-16">
        <div className="max-w-2xl"><p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-[#e86550]">Privacy & data</p><h1 className="mt-4 font-display text-4xl leading-tight tracking-[-.06em] sm:text-5xl">개인정보 처리방침</h1><p className="mt-6 text-sm leading-7 text-[#727c83]">blogmate는 소상공인을 위한 네이버 블로그 초안 생성 서비스입니다. 회원의 계정, 브랜드 자료, 콘텐츠와 청구서 신청 정보를 어떤 목적으로 처리하는지 아래에 별도 항목으로 안내합니다.</p></div>
        <div className="mt-10 rounded-2xl border border-[#f0d5cd] bg-[#fff8f6] p-5 text-xs leading-6 text-[#6f5550]"><strong className="text-[#18202b]">공개 전 확인 안내</strong><br/>이 페이지는 현재 MVP 기능을 기준으로 작성한 운영 초안입니다. 실제 공개 전 운영자·사업자 정보, 문의처, 구체적인 보관 기간, 외부 처리·위탁 사업자, 국외 이전 국가와 법률상 고지 사항을 실제 계약 및 운영 설정에 맞춰 확정해야 합니다.</div>
        <div className="mt-8 divide-y divide-[#eee8e2] rounded-2xl border border-[#e7e2dc] bg-white px-6 sm:px-8">{sections.map(section => <section key={section.title} className="py-7"><h2 className="text-sm font-extrabold">{section.title}</h2><p className="mt-3 text-xs leading-7 text-[#727c83]">{section.intro}</p><ul className="mt-4 list-disc space-y-2 pl-5 text-xs leading-6 text-[#727c83]">{section.points.map(point => <li key={point}>{point}</li>)}</ul></section>)}</div>
      </main>
      <footer className="mx-auto max-w-4xl border-t border-[#eee8e2] px-6 py-8 text-[10px] text-[#a2a8ac] lg:px-10">© 2026 blogmate · 개인정보 처리방침 초안 · 실제 공개 전 운영자 정보 확정 필요</footer>
    </div>
  );
}
