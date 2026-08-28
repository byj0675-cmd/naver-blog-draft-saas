import fs from "node:fs";

const path = "/home/ubuntu/naver-blog-draft-saas/client/src/pages/Home.tsx";
const source = fs.readFileSync(path, "utf8");
const start = source.indexOf("function BrandCreateDialog");
const end = source.indexOf("export default function Home", start);
if (start < 0 || end < 0) throw new Error("BrandCreateDialog boundaries not found");

const replacement = String.raw`function BrandCreateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const utils = trpc.useUtils();
  const createBrand = trpc.brands.create.useMutation({
    onSuccess: async () => { await utils.brands.list.invalidate(); toast.success("업체 정보가 저장됐어요."); onClose(); },
    onError: error => toast.error(error.message || "업체 정보 저장에 실패했습니다."),
  });
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", industry: "", services: "", audience: "", strengths: "", brief: { ...emptyBrandBrief } as BrandBrief });
  const steps = ["기본 정보", "서비스", "전문성", "글쓰기 기준", "확인"];
  const update = (key: "name" | "industry" | "services" | "audience" | "strengths", value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const updateBrief = (key: keyof BrandBrief, value: string) => setForm(prev => ({ ...prev, brief: { ...prev.brief, [key]: value } }));
  const close = () => { if (!createBrand.isPending) { setStep(0); onClose(); } };
  const next = () => {
    if (step === 0 && (!form.name.trim() || !form.industry.trim())) { toast.error("상호명과 업종을 입력해 주세요."); return; }
    setStep(prev => Math.min(4, prev + 1));
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.industry.trim()) { setStep(0); toast.error("상호명과 업종을 입력해 주세요."); return; }
    createBrand.mutate({ ...form, brief: form.brief });
  };
  if (!open) return null;
  const inputClass = "w-full rounded-xl border border-[#e6e1da] bg-white px-3.5 py-3 text-sm text-[#18202b] outline-none transition placeholder:text-[#adb1b3] focus:border-[#e86550] focus:ring-4 focus:ring-[#e86550]/10";
  const labelClass = "mb-1.5 block text-xs font-extrabold text-[#4f5962]";
  const textareaClass = inputClass + " min-h-[108px] resize-y leading-6";
  const field = (key: keyof BrandBrief, label: string, placeholder: string, long = false) => <div><label htmlFor={"onboarding-" + key} className={labelClass}>{label}</label>{long ? <textarea id={"onboarding-" + key} value={form.brief[key]} onChange={event => updateBrief(key, event.target.value)} placeholder={placeholder} className={textareaClass}/> : <input id={"onboarding-" + key} value={form.brief[key]} onChange={event => updateBrief(key, event.target.value)} placeholder={placeholder} className={inputClass}/>}</div>;
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#18202b]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
    <div className="flex max-h-[95vh] w-full max-w-[760px] flex-col overflow-hidden rounded-t-[24px] bg-[#fbfaf8] shadow-[0_24px_80px_rgba(24,32,43,.24)] sm:max-h-[90vh] sm:rounded-[24px]">
      <div className="border-b border-[#e9e5df] bg-white px-5 pb-4 pt-5 sm:px-8 sm:pt-7"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#e86550]">업체 등록 · {step + 1}/5</p><h2 id="onboarding-title" className="mt-2 text-xl font-black tracking-[-.04em] text-[#18202b]">우리 업체를 먼저 알려주세요.</h2><p className="mt-1.5 text-xs leading-5 text-[#7b838b]">매번 프롬프트를 쓰지 않아도 업체에 맞는 초안을 만들 수 있어요.</p></div><button type="button" onClick={close} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f4f1ec] text-[#69737b] transition hover:bg-[#ece7e0]" aria-label="업체 등록 닫기"><X size={17}/></button></div><div className="mt-5 grid grid-cols-5 gap-1.5" aria-label="업체 등록 진행 단계">{steps.map((item, index) => <button type="button" key={item} onClick={() => index < step && setStep(index)} className="group text-left" aria-current={index === step ? "step" : undefined}><div className={"h-1.5 rounded-full transition " + (index <= step ? "bg-[#e86550]" : "bg-[#e9e5df]")}/><span className={"mt-1.5 block truncate text-[10px] font-bold " + (index === step ? "text-[#e86550]" : "text-[#a0a5a7]")}>{item}</span></button>)}</div></div>
      <form onSubmit={submit} className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">
        {step === 0 && <section className="space-y-5"><div><h3 className="text-lg font-black tracking-[-.03em] text-[#18202b]">고객이 검색할 때 보이는 정보</h3><p className="mt-1.5 text-xs leading-5 text-[#7b838b]">상호명과 업종만 먼저 입력해도 시작할 수 있습니다. 나머지는 나중에 보완할 수 있어요.</p></div><div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="onboarding-name" className={labelClass}>상호명 <span className="text-[#e86550]">*</span></label><input id="onboarding-name" autoFocus value={form.name} onChange={event => update("name", event.target.value)} placeholder="예: 바른움직임 필라테스" className={inputClass}/></div><div><label htmlFor="onboarding-industry" className={labelClass}>업종 <span className="text-[#e86550]">*</span></label><input id="onboarding-industry" value={form.industry} onChange={event => update("industry", event.target.value)} placeholder="예: 필라테스 스튜디오" className={inputClass}/></div><div>{field("location", "주요 지역", "예: 서울 마포구 합정동")}</div><div>{field("address", "주소", "예: 도로명 주소")}</div><div>{field("phone", "연락처", "예: 02-000-0000")}</div><div>{field("businessHours", "영업시간", "예: 평일 07:00~22:00")}</div><div className="sm:col-span-2">{field("website", "홈페이지 또는 예약 링크", "https://...")}</div></div></section>}
        {step === 1 && <section className="space-y-5"><div><h3 className="text-lg font-black tracking-[-.03em] text-[#18202b]">어떤 서비스를 제공하나요?</h3><p className="mt-1.5 text-xs leading-5 text-[#7b838b]">서비스와 가격을 구체적으로 적을수록 다른 업체의 정보가 섞이지 않아요.</p></div><div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><label htmlFor="onboarding-services" className={labelClass}>주요 상품·서비스</label><textarea id="onboarding-services" value={form.services} onChange={event => update("services", event.target.value)} placeholder="예: 개인레슨, 그룹레슨, 체형교정 수업" className={textareaClass}/></div><div>{field("priceInfo", "가격 또는 견적 기준", "예: 개인레슨 1회 60,000원 / 현장 확인 후 견적")}</div><div>{field("uniquePoints", "고객이 선택하는 이유", "예: 원장 직접 상담, 소규모 수업", true)}</div><div><label htmlFor="onboarding-audience" className={labelClass}>주요 고객</label><input id="onboarding-audience" value={form.audience} onChange={event => update("audience", event.target.value)} placeholder="예: 운동 초보자, 직장인" className={inputClass}/></div><div><label htmlFor="onboarding-strengths" className={labelClass}>대표 강점</label><input id="onboarding-strengths" value={form.strengths} onChange={event => update("strengths", event.target.value)} placeholder="예: 예약 전 상담이 꼼꼼해요" className={inputClass}/></div></div></section>}
        {step === 2 && <section className="space-y-5"><div><h3 className="text-lg font-black tracking-[-.03em] text-[#18202b]">사장님이 가장 잘 아는 내용</h3><p className="mt-1.5 text-xs leading-5 text-[#7b838b]">전문가만 알고 있는 과정과 상담 노하우가 ‘내 업체다운 글’을 만듭니다.</p></div><div className="space-y-4">{field("brandStory", "업체를 시작한 이유 또는 브랜드 이야기", "예: 허리 통증으로 고생한 경험을 계기로, 초보자도 안전하게 운동하는 공간을 만들었습니다.", true)}{field("factsToUse", "글에 꼭 넣고 싶은 실제 사실", "예: 강사 자격, 수업 인원, 사용하는 장비, 실제 운영 방식 등을 적어주세요.", true)}{field("customerQuestions", "고객이 자주 묻는 질문과 답변", "예: 운동을 처음 해도 되나요? 네, 첫 상담 후 현재 상태에 맞춰 진행합니다.", true)}</div></section>}
        {step === 3 && <section className="space-y-5"><div><h3 className="text-lg font-black tracking-[-.03em] text-[#18202b]">글쓰기 기준을 정해볼까요?</h3><p className="mt-1.5 text-xs leading-5 text-[#7b838b]">여기에 저장한 기준을 바탕으로 매번 프롬프트를 작성하지 않아도 됩니다.</p></div><div className="grid gap-4 sm:grid-cols-2">{field("primaryKeywords", "핵심 키워드", "예: 합정동 필라테스, 마포구 체형교정")}{field("secondaryKeywords", "보조 키워드", "예: 필라테스 초보, 직장인 운동")}{field("toneNotes", "원하는 말투", "예: 차분한 존댓말, 과장 없이 상담하듯", true)}{field("forbiddenClaims", "사용하지 않을 표현", "예: 완치, 100% 효과, 무조건 최저가", true)}{field("callToAction", "글 마지막에 안내할 행동", "예: 상담 예약, 전화 문의, 프로필 링크 확인", true)}</div></section>}
        {step === 4 && <section className="space-y-5"><div><h3 className="text-lg font-black tracking-[-.03em] text-[#18202b]">입력한 내용을 확인해 주세요.</h3><p className="mt-1.5 text-xs leading-5 text-[#7b838b]">저장한 정보는 이후 초안 생성의 기준으로 사용됩니다. 등록 후에도 수정할 수 있어요.</p></div><div className="grid gap-3 sm:grid-cols-2">{[["업체", form.name], ["업종", form.industry], ["지역", form.brief.location], ["주요 서비스", form.services], ["핵심 키워드", form.brief.primaryKeywords], ["전문성 메모", form.brief.factsToUse]].map(([label, value]) => <div key={label} className="rounded-xl border border-[#e8e3dc] bg-white p-4"><p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#a0a5a7]">{label}</p><p className="mt-2 text-sm font-bold leading-5 text-[#18202b]">{value || "아직 입력하지 않음"}</p></div>)}</div><div className="rounded-xl bg-[#fff0ec] p-4 text-xs leading-5 text-[#7b5148]"><strong>다음 단계:</strong> 업체 정보를 저장한 뒤 ‘새 초안 만들기’에서 주제와 키워드만 선택하면 됩니다.</div></section>}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#e9e5df] pt-5"><button type="button" onClick={step === 0 ? close : () => setStep(prev => prev - 1)} className="rounded-xl border border-[#e2ddd6] bg-white px-4 py-3 text-xs font-extrabold text-[#68727a]">{step === 0 ? "나중에 하기" : "이전"}</button>{step < 4 ? <button type="button" onClick={next} className="rounded-xl bg-[#18202b] px-5 py-3 text-xs font-extrabold text-white shadow-[0_6px_14px_rgba(24,32,43,.14)] transition hover:bg-[#2d3845]">저장 후 계속</button> : <button type="submit" disabled={createBrand.isPending} className="rounded-xl bg-[#e86550] px-5 py-3 text-xs font-extrabold text-white shadow-[0_6px_14px_rgba(232,101,80,.18)] transition hover:bg-[#d95744]">{createBrand.isPending ? "저장하는 중..." : "업체 정보 저장하기"}</button>}</div>
      </form>
    </div>
  </div>;
}
`;

fs.writeFileSync(path, source.slice(0, start) + replacement + source.slice(end));
console.log("replaced BrandCreateDialog with mobile onboarding wizard");
