import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ExternalLink, 
  Bookmark, 
  Share2, 
  Lightbulb,
  List,
  MessageSquareQuote,
  FileText,
  BookOpen,
  Languages
} from 'lucide-react';
import { getSourceIcon, getSourceName, formatPublishTime } from '@/data/mockData';
import { api } from '@/api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ChapterSection from '@/components/article/ChapterSection';
import ReactMarkdown from 'react-markdown';

const OriginalContentSection = ({ 
  article, 
  onOpenOriginal 
}: { 
  article: any; 
  onOpenOriginal: () => void;
}) => {
  const [showChinese, setShowChinese] = useState(true);

  const displayContent = showChinese 
    ? (article.summary || article.originalContent) 
    : article.originalContent;

  return (
    <motion.div 
      className="px-4 py-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <span className="text-base">{getSourceIcon(article.sourceType || 'website')}</span>
          </div>
          <span className="font-bold text-foreground">原文内容</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenOriginal}
          className="gap-1.5"
        >
          <ExternalLink className="w-4 h-4" />
          查看原文
        </Button>
      </div>

      {displayContent && (
        <div className="bg-secondary/50 rounded-xl p-4">
          <div className="text-sm text-foreground leading-relaxed prose prose-sm max-w-none">
            <ReactMarkdown>{displayContent}</ReactMarkdown>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const ArticleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getArticle(id).then(data => {
      setArticle(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (!article || article.error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">文章不存在</p>
      </div>
    );
  }

  const handleSave = () => {
    toast({ title: "已收藏", description: "可在「我的」页面查看" });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: article.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "链接已复制", description: "可以分享给好友" });
    }
  };

  const handleOpenOriginal = () => {
    window.open(article.source_url || article.sourceUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto">
      <motion.header 
        className="sticky top-0 bg-background/95 backdrop-blur-sm z-50 border-b border-border safe-area-inset-top"
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
              onClick={handleSave}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <Bookmark className="w-5 h-5" />
            </button>
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
        <motion.div 
          className="px-4 pt-4 pb-5 border-b border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-full">
              <span className="text-sm">{getSourceIcon(article.sourceType || 'website')}</span>
              <span className="text-xs font-medium text-primary">
                {getSourceName(article.sourceType || 'website')}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatPublishTime(article.published_at || article.publishedAt)}
            </span>
          </div>

          <h1 className="text-xl font-bold text-foreground leading-tight mb-3">
            {article.title_zh || article.title}
          </h1>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
              {article.channelIcon || '📰'}
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">{article.channel_id || article.authorName || '未知来源'}</p>
              <p className="text-xs text-muted-foreground">{article.authorHandle || ''}</p>
            </div>
          </div>
        </motion.div>

        {article.summary && (
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
              {article.summary.split('\n').filter((line: string) => line.trim()).map((line: string, index: number) => {
                const colonIndex = line.indexOf('：');
                if (colonIndex === -1) return null;
                const label = line.substring(0, colonIndex).trim().replace(/\*/g, '');
                const content = line.substring(colonIndex + 1).trim();
                if (content === '暂无') return null;
                const colors = [
                  'bg-blue-50 border-blue-100 text-blue-600',
                  'bg-amber-50 border-amber-100 text-amber-600',
                  'bg-green-50 border-green-100 text-green-600',
                  'bg-purple-50 border-purple-100 text-purple-600',
                ];
                return (
                  <div key={index} className={`p-3 rounded-xl border ${colors[index % 4].split(' ').slice(0,2).join(' ')}`}>
                    <span className={`text-xs font-semibold ${colors[index % 4].split(' ')[2]} block mb-1`}>{label}</span>
                    <div className="text-sm text-foreground/80 leading-relaxed prose prose-sm max-w-none">
                      <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <div className="h-2 bg-secondary" />

        <OriginalContentSection 
          article={article} 
          onOpenOriginal={handleOpenOriginal} 
        />
      </div>
    </div>
  );
};

export default ArticleDetailPage;