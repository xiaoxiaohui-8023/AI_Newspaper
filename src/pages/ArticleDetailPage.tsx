import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Bookmark, Share2, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/api';

const ArticleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showChinese, setShowChinese] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getArticle(id)
      .then(setArticle)
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">文章不存在</p>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "链接已复制" });
  };

  // 解析四段式摘要
  const parseSummary = (summary: string) => {
    if (!summary) return null;
    const sections: Record<string, string> = {};
    const labels = ['一句话结论', '关键数据', '为什么重要', '反直觉'];
    labels.forEach(label => {
      const regex = new RegExp(`【${label}】([\\s\\S]*?)(?=【|$)`);
      const match = summary.match(regex);
      if (match) sections[label] = match[1].trim();
    });
    return Object.keys(sections).length > 0 ? sections : null;
  };

  const summaryData = parseSummary(article.summary || article.ai_summary || '');

  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto">
      {/* 顶部导航 */}
      <motion.header
        className="sticky top-0 bg-background/95 backdrop-blur-sm z-50 border-b border-border"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.header>

      <div className="pb-8">
        {/* 文章头部 */}
        <motion.div
          className="px-4 pt-4 pb-5 border-b border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs text-muted-foreground mb-2">
            {article.channel_id && `频道 ${article.channel_id}`}
          </p>
          <h1 className="text-xl font-bold text-foreground leading-tight mb-3">
            {article.title}
          </h1>
          {article.source_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(article.source_url, '_blank')}
              className="gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              查看原文
            </Button>
          )}
        </motion.div>

        {/* AI 摘要 */}
        {summaryData ? (
          <motion.div
            className="px-4 py-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-foreground">AI 智能总结</span>
            </div>
            <div className="space-y-3">
              {Object.entries(summaryData).map(([label, content]) => (
                <div key={label} className="p-4 bg-secondary/50 rounded-xl">
                  <p className="text-xs font-bold text-primary mb-1">【{label}】</p>
                  <p className="text-sm text-foreground leading-relaxed">{content}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (article.summary || article.ai_summary) ? (
          <motion.div
            className="px-4 py-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-foreground">AI 智能总结</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed bg-secondary/50 rounded-xl p-4">
              {article.summary || article.ai_summary}
            </p>
          </motion.div>
        ) : null}

        {/* 原文内容 */}
        {(article.content || article.content_zh) && (
          <motion.div
            className="px-4 py-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-foreground">原文内容</p>
              <div className="flex gap-1">
                <button
                  onClick={() => setShowChinese(true)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    showChinese ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  中文
                </button>
                <button
                  onClick={() => setShowChinese(false)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    !showChinese ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
            <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
              {(() => {
                const raw = showChinese ? (article.content_zh || article.content) : article.content;
                const lines = raw.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
                const merged: string[] = [];
                let buf = '';
                for (const line of lines) {
                  if (buf && line.length < 15) {
                    buf += line;
                  } else if (buf) {
                    merged.push(buf);
                    buf = line;
                  } else {
                    buf = line;
                  }
                }
                if (buf) merged.push(buf);
                return merged.map((para: string, i: number) => (
                  <p key={i} className="text-sm text-foreground leading-relaxed">
                    {para}
                  </p>
                ));
              })()}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ArticleDetailPage;