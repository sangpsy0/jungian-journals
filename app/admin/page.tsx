"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

const initialVideos = [
  {
    id: "1",
    title: "Complete Next.js 14 Guide",
    summary: "Learn about Next.js 14's new features and App Router usage in detail",
    keywords: ["Next.js", "React", "WebDev", "JavaScript"],
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/nextjs-tutorial-thumbnail.jpg",
    addedDate: "2024-01-15",
    tab: "Journals" as const,
    type: "video" as const,
  },
  {
    id: "2",
    title: "Mastering React Hooks",
    summary: "Complete guide from useState, useEffect to custom hooks",
    keywords: ["React", "Hooks", "useState", "useEffect"],
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/react-hooks-tutorial.png",
    addedDate: "2024-01-10",
    tab: "Books" as const,
    type: "video" as const,
  },
  {
    id: "3",
    title: "Building Design Systems",
    summary: "Creating design systems with Figma and Storybook",
    keywords: ["DesignSystem", "Figma", "Storybook", "UI/UX"],
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/design-system-figma.jpg",
    addedDate: "2024-01-12",
    tab: "Fairy Tales" as const,
    type: "video" as const,
  },
  {
    id: "blog1",
    title: "AI-Analyzed Human Psychology Patterns",
    summary: "Unconscious behavioral patterns and their meanings analyzed by latest AI technology",
    keywords: ["AI", "Psychology", "PatternAnalysis", "Unconscious"],
    thumbnail: "/ai-psychology-analysis.jpg",
    addedDate: "2024-01-20",
    tab: "Blog by AI" as const,
    type: "blog" as const,
    content: `# AI-Analyzed Human Psychology Patterns

Let's explore the hidden patterns of human psychology discovered by artificial intelligence through massive data analysis.

## Key Findings

1. **Cyclical Nature of Emotional Expression**: Human emotional expression follows a 7-day cycle pattern.
2. **Time-based Decision Making Characteristics**: Most rational judgments are made at 10 AM and 3 PM.
3. **Regularity of Social Interactions**: Conversation patterns based on intimacy levels are mathematically predictable.

These patterns can provide practical help for personal growth and improving human relationships.`,
  },
]

type Video = (typeof initialVideos)[0]
type TabType = "Journals" | "Books" | "Fairy Tales" | "Blog by AI"
type ContentType = "video" | "blog"

