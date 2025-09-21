'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Video,
  FileText,
  Upload,
  Plus,
  X,
  Eye,
  Save,
  Youtube,
  Image as ImageIcon
} from 'lucide-react';
import { useAdmin } from '@/components/admin-provider';
import { createBrowserClient } from '@supabase/ssr';
import { supabase } from '@/lib/supabase';

interface VideoContent {
  category: 'Journals' | 'Books' | 'Fairy Tales';
  title: string;
  youtubeUrl: string;
  description: string;
  keywords: string[];
  isPremium: boolean;
  image: File | null;
  imagePreview: string | null;
  imageUrl: string | null; // Custom image URL
}

interface BlogContent {
  title: string;
  content: string;
  keywords: string[];
  image: File | null;
  imagePreview: string | null;
  imageUrl: string | null; // External URL for image
  isPremium: boolean;
}

export default function CreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdminLoggedIn, isLoading } = useAdmin();
  const [contentType, setContentType] = useState<'video' | 'blog'>('video');
  const [keywordInput, setKeywordInput] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Video content state
  const [videoContent, setVideoContent] = useState<VideoContent>({
    category: 'Journals',
    title: '',
    youtubeUrl: '',
    description: '',
    keywords: [],
    isPremium: false,
    image: null,
    imagePreview: null,
    imageUrl: null
  });

  // Blog content state
  const [blogContent, setBlogContent] = useState<BlogContent>({
    title: '',
    content: '',
    keywords: [],
    image: null,
    imagePreview: null,
    imageUrl: null,
    isPremium: false
  });

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdminLoggedIn) {
      router.push('/jjr');
    }
  }, [isAdminLoggedIn, isLoading, router]);

  // 편집 모드 확인 및 데이터 로드
  useEffect(() => {
    const editParam = searchParams.get('edit');
    if (editParam) {
      setEditId(editParam);
      setIsEditing(true);
      loadContentForEdit(editParam);
    }
  }, [searchParams]);

  const loadContentForEdit = async (contentId: string) => {
    try {
      const supabaseClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      console.log('편집할 콘텐츠 ID:', contentId);

      // 비디오 콘텐츠 먼저 확인
      const { data: videoData, error: videoError } = await supabaseClient
        .from('video_content')
        .select('*')
        .eq('id', contentId)
        .single();

      if (videoData && !videoError) {
        console.log('비디오 콘텐츠 로드:', videoData);
        setContentType('video');

        // 키워드 처리
        let processedKeywords = [];
        if (videoData.keywords) {
          if (typeof videoData.keywords === 'string') {
            try {
              processedKeywords = JSON.parse(videoData.keywords);
            } catch {
              processedKeywords = videoData.keywords.split(',').map(k => k.trim()).filter(k => k);
            }
          } else if (Array.isArray(videoData.keywords)) {
            processedKeywords = videoData.keywords;
          }
        }

        setVideoContent({
          category: videoData.category,
          title: videoData.title,
          youtubeUrl: videoData.youtube_url || '',
          description: videoData.description || '',
          keywords: processedKeywords,
          isPremium: videoData.is_premium || false,
          image: null,
          imagePreview: videoData.image_url || null,  // image → image_url로 수정
          imageUrl: videoData.image_url || null  // image → image_url로 수정
        });
        return;
      }

      // 블로그 콘텐츠 확인
      const { data: blogData, error: blogError } = await supabaseClient
        .from('blog_content')
        .select('*')
        .eq('id', contentId)
        .single();

      if (blogData && !blogError) {
        console.log('블로그 콘텐츠 로드:', blogData);
        setContentType('blog');

        // 키워드 처리
        let processedKeywords = [];
        if (blogData.keywords) {
          if (typeof blogData.keywords === 'string') {
            try {
              processedKeywords = JSON.parse(blogData.keywords);
            } catch {
              processedKeywords = blogData.keywords.split(',').map(k => k.trim()).filter(k => k);
            }
          } else if (Array.isArray(blogData.keywords)) {
            processedKeywords = blogData.keywords;
          }
        }

        setBlogContent({
          title: blogData.title,
          content: blogData.content || '',
          keywords: processedKeywords,
          image: null,
          imagePreview: blogData.image || null,
          imageUrl: blogData.image || null, // Store the actual URL from database
          isPremium: blogData.is_premium || false
        });
      }

    } catch (error) {
      console.error('콘텐츠 로드 중 오류:', error);
      alert('콘텐츠 로드 중 오류가 발생했습니다.');
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim()) {
      // 쉼표로 구분하여 여러 키워드 추가
      const newKeywords = keywordInput
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      if (contentType === 'video') {
        setVideoContent(prev => {
          const existingKeywords = prev.keywords || [];
          const uniqueKeywords = [...new Set([...existingKeywords, ...newKeywords])];
          return {
            ...prev,
            keywords: uniqueKeywords
          };
        });
      } else {
        setBlogContent(prev => {
          const existingKeywords = prev.keywords || [];
          const uniqueKeywords = [...new Set([...existingKeywords, ...newKeywords])];
          return {
            ...prev,
            keywords: uniqueKeywords
          };
        });
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    if (contentType === 'video') {
      setVideoContent(prev => ({
        ...prev,
        keywords: prev.keywords.filter(k => k !== keywordToRemove)
      }));
    } else {
      setBlogContent(prev => ({
        ...prev,
        keywords: prev.keywords.filter(k => k !== keywordToRemove)
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'blog' = 'blog') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'video') {
        setVideoContent(prev => ({
          ...prev,
          image: file,
          imagePreview: URL.createObjectURL(file),
          imageUrl: null // Clear external URL when new image is selected
        }));
      } else {
        setBlogContent(prev => ({
          ...prev,
          image: file,
          imagePreview: URL.createObjectURL(file),
          imageUrl: null // Clear external URL when new image is selected
        }));
      }
    }
  };

  const handleImageUrlChange = (url: string, type: 'video' | 'blog' = 'blog') => {
    if (type === 'video') {
      setVideoContent(prev => ({
        ...prev,
        image: null,
        imagePreview: url,
        imageUrl: url
      }));
    } else {
      setBlogContent(prev => ({
        ...prev,
        image: null,
        imagePreview: url,
        imageUrl: url
      }));
    }
  };

  const getYoutubeThumbnail = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  // Supabase Storage에 이미지 업로드하는 함수
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const supabaseClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // 파일명 생성 (timestamp + 원본 파일명)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      // Storage에 업로드
      const { data, error } = await supabaseClient.storage
        .from('blog-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('이미지 업로드 오류:', error);
        throw error;
      }

      // 업로드된 이미지의 공개 URL 가져오기
      const { data: { publicUrl } } = supabaseClient.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      return null;
    }
  };

  const handleSave = async () => {
    try {
      const supabaseClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      if (contentType === 'video') {
        // 필수 필드 검증
        if (!videoContent.title || !videoContent.youtubeUrl) {
          alert('제목과 YouTube URL은 필수입니다.');
          return;
        }

        console.log('🔍 저장할 비디오 키워드 상세:', {
          keywords: videoContent.keywords,
          type: typeof videoContent.keywords,
          isArray: Array.isArray(videoContent.keywords),
          length: videoContent.keywords?.length,
          stringified: JSON.stringify(videoContent.keywords)
        });

        if (isEditing && editId) {
          // 편집 모드: 기존 콘텐츠 업데이트
          const updateData: any = {
            title: videoContent.title,
            description: videoContent.description,
            youtube_url: videoContent.youtubeUrl,
            category: videoContent.category,
            keywords: JSON.stringify(videoContent.keywords),
            is_premium: false, // 비디오는 항상 무료
          };

          // 이미지 처리
          if (videoContent.image) {
            // 새로운 파일이 업로드된 경우
            console.log('비디오 이미지 파일 업로드 시작...');
            const uploadedUrl = await uploadImage(videoContent.image);
            if (uploadedUrl) {
              updateData.image_url = uploadedUrl;  // image → image_url로 수정
              console.log('비디오 이미지 업로드 성공:', uploadedUrl);
            }
          } else if (videoContent.imageUrl && videoContent.imageUrl !== '' && videoContent.imageUrl !== videoContent.imagePreview) {
            // 외부 URL이 새로 입력된 경우
            updateData.image_url = videoContent.imageUrl;  // image → image_url로 수정
            console.log('비디오 외부 이미지 URL 사용:', videoContent.imageUrl);
          }
          // 이미지가 없으면 image_url 필드를 업데이트하지 않음 (YouTube 썸네일 사용)

          const { data, error } = await supabaseClient
            .from('video_content')
            .update(updateData)
            .eq('id', editId);

          if (error) throw error;
          console.log('비디오 콘텐츠 수정 성공:', data);
          alert('비디오 콘텐츠가 성공적으로 수정되었습니다!');
        } else {
          // 신규 생성 모드
          const insertData: any = {
            title: videoContent.title,
            description: videoContent.description,
            youtube_url: videoContent.youtubeUrl,
            category: videoContent.category,
            keywords: JSON.stringify(videoContent.keywords),
            is_premium: false, // 비디오는 항상 무료
            created_at: new Date().toISOString()
          };

          // 이미지 처리
          if (videoContent.image) {
            // 파일이 업로드된 경우
            console.log('비디오 이미지 파일 업로드 시작...');
            const uploadedUrl = await uploadImage(videoContent.image);
            if (uploadedUrl) {
              insertData.image_url = uploadedUrl;  // image → image_url로 수정
              console.log('비디오 이미지 업로드 성공:', uploadedUrl);
            }
          } else if (videoContent.imageUrl && videoContent.imageUrl !== '') {
            // 외부 URL이 입력된 경우
            insertData.image_url = videoContent.imageUrl;  // image → image_url로 수정
            console.log('비디오 외부 이미지 URL 사용:', videoContent.imageUrl);
          }
          // 이미지가 없으면 YouTube 썸네일을 자동으로 사용

          const { data, error } = await supabaseClient
            .from('video_content')
            .insert([insertData]);

          if (error) throw error;
          console.log('비디오 콘텐츠 저장 성공:', data);
          alert('비디오 콘텐츠가 성공적으로 저장되었습니다!');
        }
      } else {
        // 필수 필드 검증
        if (!blogContent.title || !blogContent.content) {
          alert('제목과 내용은 필수입니다.');
          return;
        }

        console.log('저장할 블로그 키워드:', blogContent.keywords);

        if (isEditing && editId) {
          // 편집 모드: 기존 콘텐츠 업데이트
          const updateData: any = {
            title: blogContent.title,
            content: blogContent.content,
            keywords: JSON.stringify(blogContent.keywords),
            is_premium: blogContent.isPremium,
          };

          // 이미지 처리
          if (blogContent.image) {
            // 새로운 파일이 업로드된 경우
            console.log('이미지 파일 업로드 시작...');
            const uploadedUrl = await uploadImage(blogContent.image);
            if (uploadedUrl) {
              updateData.image = uploadedUrl;
              console.log('이미지 업로드 성공:', uploadedUrl);
            } else {
              console.log('이미지 업로드 실패 - 기존 이미지 유지');
            }
          } else if (blogContent.imageUrl && blogContent.imageUrl !== '' && blogContent.imageUrl !== blogContent.imagePreview) {
            // 외부 URL이 새로 입력된 경우
            updateData.image = blogContent.imageUrl;
            console.log('외부 이미지 URL 사용:', blogContent.imageUrl);
          } else {
            // 변경사항 없으면 기존 이미지 유지
            console.log('기존 이미지 유지 - image 필드 업데이트하지 않음');
          }

          const { data, error } = await supabaseClient
            .from('blog_content')
            .update(updateData)
            .eq('id', editId);

          if (error) throw error;
          console.log('블로그 콘텐츠 수정 성공:', data);
          alert('블로그 콘텐츠가 성공적으로 수정되었습니다!');
        } else {
          // 신규 생성 모드
          const insertData: any = {
            title: blogContent.title,
            content: blogContent.content,
            keywords: JSON.stringify(blogContent.keywords),
            is_premium: blogContent.isPremium,
            created_at: new Date().toISOString()
          };

          // 이미지 처리
          if (blogContent.image) {
            // 파일이 업로드된 경우
            console.log('이미지 파일 업로드 시작...');
            const uploadedUrl = await uploadImage(blogContent.image);
            if (uploadedUrl) {
              insertData.image = uploadedUrl;
              console.log('이미지 업로드 성공:', uploadedUrl);
            } else {
              // 업로드 실패 시 기본 이미지 사용
              insertData.image = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop';
              console.log('업로드 실패 - 기본 이미지 사용');
            }
          } else if (blogContent.imageUrl && blogContent.imageUrl !== '') {
            // 외부 URL이 입력된 경우
            insertData.image = blogContent.imageUrl;
            console.log('외부 이미지 URL 사용:', blogContent.imageUrl);
          } else {
            // 이미지가 없는 경우 기본 이미지 사용
            insertData.image = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop';
            console.log('기본 이미지 사용');
          }

          const { data, error } = await supabaseClient
            .from('blog_content')
            .insert([insertData]);

          if (error) throw error;
          console.log('블로그 콘텐츠 저장 성공:', data);
          alert('블로그 콘텐츠가 성공적으로 저장되었습니다!');
        }
      }

      // 저장 후 콘텐츠 관리 페이지로 이동
      router.push('/jjr/dashboard/content');
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다: ' + error.message);
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
              onClick={() => router.push('/jjr/dashboard/content')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>콘텐츠 관리로</span>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {isEditing ? '콘텐츠 편집' : '콘텐츠 작성'}
              </h1>
              <p className="text-sm text-slate-600">
                {isEditing ? '기존 콘텐츠를 수정합니다' : '새로운 비디오 또는 블로그 콘텐츠 작성'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="h-4 w-4 mr-1" />
              {showPreview ? '편집' : '미리보기'}
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              {isEditing ? '수정' : '저장'}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 콘텐츠 타입 선택 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>콘텐츠 타입 선택</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button
                variant={contentType === 'video' ? 'default' : 'outline'}
                onClick={() => setContentType('video')}
                className="flex items-center space-x-2"
              >
                <Video className="h-4 w-4" />
                <span>비디오</span>
              </Button>
              <Button
                variant={contentType === 'blog' ? 'default' : 'outline'}
                onClick={() => setContentType('blog')}
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>블로그</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 편집 영역 */}
          <div className="space-y-6">
            {contentType === 'video' ? (
              /* 비디오 콘텐츠 편집 */
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Youtube className="h-5 w-5" />
                      <span>비디오 정보</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">카테고리</label>
                      <select
                        value={videoContent.category}
                        onChange={(e) => setVideoContent(prev => ({
                          ...prev,
                          category: e.target.value as 'Journals' | 'Books' | 'Fairy Tales'
                        }))}
                        className="w-full p-2 border border-input rounded-md"
                      >
                        <option value="Journals">Journals</option>
                        <option value="Books">Books</option>
                        <option value="Fairy Tales">Fairy Tales</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">제목</label>
                      <Input
                        value={videoContent.title}
                        onChange={(e) => setVideoContent(prev => ({
                          ...prev,
                          title: e.target.value
                        }))}
                        placeholder="비디오 제목을 입력하세요"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">YouTube URL</label>
                      <Input
                        value={videoContent.youtubeUrl}
                        onChange={(e) => setVideoContent(prev => ({
                          ...prev,
                          youtubeUrl: e.target.value
                        }))}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">한 줄 설명</label>
                      <Textarea
                        value={videoContent.description}
                        onChange={(e) => setVideoContent(prev => ({
                          ...prev,
                          description: e.target.value
                        }))}
                        placeholder="비디오에 대한 간단한 설명을 입력하세요"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">표지 이미지 (선택사항)</label>
                      <div className="space-y-3">
                        <div className="border-2 border-dashed border-input rounded-lg p-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'video')}
                            className="hidden"
                            id="video-image-upload"
                          />
                          <label
                            htmlFor="video-image-upload"
                            className="flex flex-col items-center justify-center cursor-pointer"
                          >
                            {videoContent.imagePreview ? (
                              <img
                                src={videoContent.imagePreview}
                                alt="표지 이미지"
                                className="w-full h-32 object-cover rounded"
                              />
                            ) : (
                              <>
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-sm text-muted-foreground">
                                  이미지를 업로드하거나 드래그해서 놓으세요
                                </span>
                              </>
                            )}
                          </label>
                        </div>

                        {videoContent.imagePreview && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setVideoContent(prev => ({
                              ...prev,
                              image: null,
                              imagePreview: null,
                              imageUrl: null
                            }))}
                            className="w-full"
                          >
                            <X className="h-4 w-4 mr-1" />
                            이미지 제거
                          </Button>
                        )}

                        <div className="text-xs text-muted-foreground">
                          이미지를 업로드하지 않으면 YouTube 썸네일이 자동으로 사용됩니다.
                        </div>
                      </div>
                    </div>

                    {/* 비디오는 항상 무료 - isPremium을 false로 고정 */}
                  </CardContent>
                </Card>
              </>
            ) : (
              /* 블로그 콘텐츠 편집 */
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>블로그 정보</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">제목</label>
                      <Input
                        value={blogContent.title}
                        onChange={(e) => setBlogContent(prev => ({
                          ...prev,
                          title: e.target.value
                        }))}
                        placeholder="블로그 제목을 입력하세요"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">표지 이미지</label>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg space-y-2">
                          <p className="text-sm font-medium">파일 업로드</p>
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="w-full p-2 border border-input rounded-md"
                              />
                              {blogContent.image && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  선택된 파일: {blogContent.image.name}
                                </p>
                              )}
                            </div>
                            {blogContent.imagePreview && (
                              <div className="w-20 h-20 border rounded-lg overflow-hidden">
                                <img
                                  src={blogContent.imagePreview}
                                  alt="미리보기"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-3 border rounded-lg space-y-2">
                          <p className="text-sm font-medium">또는 외부 URL 입력</p>
                          <Input
                            value={blogContent.imageUrl || ''}
                            onChange={(e) => handleImageUrlChange(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            외부 이미지 URL을 입력하면 파일 업로드보다 우선 적용됩니다.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">회원 유형</label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="blog-free"
                            name="blog-membership"
                            checked={!blogContent.isPremium}
                            onChange={() => setBlogContent(prev => ({
                              ...prev,
                              isPremium: false
                            }))}
                            className="rounded"
                          />
                          <label htmlFor="blog-free" className="text-sm font-medium flex items-center space-x-2">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                            <span>무료 회원용 (모든 사용자가 읽을 수 있음)</span>
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="blog-premium"
                            name="blog-membership"
                            checked={blogContent.isPremium}
                            onChange={() => setBlogContent(prev => ({
                              ...prev,
                              isPremium: true
                            }))}
                            className="rounded"
                          />
                          <label htmlFor="blog-premium" className="text-sm font-medium flex items-center space-x-2">
                            <span className="inline-block w-2 h-2 bg-amber-500 rounded-full"></span>
                            <span>유료 회원용 (프리미엄 구독자만 읽을 수 있음)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>본문 (마크다운)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={blogContent.content}
                      onChange={(e) => setBlogContent(prev => ({
                        ...prev,
                        content: e.target.value
                      }))}
                      placeholder="마크다운 형식으로 본문을 작성하세요..."
                      rows={25}
                      className="font-mono min-h-[500px]"
                    />
                  </CardContent>
                </Card>
              </>
            )}

            {/* 키워드 입력 */}
            <Card>
              <CardHeader>
                <CardTitle>키워드</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="키워드 입력 (쉼표로 구분하여 여러 개 입력 가능)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                  />
                  <Button onClick={addKeyword} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(contentType === 'video' ? videoContent.keywords : blogContent.keywords).map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="flex items-center space-x-1">
                      <span>{keyword}</span>
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 미리보기 영역 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>미리보기</CardTitle>
              </CardHeader>
              <CardContent>
                {contentType === 'video' ? (
                  <div className="space-y-4">
                    {/* 이미지 미리보기 - 업로드된 이미지 우선, 없으면 YouTube 썸네일 */}
                    {(videoContent.imagePreview || videoContent.youtubeUrl) && (
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={videoContent.imagePreview || getYoutubeThumbnail(videoContent.youtubeUrl) || ''}
                          alt={videoContent.imagePreview ? "업로드된 이미지" : "YouTube 썸네일"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-video.jpg';
                          }}
                        />
                      </div>
                    )}

                    {/* 비디오 정보 */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{videoContent.category}</Badge>
                        {videoContent.isPremium && (
                          <Badge className="bg-amber-100 text-amber-800">프리미엄</Badge>
                        )}
                      </div>

                      <h3 className="text-lg font-bold">
                        {videoContent.title || '제목을 입력하세요'}
                      </h3>

                      <p className="text-muted-foreground text-sm">
                        {videoContent.description || '한 줄 설명을 입력하세요'}
                      </p>

                      {videoContent.keywords.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-muted-foreground">키워드</span>
                          <div className="flex flex-wrap gap-1">
                            {videoContent.keywords.map((keyword) => (
                              <Badge key={keyword} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* 블로그 표지 이미지 */}
                    {blogContent.imagePreview ? (
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={blogContent.imagePreview}
                          alt="블로그 표지"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                          <p className="text-sm">표지 이미지를 업로드하세요</p>
                        </div>
                      </div>
                    )}

                    {/* 블로그 정보 */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Blog by AI</Badge>
                        {blogContent.isPremium && (
                          <Badge className="bg-amber-100 text-amber-800">프리미엄</Badge>
                        )}
                      </div>

                      <h3 className="text-lg font-bold">
                        {blogContent.title || '제목을 입력하세요'}
                      </h3>

                      {blogContent.keywords.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-muted-foreground">키워드</span>
                          <div className="flex flex-wrap gap-1">
                            {blogContent.keywords.map((keyword) => (
                              <Badge key={keyword} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}