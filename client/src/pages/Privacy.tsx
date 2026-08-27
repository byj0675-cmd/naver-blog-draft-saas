const sections = [
  {
    title: "1. 수집하는 개인정보",
    body: "blogmate는 서비스 제공에 필요한 최소한의 정보를 수집합니다. 카카오 로그인 시 카카오 계정 식별자와 카카오가 제공하는 기본 프로필 정보가 수집될 수 있습니다. 청구서 신청 시 이름 또는 입금자명, 사업자명, 연락처를 수집합니다. 사용자가 등록하는 브랜드 정보, 기존 글·URL, 키워드, 생성 초안 및 이용량 정보도 서비스 제공을 위해 저장될 수 있습니다.",
  },
  {
    title: "2. 개인정보의 이용 목적",
    body: "수집한 정보는 회원 식별과 로그인 유지, 브랜드별 톤 프로필 및 초안 생성, SEO 점검, 사용량 한도 관리, 청구서 발송 및 수납 확인, 관리자 승인 처리, 고객 문의 대응과 서비스 보안에 이용합니다. AI 기능을 제공할 때 사용자가 입력한 브랜드·콘텐츠 정보가 초안 생성과 톤 분석에 사용될 수 있습니다.",
  },
  {
    title: "3. AI·외부 서비스 처리",
    body: "초안 생성과 톤 분석을 위해 입력 콘텐츠의 일부가 설정된 AI 처리 제공자(DeepSeek)로 전송될 수 있습니다. 카카오 로그인은 카카오의 인증 서비스를 사용하며, 청구서 신청 정보는 운영자의 결제선생 청구서 발송 및 수납 확인 절차에 사용됩니다. 각 외부 서비스의 개인정보 처리방침과 국외 이전·위탁 조건은 실제 계약 및 운영 설정 확정 후 최종 공개본에 반영해야 합니다.",
  },
  {
    title: "4. 보관 및 파기",
    body: "개인정보는 수집 목적이 달성되거나 회원이 삭제를 요청한 경우 지체 없이 파기하는 것을 원칙으로 합니다. 다만 관계 법령, 거래 기록 보존 의무, 분쟁 대응 또는 보안 목적상 필요한 정보는 해당 기간 동안 별도로 보관한 뒤 파기합니다. 실제 보관 기간은 운영 정책과 법령 검토 후 확정합니다.",
  },
  {
    title: "5. 이용자의 권리",
    body: "이용자는 자신의 개인정보에 대한 열람, 정정, 삭제 및 처리정지를 요청할 수 있습니다. 서비스 내 문의 채널 또는 개인정보 보호 문의 채널을 통해 요청해 주세요. 요청을 받은 운영자는 본인 확인 후 관련 법령과 서비스 운영 범위에 따라 처리합니다.",
  },
  {
    title: "6. 개인정보 보호 문의",
    body: "개인정보 보호 관련 문의는 blogmate 운영팀으로 보내 주세요. 실제 서비스 공개 전 운영자명, 사업자 정보, 문의 이메일, 개인정보 보호책임자 및 외부 처리·위탁 현황을 운영 주체의 확정 정보로 교체해야 합니다.",
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#fbfaf8] text-[#18202b]">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6 lg:px-10">
        <a href="/landing" className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#18202b] text-sm font-black text-white">b.</span><span className="text-sm font-extrabold tracking-[-.03em]">blogmate</span></a>
        <a href="/landing" className="rounded-sm text-xs font-bold text-[#727c83] underline-offset-4 hover:text-[#e86550] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e86550] focus-visible:ring-offset-2">랜딩페이지로 돌아가기</a>
      </header>
      <main className="mx-auto max-w-4xl px-6 pb-20 pt-10 lg:px-10 lg:pt-16">
        <div className="max-w-2xl"><p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-[#e86550]">Privacy & data</p><h1 className="mt-4 font-display text-4xl leading-tight tracking-[-.06em] sm:text-5xl">개인정보 처리방침</h1><p className="mt-6 text-sm leading-7 text-[#727c83]">blogmate는 네이버 블로그 초안 생성 서비스를 운영하며, 서비스 제공에 필요한 개인정보를 투명하게 처리하기 위해 아래와 같이 안내합니다.</p></div>
        <div className="mt-10 rounded-2xl border border-[#f0d5cd] bg-[#fff8f6] p-5 text-xs leading-6 text-[#6f5550]"><strong className="text-[#18202b]">공개 전 확인 안내</strong><br/>이 페이지는 현재 MVP 기능 기준의 운영 초안입니다. 실제 공개 전 운영자·사업자 정보, 문의처, 보관 기간, 외부 처리·위탁 및 국외 이전 조건을 실제 계약과 법령 검토 결과에 맞춰 확정해야 합니다.</div>
        <div className="mt-8 divide-y divide-[#eee8e2] rounded-2xl border border-[#e7e2dc] bg-white px-6 sm:px-8">{sections.map(section => <section key={section.title} className="py-7"><h2 className="text-sm font-extrabold">{section.title}</h2><p className="mt-3 text-xs leading-7 text-[#727c83]">{section.body}</p></section>)}</div>
      </main>
      <footer className="mx-auto max-w-4xl border-t border-[#eee8e2] px-6 py-8 text-[10px] text-[#a2a8ac] lg:px-10">© 2026 blogmate · 개인정보 처리방침 초안</footer>
    </div>
  );
}