export default function AdminPage() {
  const [videos, setVideos] = useState(initialVideos)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [contentType, setContentType] = useState<ContentType>("video")
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    keywords: "",
    youtubeUrl: "",
    tab: "Journals" as TabType,
    type: "video" as ContentType,
    content: "",
  })

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const resetForm = () => {
    setFormData({
      title: "",
      summary: "",
      keywords: "",
      youtubeUrl: "",
      tab: "Journals",
      type: "video",
      content: "",
    })
    setEditingVideo(null)
    setIsAddingNew(false)
    setContentType("video")
  }

  const startEdit = (video: Video) => {
    setEditingVideo(video)
    setContentType(video.type)
    setFormData({
      title: video.title,
      summary: video.summary,
      keywords: video.keywords.join(", "),
      youtubeUrl: video.type === "video" ? (video as any).youtubeUrl : "",
      tab: video.tab,
      type: video.type,
      content: video.type === "blog" ? (video as any).content || "" : "",
    })
    setIsAddingNew(false)
  }

  const startAddNew = (type: ContentType = "video") => {
    resetForm()
    setContentType(type)
    setFormData((prev) => ({
      ...prev,
      type,
      tab: type === "blog" ? "Blog by AI" : "Journals",
    }))
    setIsAddingNew(true)
  }

  const handleSave = () => {
    if (formData.type === "video") {
      const youtubeId = extractYouTubeId(formData.youtubeUrl)
      if (!youtubeId) {
        alert("Please enter a valid YouTube URL.")
        return
      }
    }

    const baseData = {
      title: formData.title,
      summary: formData.summary,
      keywords: formData.keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k),
      thumbnail: `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(formData.title)}`,
      tab: formData.tab,
      type: formData.type,
    }

    const videoData =
      formData.type === "video"
        ? {
            ...baseData,
            youtubeUrl: formData.youtubeUrl,
            youtubeId: extractYouTubeId(formData.youtubeUrl),
          }
        : {
            ...baseData,
            content: formData.content,
          }

    if (editingVideo) {
      setVideos((prev) => prev.map((video) => (video.id === editingVideo.id ? { ...video, ...videoData } : video)))
    } else {
      const newVideo = {
        ...videoData,
        id: Date.now().toString(),
        addedDate: new Date().toISOString().split("T")[0],
      }
      setVideos((prev) => [newVideo, ...prev])
    }

    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this content?")) {
      setVideos((prev) => prev.filter((video) => video.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  ← Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-primary">Content Management</h1>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => startAddNew("video")} variant="outline" className="gap-2">
                + Add Video
              </Button>
              <Button onClick={() => startAddNew("blog")} className="gap-2">
                + Add Blog
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {(editingVideo || isAddingNew) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingVideo ? "Edit Content" : "Add New Content"} - {contentType === "video" ? "Video" : "Blog"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!editingVideo && (
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Tabs
                    value={contentType}
                    onValueChange={(value: ContentType) => {
                      setContentType(value)
                      setFormData((prev) => ({
                        ...prev,
                        type: value,
                        tab: value === "blog" ? "Blog by AI" : "Journals",
                      }))
                    }}
                  >
                    <TabsList>
                      <TabsTrigger value="video">Video</TabsTrigger>
                      <TabsTrigger value="blog">Blog</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="tab">Tab</Label>
                <Select
                  value={formData.tab}
                  onValueChange={(value: TabType) => setFormData((prev) => ({ ...prev, tab: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tab" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentType === "blog" ? (
                      <SelectItem value="Blog by AI">Blog by AI</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="Journals">Journals</SelectItem>
                        <SelectItem value="Books">Books</SelectItem>
                        <SelectItem value="Fairy Tales">Fairy Tales</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder={contentType === "video" ? "Enter video title" : "Enter blog title"}
                />
              </div>

              {contentType === "video" && (
                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl">YouTube URL</Label>
                  <Input
                    id="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, youtubeUrl: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                  placeholder={
                    contentType === "video"
                      ? "Enter a brief description of the video"
                      : "Enter a brief description of the blog"
                  }
                  rows={3}
                />
              </div>

              {contentType === "blog" && (
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter blog content. Markdown format is supported."
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">Markdown format: # Title, ## Subtitle, - List, etc.</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData((prev) => ({ ...prev, keywords: e.target.value }))}
                  placeholder="Enter keywords separated by commas (e.g., React, JavaScript, WebDev)"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="gap-2">
                  💾 Save
                </Button>
                <Button variant="outline" onClick={resetForm} className="gap-2 bg-transparent">
                  ✕ Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Registered Content ({videos.length} items)</h2>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
              <TabsTrigger value="blog">Blogs</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {videos.map((video) => (
                <ContentManagementCard key={video.id} video={video} onEdit={startEdit} onDelete={handleDelete} />
              ))}
            </TabsContent>

            <TabsContent value="video" className="space-y-4">
              {videos
                .filter((v) => v.type === "video")
                .map((video) => (
                  <ContentManagementCard key={video.id} video={video} onEdit={startEdit} onDelete={handleDelete} />
                ))}
            </TabsContent>

            <TabsContent value="blog" className="space-y-4">
              {videos
                .filter((v) => v.type === "blog")
                .map((video) => (
                  <ContentManagementCard key={video.id} video={video} onEdit={startEdit} onDelete={handleDelete} />
                ))}
            </TabsContent>
          </Tabs>

          {videos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No registered content.</p>
              <p className="text-muted-foreground">Try adding new content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ContentManagementCard({
  video,
  onEdit,
  onDelete,
}: {
  video: Video
  onEdit: (video: Video) => void
  onDelete: (id: string) => void
}) {
  const isBlog = video.type === "blog"

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <img
            src={video.thumbnail || "/placeholder.svg"}
            alt={video.title}
            className="w-32 h-20 object-cover rounded"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{video.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {video.tab}
                  </Badge>
                  <Badge variant={isBlog ? "default" : "secondary"} className="text-xs">
                    {isBlog ? "Blog" : "Video"}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm mb-2">{video.summary}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(video.addedDate).toLocaleDateString("en-US")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {video.keywords.map((keyword) => (
                    <Badge key={keyword} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {!isBlog && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open((video as any).youtubeUrl, "_blank")}
                    className="gap-1"
                  >
                    🔗
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => onEdit(video)} className="gap-1">
                  ✏️
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(video.id)}
                  className="gap-1 text-destructive hover:text-destructive"
                >
                  🗑️
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
