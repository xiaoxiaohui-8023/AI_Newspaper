import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Bell, CheckCircle2, ChevronDown } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/api';
import ReactMarkdown from 'react-markdown';

const hasPushConfigured = false;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as number[] },
});

const parseStructuredSummary = (summary: string) => {
  const result: Record<string, string> = {};
  if (!summary) return result;
  const lines = summary.split('\n').filter(l => l.trim());
  for (const line of lines) {
    const colonIndex = line.indexOf('：');
    if (colonIndex === -1) continue;
    const label = line.substring(0, colonIndex).trim().replace(/\*/g, '');
    const content = line.substring(colonIndex + 1).trim();
    if (content && content !== '暂无') {
      result[label] = content;
    }
  }
  return result;
};

const ArticleCard = ({ article, index, onClick }: { article: any; index: number; onClick: () => void }) => {
  const [expanded, setExpanded] = useState(false);
  const structured = parseStructuredSummary(article.summary);

  const sectionConfig = [
    { key: '一句话结论', label: '关键结论', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { key: '关键数据', label: '关键数据', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { key: '为什么重要', label: '重要原因', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
    { key: '反直觉', label: '反直觉', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  ];

  const channelLabel =
    article.channel_id === 'c1' ? { icon: '🔬', text: '模型动态', color: 'text-[#1456F0]' } :
    article.channel_id === 'c2' ? { icon: '💰', text: '投融资', color: 'text-amber-500' } :
    { icon: '🛠', text: '工具与产品', color: 'text-emerald-500' };

  return (
    <div className={`${index > 0 ? 'border-t border-slate-100 pt-3' : ''}`}>
      <div className="cursor-pointer" onClick={onClick}>
        <span className={`text-[11px] font-bold ${channelLabel.color}`}>
          {channelLabel.icon} {channelLabel.text}
        </span>
        <p className="text-[13px] font-semibold text-slate-800 mt-0.5 leading-snug">
          {article.title}
        </p>
        {structured['一句话结论'] && (
          <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
            {structured['一句话结论']}
          </p>
        )}
      </div>

      <button
        className="mt-2 text-[11px] text-[#1456F0] font-medium flex items-center gap-0.5"
        onClick={() => setExpanded(!expanded)}
      >
        重点解读
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3 h-3" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-xl border border-slate-100 overflow-hidden">
              {sectionConfig.map(({ key, label, color, bg, border }) =>
                structured[key] ? (
                  <div key={key} className={`px-3 py-2 border-b last:border-b-0 ${border} ${bg}`}>
                    <span className={`text-[10px] font-bold ${color} block mb-0.5`}>{label}</span>
                    <p className="text-[12px] text-slate-700 leading-relaxed">{structured[key]}</p>
                  </div>
                ) : null
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DigestPreview = () => {
  const [expanded, setExpanded] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getCards().then(data => {
      setCards(data);
    });
  }, []);

  const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '年').replace(/(\d+)$/, '$1日').replace(/(\d+)年/, '$1年');

  const visibleCards = expanded ? cards : cards.slice(0, 2);

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
      <div className="bg-[#1456F0] px-4 py-3 flex items-center justify-between">
        <span className="text-white text-sm font-semibold">📅 AI 日报 · {today}</span>
        <span className="text-white/70 text-xs">08:00 送达</span>
      </div>

      <div className="bg-white px-4 py-4 space-y-3">
        {cards.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">加载中...</p>
        ) : (
          <>
            {visibleCards.map((card, i) => (
              <ArticleCard
                key={card.id}
                article={card}
                index={i}
                onClick={() => {}}
              />
            ))}

            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center gap-1 pt-1 text-[12px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              {expanded ? '收起' : '查看更多条目'}
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.div>
            </button>

            <div className="border-t border-slate-100 pt-2">
              <p className="text-[11px] text-slate-400 text-center">
                共 {cards.length} 条动态 · 来自你关注的信息源
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const HomePage = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const seen = localStorage.getItem('hasSeenOnboarding');
    if (!seen) setShowOnboarding(true);
  }, []);

  useEffect(() => {
    api.getUser().then(user => {
      setIsSubscribed(user.isVip);
    });
  }, []);

  useEffect(() => {
    const el = document.querySelector('main');
    if (!el) return;
    const handleScroll = () => setShowSticky(el.scrollTop > 300);
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOnboardingComplete = (selectedChannels: string[]) => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
    if (selectedChannels.length > 0) {
      toast({ title: '设置成功', description: `已关注 ${selectedChannels.length} 个主题包` });
    }
  };

  return (
    <>
      <OnboardingModal isOpen={showOnboarding} onComplete={handleOnboardingComplete} />

      <AnimatePresence>
        {showSticky && !isSubscribed && (
          <motion.div
            className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <motion.button
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 shadow-2xl shadow-primary/40"
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/discover')}
            >
              立即订阅 · ¥19/月
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileLayout>
        <div className="pb-10">
          {isSubscribed && (
            <motion.div {...fadeUp(0)} className="mx-4 mt-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-800">今日日报已发送</p>
                <p className="text-xs text-emerald-600 mt-0.5">08:00 · 已推送至你的邮箱</p>
              </div>
            </motion.div>
          )}

          {isSubscribed && !hasPushConfigured && (
            <motion.div {...fadeUp(0.05)} className="mx-4 mt-3 p-4 rounded-xl bg-primary/8 border border-primary/20 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">还差一步</p>
                <p className="text-xs text-muted-foreground mt-0.5">设置推送后，日报每天自动送达</p>
              </div>
              <motion.button
                className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shrink-0"
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/settings/push')}
              >
                去设置
              </motion.button>
            </motion.div>
          )}

          <motion.div {...fadeUp(0.08)} className="px-4 pt-8">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">硅谷 AI 情报站</p>
            <h1 className="text-[30px] font-bold text-foreground leading-tight tracking-tight">
              每天早上，重要的<br />都已经在这里了
            </h1>
            <p className="text-[15px] text-muted-foreground mt-3 leading-relaxed">
              不用刷推特，不用追 Newsletter。<br />AI 替你读完，精华送到飞书或邮件。
            </p>

            <div className="flex items-center gap-3 mt-5">
              <div className="flex -space-x-2.5">
                {['👨‍💻', '👩‍🔬', '🧑‍💼', '👨‍🎨'].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-background flex items-center justify-center text-sm">
                    {e}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">2,400+</span> 人已订阅
              </p>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.18)} className="px-4 mt-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">这是你每天会收到的</p>
              <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">样例</span>
            </div>
            <DigestPreview />
          </motion.div>

          <motion.div {...fadeUp(0.28)} className="px-4 mt-10">
            <p className="text-sm font-semibold text-foreground mb-5">三步开始使用</p>
            <div className="space-y-5">
              {[
                { num: '01', icon: '🔍', title: '选择你关注的信息源', desc: '推荐主题包一键订阅，或自己添加 Twitter、RSS' },
                { num: '02', icon: '🤖', title: 'AI 每天自动提炼', desc: '去噪、归纳、提炼洞察，只保留真正有价值的' },
                { num: '03', icon: '📬', title: '日报准时送达', desc: '每天定时推送，2 分钟读完当天硅谷 AI 动态' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-primary/8 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xl leading-none">{item.icon}</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground/40 pt-1.5">{item.num}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {!isSubscribed && (
            <motion.div {...fadeUp(0.36)} className="px-4 mt-10">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/8 to-accent/8 border border-primary/15 text-center">
                <p className="text-base font-bold text-foreground">明天早上就能收到</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">今天配置好，明天早上第一份日报送达</p>
                <motion.button
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/discover')}
                >
                  立即选择信息源
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
                <p className="text-xs text-muted-foreground mt-3">¥19 / 月 &nbsp;·&nbsp; 随时取消</p>
              </div>
            </motion.div>
          )}
        </div>
      </MobileLayout>
    </>
  );
};

export default HomePage;