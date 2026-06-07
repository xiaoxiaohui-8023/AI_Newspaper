import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { api } from '@/api';

const parseStructuredSummary = (summary: string) => {
  const result: Record<string, string> = {};
  if (!summary) return result;
  for (const line of summary.split('\n')) {
    const colon = line.indexOf('：');
    if (colon === -1) continue;
    const key = line.substring(0, colon).trim().replace(/\*/g, '');
    const val = line.substring(colon + 1).trim();
    if (val && val !== '暂无') result[key] = val;
  }
  return result;
};

const sectionConfig = [
  { key: '一句话结论', label: '关键结论', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  { key: '关键数据',   label: '关键数据', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  { key: '为什么重要', label: '重要原因', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
  { key: '反直觉',     label: '反直觉',   color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
];

const CardDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [card, setCard] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getCard(id).then(async (data) => {
      setCard(data);
      if (data.source_article_ids?.length) {
        const articlePromises = data.source_article_ids.map((aid: string) =>
          api.getArticle(aid)
        );
        const articles = await Promise.all(articlePromises);
        setSources(articles.filter((a: any) => !a.error));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">卡片不存在</p>
      </div>
    );
  }

  const structured = parseStructuredSummary(card.summary || '');
  const channelLabel =
    card.channel_id === 'c1' ? { icon: '🔬', text: '模型动态', color: 'text-[#1456F0]' } :
    card.channel_id === 'c2' ? { icon: '💰', text: '投融资', color: 'text-amber-500' } :
    { icon: '🛠', text: '工具与产品', color: 'text-emerald-500' };

  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto">
      <motion.header
        className="sticky top-0 bg-background/95 backdrop-blur-sm z-50 border-b border-border"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="ml-2 font-semibold text-foreground">卡片详情</span>
        </div>
      </motion.header>

      <div className="pb-8">
        {/* 标题区 */}
        <motion.div
          className="px-4 pt-5 pb-4 border-b border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className={`text-[11px] font-bold ${channelLabel.color}`}>
            {channelLabel.icon} {channelLabel.text}
          </span>
          <h1 className="text-lg font-bold text-foreground leading-snug mt-1">
            {card.title}
          </h1>
        </motion.div>

        {/* 四段式摘要 */}
        <motion.div
          className="px-4 py-4 border-b border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs font-semibold text-muted-foreground mb-3">重点解读</p>
          <div className="space-y-2">
            {sectionConfig.map(({ key, label, color, bg, border }) =>
              structured[key] ? (
                <div key={key} className={`p-3 rounded-xl border ${bg} ${border}`}>
                  <span className={`text-[10px] font-bold ${color} block mb-0.5`}>{label}</span>
                  <p className="text-sm text-foreground/80 leading-relaxed">{structured[key]}</p>
                </div>
              ) : null
            )}
          </div>
        </motion.div>

        {/* 来源文章 */}
        <motion.div
          className="px-4 py-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs font-semibold text-muted-foreground mb-3">
            来源文章 · {sources.length} 篇
          </p>
          <div className="space-y-2">
            {sources.map((article: any) => (
              <div
                key={article.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30 cursor-pointer hover:bg-secondary transition-colors"
                onClick={() => navigate(`/article/${article.id}`)}
              >
                <div className="flex-1 mr-3">
                  <p className="text-sm font-medium text-foreground leading-snug">
                    {article.title_zh || article.title}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CardDetailPage;