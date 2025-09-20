'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  Eye,
  Search,
  ArrowLeft,
  TrendingUp,
  Play,
  FileText,
  Star,
  Users,
  Clock,
  Tag,
  Plus,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { useAdmin } from '@/components/admin-provider';

interface ContentAnalytics {
  id: string;
  title: string;
  type: 'video' | 'blog';
  views: number;
  category: string;
  addedDate: string;
  isPremium: boolean;
  keywords: string[];
  dailyViews: number[];
  avgWatchTime?: string;
  completionRate?: number;
  readingTime?: string;
}

export default function ContentManagement() {
  const router = useRouter();
  const { isAdminLoggedIn, isLoading } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'title' | 'keyword'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [contents, setContents] = useState<ContentAnalytics[]>([]);
  const [totalViews, setTotalViews] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAdminLoggedIn) {
      router.push('/jjr');
    }
  }, [isAdminLoggedIn, isLoading, router]);

  useEffect(() => {
    // 실제 콘텐츠 데이터 (샘플)
    const contentData: ContentAnalytics[] = [
      {
        id: '1',
        title: 'Complete Next.js 14 Guide',
        type: 'video',
        views: 245,
        category: 'Journals',
        addedDate: '2024-01-15',
        isPremium: false,
        keywords: ['NextJS', 'React', 'WebDev'],
        dailyViews: [12, 18, 25, 32, 28, 45, 38],
        avgWatchTime: '8:45',
        completionRate: 72
      },
      {
        id: '2',
        title: 'Understanding Jung\'s Collective Unconscious',
        type: 'blog',
        views: 189,
        category: 'Blog by AI',
        addedDate: '2024-01-18',
        isPremium: true,
        keywords: ['Psychology', 'Jung', 'Unconscious'],
        dailyViews: [8, 15, 22, 18, 24, 31, 29],
        readingTime: '6분 읽기'
      },
      {
        id: '3',
        title: 'React Hooks Deep Dive',
        type: 'video',
        views: 156,
        category: 'Journals',
        addedDate: '2024-01-12',
        isPremium: false,
        keywords: ['React', 'Hooks', 'JavaScript'],
        dailyViews: [5, 12, 19, 22, 18, 26, 24],
        avgWatchTime: '12:30',
        completionRate: 85
      },
      {
        id: '4',
        title: 'The Art of Dream Analysis',
        type: 'blog',
        views: 98,
        category: 'Blog by AI',
        addedDate: '2024-01-20',
        isPremium: true,
        keywords: ['Dreams', 'Analysis', 'Psychology'],
        dailyViews: [3, 8, 12, 15, 18, 21, 21],
        readingTime: '4분 읽기'
      },
      {
        id: '5',
        title: 'TypeScript Best Practices',
        type: 'video',
        views: 67,
        category: 'Journals',
        addedDate: '2024-01-22',
        isPremium: false,
        keywords: ['TypeScript', 'Best Practices', 'Programming'],
        dailyViews: [2, 5, 8, 12, 15, 12, 13],
        avgWatchTime: '15:20',
        completionRate: 78
      }
    ];

    setContents(contentData);
    setTotalViews(contentData.reduce((sum, content) => sum + content.views, 0));
  }, []);

  const filteredContents = contents.filter(content => {
    let matchesSearch = true;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      switch (searchType) {
        case 'title':
          matchesSearch = content.title.toLowerCase().includes(searchLower);
          break;
        case 'keyword':
          matchesSearch = content.keywords.some(keyword =>
            keyword.toLowerCase().includes(searchLower)
          );
          break;
        default: // 'all'
          matchesSearch = content.title.toLowerCase().includes(searchLower) ||
                         content.keywords.some(keyword =>
                           keyword.toLowerCase().includes(searchLower)
                         );
      }
    }

    const matchesCategory = selectedCategory === 'all' || content.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(contents.map(c => c.category)))];

  const getViewTrend = (dailyViews: number[]) => {
    const recent = dailyViews.slice(-3).reduce((a, b) => a + b, 0);
    const previous = dailyViews.slice(-6, -3).reduce((a, b) => a + b, 0);
    return recent > previous ? 'up' : recent < previous ? 'down' : 'stable';
  };

  const handleEdit = (contentId: string) => {
    // 편집 페이지로 이동 (ID와 함께)
    router.push(`/jjr/dashboard/create?edit=${contentId}`);
  };

  const handleDelete = (contentId: string, title: string) => {
    if (confirm(`"${title}" 콘텐츠를 삭제하시겠습니까?`)) {
      // 실제 환경에서는 API 호출로 삭제
      setContents(prev => prev.filter(content => content.id !== contentId));
      alert('콘텐츠가 삭제되었습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/jjr/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>대시보드로</span>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">콘텐츠 관리</h1>
              <p className="text-sm text-slate-600">게시글 조회수 분석 및 콘텐츠 관리</p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/jjr/dashboard/create')}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>콘텐츠 작성</span>
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* 통계 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 콘텐츠</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contents.length}</div>
              <p className="text-xs text-muted-foreground">
                비디오 {contents.filter(c => c.type === 'video').length}개,
                블로그 {contents.filter(c => c.type === 'blog').length}개
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 조회수</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                평균 {Math.round(totalViews / contents.length)}회/콘텐츠
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">프리미엄 콘텐츠</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contents.filter(c => c.isPremium).length}
              </div>
              <p className="text-xs text-muted-foreground">
                전체의 {Math.round((contents.filter(c => c.isPremium).length / contents.length) * 100)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">오늘 조회수</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contents.reduce((sum, c) => sum + c.dailyViews[c.dailyViews.length - 1], 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                어제 대비 +12%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="콘텐츠 제목이나 키워드로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as 'all' | 'title' | 'keyword')}
                    className="px-3 py-2 border border-input rounded-md text-sm"
                  >
                    <option value="all">전체 검색</option>
                    <option value="title">제목만</option>
                    <option value="keyword">키워드만</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-muted-foreground">카테고리:</span>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'all' ? '전체' : category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 콘텐츠 목록 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredContents.map((content) => (
            <Card key={content.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0">
                      {content.type === 'video' ? (
                        <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                          <Play className="h-4 w-4 text-blue-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                          <FileText className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-semibold truncate">{content.title}</h3>
                        {content.isPremium && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                            <Star className="h-2 w-2 mr-1" />
                            프리미엄
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-muted-foreground mb-2">
                        <span>{content.category}</span>
                        <span>{new Date(content.addedDate).toLocaleDateString('ko-KR')}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {content.keywords.slice(0, 3).map((keyword) => (
                          <Badge key={keyword} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {content.keywords.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{content.keywords.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(content.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(content.id, content.title)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {content.views.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">조회수</div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <TrendingUp className={`h-3 w-3 ${
                      getViewTrend(content.dailyViews) === 'up' ? 'text-green-500' :
                      getViewTrend(content.dailyViews) === 'down' ? 'text-red-500' : 'text-gray-500'
                    }`} />
                    <span className={`text-xs ${
                      getViewTrend(content.dailyViews) === 'up' ? 'text-green-600' :
                      getViewTrend(content.dailyViews) === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {getViewTrend(content.dailyViews) === 'up' ? '증가' :
                       getViewTrend(content.dailyViews) === 'down' ? '감소' : '안정'}
                    </span>
                  </div>

                  {content.type === 'video' && content.completionRate && (
                    <div className="text-xs text-muted-foreground">
                      완주율: {content.completionRate}%
                    </div>
                  )}
                </div>

                {/* 7일간 조회수 트렌드 미니 차트 */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>7일 트렌드</span>
                    <span>오늘: {content.dailyViews[content.dailyViews.length - 1]}회</span>
                  </div>
                  <div className="flex items-end space-x-1 h-6">
                    {content.dailyViews.map((views, index) => {
                      const maxViews = Math.max(...content.dailyViews);
                      const height = maxViews > 0 ? (views / maxViews) * 100 : 0;
                      return (
                        <div
                          key={index}
                          className="bg-primary/20 rounded-sm flex-1"
                          style={{ height: `${Math.max(height, 10)}%` }}
                          title={`${views}회`}
                        />
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredContents.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground">다른 키워드로 검색해보세요.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}