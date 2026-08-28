import fs from "node:fs";

const path = "/home/ubuntu/naver-blog-draft-saas/client/src/pages/Home.tsx";
const source = fs.readFileSync(path, "utf8");
const start = source.indexOf("function BrandCreateDialog");
const end = source.indexOf("export default function Home");
if (start < 0 || end < 0 || end <= start) throw new Error("BrandCreateDialog boundaries not found");

const replacement = String.raw`function BrandCreateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", industry: "", services: "", audience: "", strengths: "", brief: { ...emptyBrandBrief } as BrandBrief });
  const createBrand = trpc.brands.create.useMutation({
    onSuccess: () => { toast.success("브랜드를 등록했어요."); setForm({ name: "", industry: "", services: "", audience: "", strengths: "", brief: { ...emptyBrandBrief } }); onClose(); },
    onError: error => toast.error(error.message || "브랜드 등록에 실패했습니다."),
  });
  if (!open) return null;
  const close = () => { setForm({ name: "", industry: "", services: "", audience: "", strengths: "", brief: { ...emptyBrandBrief } }); onClose(); };
  const updateBrief = (key: keyof BrandBrief, value: string) => setForm(prev => ({ ...prev, brief: { ...prev.brief, [key]: value } }));
  const briefFields: Array<[keyof BrandBrief, string, string]> = [
    ["location", "영업 지역·주소", "예: 서울 성동구 성수동2가, 성수역 도보 7분"],
    ["phone", "예약·문의 연락처", "예: 02-1234-5678 / 카카오톡 채널명"],
    ["website", "홈페이지·예약 링크", "선택 입력"],
    ["businessHours", "영업시간·휴무일", "예: 화–일 11:00–20:00, 월요일 휴무"],
    ["priceInfo", "가격·상품 정보", "예: 1인 55,000원, 재방문 할인, 포함 사항"],
    ["uniquePoints", "차별점·강점", "다른 매장과 비교해 고객이 선택하는 이유"],
    ["brandStory", "브랜드 이야기", "창업 배경, 운영 철학, 공간의 분위기"],
    ["primaryKeywords", "핵심 키워드", "쉼표로 구분: 성수동 도자기, 서울 원데이클래스"],
    ["secondaryKeywords", "보조 키워드·연관어", "쉼표로 구분: 성수동 데이트, 이색 체험"],
    ["customerQuestions", "고객이 자주 묻는 질문", "예: 초보자 가능 여부, 소요 시간, 주차"],
    ["factsToUse", "반드시 반영할 사실", "인증, 수상, 운영 수치 등 확인된 사실만 입력"],
    ["forbiddenClaims", "사용하면 안 되는 표현", "과장·근거 없는 최상급 표현, 금지 단어"],
    ["toneNotes", "말투·표현 기준", "예: 차분한 존댓말, 지나친 광고 문구는 피하기"],
    ["callToAction", "마무리 안내", "예: 네이버 예약 링크와 문의 방법 안내"],
  ];
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#18202b]/35 p-4" role="dialog" aria-modal="true" aria-labelledby="brand-dialog-title">
    <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#e7e4de] bg-[#fffdfa] p-6 shadow-2xl">
      <div className="flex items-start justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#e86550]">브랜드 등록</p><h2 id="brand-dialog-title" className="mt-2 text-xl font-extrabold tracking-[-.04em]">우리 매장의 글쓰기 기준을 등록하세요</h2><p className="mt-2 max-w-xl text-xs leading-5 text-[#858d94]">구체적으로 입력할수록 AI가 임의로 사실을 만들지 않고, 매장에 맞는 초안을 작성합니다. 모르는 항목은 비워도 됩니다.</p></div><button type="button" onClick={close} aria-label="브랜드 등록 닫기" className="rounded-lg p-2 text-[#858d94] hover:bg-[#efeee9]"><X size={18}/></button></div>
      <form onSubmit={event => { event.preventDefault(); createBrand.mutate({ ...form, briefJson: form.brief }); }} className="mt-6 space-y-5">
        <section><h3 className="mb-3 text-sm font-extrabold text-[#18202b]">기본 정보</h3><div className="grid gap-3 sm:grid-cols-2"><div className="sm:col-span-2"><label htmlFor="brand-name" className="mb-1.5 block text-[11px] font-bold text-[#606a73]">브랜드명 <span className="text-[#e86550]">*</span></label><input id="brand-name" required value={form.name} onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))} placeholder="예: 오늘의공방" className="w-full rounded-lg border border-[#e7e4de] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#e86550] focus:ring-2 focus:ring-[#e86550]/10"/></div><div><label htmlFor="brand-industry" className="mb-1.5 block text-[11px] font-bold text-[#606a73]">업종</label><input id="brand-industry" value={form.industry} onChange={event => setForm(prev => ({ ...prev, industry: event.target.value }))} placeholder="예: 도자기 공방" className="w-full rounded-lg border border-[#e7e4de] px-3 py-2.5 text-xs outline-none focus:border-[#e86550]"/></div><div><label htmlFor="brand-services" className="mb-1.5 block text-[11px] font-bold text-[#606a73]">주요 상품·서비스</label><input id="brand-services" value={form.services} onChange={event => setForm(prev => ({ ...prev, services: event.target.value }))} placeholder="예: 원데이클래스, 단체 체험" className="w-full rounded-lg border border-[#e7e4de] px-3 py-2.5 text-xs outline-none focus:border-[#e86550]"/></div><div><label htmlFor="brand-audience" className="mb-1.5 block text-[11px] font-bold text-[#606a73]">주요 고객</label><input id="brand-audience" value={form.audience} onChange={event => setForm(prev => ({ ...prev, audience: event.target.value }))} placeholder="예: 성수동 데이트 고객, 초보자" className="w-full rounded-lg border border-[#e7e4de] px-3 py-2.5 text-xs outline-none focus:border-[#e86550]"/></div><div><label htmlFor="brand-strengths" className="mb-1.5 block text-[11px] font-bold text-[#606a73]">한 줄 강점</label><input id="brand-strengths" value={form.strengths} onChange={event => setForm(prev => ({ ...prev, strengths: event.target.value }))} placeholder="예: 초보자도 편안한 소규모 수업" className="w-full rounded-lg border border-[#e7e4de] px-3 py-2.5 text-xs outline-none focus:border-[#e86550]"/></div></div></section>
        <section><div className="mb-3"><h3 className="text-sm font-extrabold text-[#18202b]">상세 사업 브리프</h3><p className="mt-1 text-[11px] leading-5 text-[#858d94]">가격, 지역, 키워드, 금지 표현은 초안의 사실성과 검색 의도를 결정하는 핵심 자료입니다.</p></div><div className="grid gap-3 sm:grid-cols-2">{briefFields.map(([key, label, placeholder]) => <div key={key} className={key === "uniquePoints" || key === "brandStory" || key === "customerQuestions" || key === "factsToUse" || key === "forbiddenClaims" || key === "toneNotes" ? "sm:col-span-2" : ""}><label htmlFor={"brief-" + key} className="mb-1.5 block text-[11px] font-bold text-[#606a73]">{label}</label>{["uniquePoints", "brandStory", "customerQuestions", "factsToUse", "forbiddenClaims", "toneNotes"].includes(key) ? <textarea id={"brief-" + key} value={form.brief[key]} onChange={event => updateBrief(key, event.target.value)} placeholder={placeholder} rows={3} className="w-full resize-y rounded-lg border border-[#e7e4de] bg-white px-3 py-2.5 text-xs leading-5 outline-none focus:border-[#e86550]"/> : <input id={"brief-" + key} value={form.brief[key]} onChange={event => updateBrief(key, event.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-[#e7e4de] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#e86550]"/>}</div>)}</div></section>
        <div className="flex justify-end gap-2 border-t border-[#eeeae5] pt-5"><button type="button" onClick={close} className="rounded-lg border border-[#e7e4de] px-4 py-2.5 text-xs font-bold text-[#606a73]">취소</button><Button type="submit" disabled={createBrand.isPending} className="rounded-lg bg-[#18202b] px-5 py-2.5 text-xs font-bold">{createBrand.isPending ? "등록하는 중..." : "브랜드 등록"}</Button></div>
      </form>
    </div>
  </div>;
}

`;

fs.writeFileSync(path, source.slice(0, start) + replacement + source.slice(end));
console.log("BrandCreateDialog replaced");
