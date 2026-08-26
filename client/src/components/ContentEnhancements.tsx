import { useMemo, useState } from "react";
import { Bookmark, Check, Clipboard, ExternalLink, Link2, Loader2, Smartphone, Trash2, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type Template = { id: number; name: string; keywords: string; hashtags: string };
const initialTemplates: Template[] = [
  { id: 1, name: "성수동 주말 방문형", keywords: "성수동 데이트, 성수동 원데이클래스", hashtags: "#성수동데이트 #원데이클래스 #서울데이트" },
  { id: 2, name: "지역 서비스 신뢰형", keywords: "지역명 + 서비스, 비용, 후기", hashtags: "#지역서비스 #믿을수있는업체 #상담예약" },
];

export default function ContentEnhancements() {
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [preview, setPreview] = useState(false);
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [selected, setSelected] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [newHashtags, setNewHashtags] = useState("");
  const analyzeUrlMutation = trpc.content.analyzeUrl.useMutation();
  const analyzeToneMutation = trpc.content.analyzeTone.useMutation();
  const [draft, setDraft] = useState({ title: "성수동 도자기 원데이클래스, 처음이어도 괜찮은 하루", intro: "처음 흙을 만지는 날은 생각보다 오래 기억에 남습니다.", body: "성수동 골목 안 작은 공방에서 바쁜 일상 속 잠깐의 쉼표가 되어줄 클래스를 소개할게요.", ending: "이번 주말, 손끝으로 만든 작은 그릇과 함께 쉬어가 보는 건 어떨까요?" });
  const activeTemplate = useMemo(() => templates.find(t => t.id === selected), [templates, selected]);
  const analyze = async () => {
    try { new URL(url); } catch { toast.error("http:// 또는 https://로 시작하는 URL을 입력해 주세요."); return; }
    setAnalyzing(true);
    try {
      const result = await analyzeUrlMutation.mutateAsync({ url });
      await analyzeToneMutation.mutateAsync({ brandId: 1, samples: [result.text] });
      setAnalyzed(true);
      toast.success(`${result.characterCount.toLocaleString()}자 본문을 가져와 톤 프로필에 반영했어요.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "URL 분석에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally { setAnalyzing(false); }
  };
  const saveTemplate = () => { if (!newName.trim() || !newKeywords.trim()) { toast.error("템플릿 이름과 키워드를 입력해 주세요."); return; } setTemplates(prev => [...prev, { id: Date.now(), name: newName, keywords: newKeywords, hashtags: newHashtags }]); setNewName(""); setNewKeywords(""); setNewHashtags(""); toast.success("템플릿을 저장했어요."); };
  const applyTemplate = (template: Template) => { setSelected(template.id); toast.success(`${template.name} 템플릿을 불러왔어요.`); };
  return <div className="space-y-6">
    <div><p className="text-xs font-bold text-[#e86550]">CONTENT TOOLKIT</p><h2 className="mt-2 text-2xl font-extrabold tracking-[-.05em]">콘텐츠 도구함</h2><p className="mt-2 text-xs text-[#8a9197]">기존 글의 결을 학습하고, 발행 전 모습을 모바일에서 확인하세요.</p></div>
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="rounded-xl border border-[#e7e4de] bg-white p-6"><div className="mb-5 flex items-start justify-between"><div><div className="flex items-center gap-2"><Link2 size={16} className="text-[#e86550]"/><h3 className="text-sm font-extrabold">URL로 기존 글 분석</h3></div><p className="mt-2 text-[11px] leading-5 text-[#92999e]">네이버 블로그 글 URL을 붙여 넣으면 본문을 수집해 말투·문장 길이·구성을 브랜드 톤에 반영합니다.</p></div><Badge>{analyzed ? "분석 완료" : "자동 수집"}</Badge></div><div className="flex gap-2"><input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://blog.naver.com/..." className="min-w-0 flex-1 rounded-lg border border-[#e7e4de] px-3 py-2.5 text-xs outline-none focus:border-[#e86550]"/><Button onClick={analyze} disabled={analyzing} className="shrink-0 gap-1.5 rounded-lg bg-[#18202b] text-xs font-bold hover:bg-[#293541]">{analyzing ? <Loader2 size={14} className="animate-spin"/> : <WandSparkles size={14}/>} {analyzing ? "분석 중" : "분석하기"}</Button></div>{analyzed && <div className="mt-5 rounded-lg bg-[#fbfaf8] p-4"><div className="mb-3 flex items-center gap-2 text-xs font-bold"><Check size={14} className="text-[#287354]"/> 오늘의공방 톤 프로필에 반영됨</div><div className="flex flex-wrap gap-2"><Badge>차분한 존댓말</Badge><Badge>짧은 문장</Badge><Badge>경험 중심</Badge><Badge>질문형 마무리</Badge></div><p className="mt-3 text-[10px] leading-5 text-[#92999e]">수집된 본문은 톤 분석 후 원문 자체는 저장하지 않고, 분석된 스타일 지표만 보관합니다.</p></div>}</div>
      <div className="rounded-xl border border-[#e7e4de] bg-[#18202b] p-6 text-white"><div className="flex items-center gap-2 text-xs font-bold"><Smartphone size={15} className="text-[#f49c8b]"/> 모바일 프리뷰</div><h3 className="mt-4 font-display text-2xl leading-tight">발행 전에,<br/><em className="text-[#f49c8b]">손안에서 확인해요.</em></h3><p className="mt-3 text-[11px] leading-5 text-[#b9c0c5]">네이버 블로그 모바일 앱에서 읽히는 흐름을 미리 확인하고 제목·문단·해시태그를 다듬습니다.</p><Button onClick={() => setPreview(true)} className="mt-6 w-full gap-2 rounded-lg bg-[#f49c8b] text-xs font-bold text-[#18202b] hover:bg-[#ffc0b2]"><Smartphone size={14}/> 모바일 화면 열기</Button></div>
    </div>
    <div className="rounded-xl border border-[#e7e4de] bg-white p-6"><div className="mb-5 flex items-center justify-between"><div><div className="flex items-center gap-2"><Bookmark size={16} className="text-[#e86550]"/><h3 className="text-sm font-extrabold">키워드·해시태그 템플릿</h3></div><p className="mt-2 text-[11px] text-[#92999e]">자주 쓰는 조합을 저장해 생성 화면에서 원클릭으로 불러오세요.</p></div><Badge tone="orange">{templates.length}개 저장됨</Badge></div><div className="grid gap-3 md:grid-cols-2">{templates.map(template => <div key={template.id} className={`rounded-lg border p-4 transition ${activeTemplate?.id === template.id ? "border-[#e86550] bg-[#fff8f6]" : "border-[#eeeae5]"}`}><div className="flex items-start justify-between"><div><p className="text-xs font-bold">{template.name}</p><p className="mt-2 text-[10px] leading-5 text-[#727c84]"><strong>키워드</strong> · {template.keywords}<br/><strong>해시태그</strong> · {template.hashtags}</p></div><button onClick={() => { setTemplates(prev => prev.filter(t => t.id !== template.id)); if (selected === template.id) setSelected(null); }} className="text-[#b0b4b6] hover:text-[#e86550]"><Trash2 size={14}/></button></div><button onClick={() => applyTemplate(template)} className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-md py-2 text-[10px] font-bold ${activeTemplate?.id === template.id ? "bg-[#e86550] text-white" : "bg-[#f3f1ed] text-[#68727f]"}`}>{activeTemplate?.id === template.id ? <Check size={12}/> : <Clipboard size={12}/>} {activeTemplate?.id === template.id ? "적용됨" : "생성에 적용"}</button></div>)}</div><div className="mt-5 grid gap-2 border-t border-[#eeeae5] pt-5 md:grid-cols-[1fr_1.5fr_1.5fr_auto]"><input value={newName} onChange={e => setNewName(e.target.value)} placeholder="템플릿 이름" className="rounded-lg border border-[#e7e4de] px-3 py-2.5 text-xs outline-none focus:border-[#e86550]"/><input value={newKeywords} onChange={e => setNewKeywords(e.target.value)} placeholder="키워드 조합" className="rounded-lg border border-[#e7e4de] px-3 py-2.5 text-xs outline-none focus:border-[#e86550]"/><input value={newHashtags} onChange={e => setNewHashtags(e.target.value)} placeholder="#해시태그 조합" className="rounded-lg border border-[#e7e4de] px-3 py-2.5 text-xs outline-none focus:border-[#e86550]"/><Button onClick={saveTemplate} className="rounded-lg bg-[#18202b] px-4 text-xs font-bold">저장</Button></div></div>
    {preview && <div className="fixed inset-0 z-40 grid place-items-center bg-[#18202b]/45 p-4" onClick={() => setPreview(false)}><div className="flex max-h-[92vh] w-full max-w-[390px] flex-col overflow-hidden rounded-[30px] border-[7px] border-[#111923] bg-white shadow-2xl" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between bg-white px-5 py-4"><span className="text-xs font-extrabold">‹  블로그</span><span className="text-[10px] text-[#999]">⋯</span></div><div className="overflow-y-auto"><div className="border-y border-[#f0f0f0] px-5 py-4"><p className="text-[10px] text-[#888]">오늘의공방 · 3분 전</p><h4 className="mt-3 text-[20px] font-bold leading-7 tracking-[-.04em]">{draft.title}</h4><div className="mt-4 h-28 rounded-xl bg-gradient-to-br from-[#f4d4c8] via-[#eec2b3] to-[#9f6d5b]"/></div><div className="space-y-5 px-5 py-5 text-[14px] leading-7 text-[#3d454b]"><p>{draft.intro}</p><p>{draft.body}</p><p>{draft.ending}</p><div className="flex flex-wrap gap-1.5 text-[12px] text-[#4c7fbd]">{(activeTemplate?.hashtags || "#성수동도자기 #원데이클래스 #성수동데이트").split(" ").map(tag => <span key={tag}>{tag}</span>)}</div></div></div><button onClick={() => setPreview(false)} className="border-t border-[#eee] py-3 text-xs font-bold text-[#68717a]">닫기</button></div></div>}
  </div>;
}

function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "orange" }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${tone === "orange" ? "bg-[#fff0ec] text-[#c8513e]" : "bg-[#efeee9] text-[#68727e]"}`}>{children}</span>; }
