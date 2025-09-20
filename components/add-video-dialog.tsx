"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface AddVideoDialogProps {
  children: React.ReactNode
  onAddVideo: (video: {
    title: string
    summary: string
    keywords: string[]
    category: string
    youtubeId: string
    thumbnail: string
  }) => void
}

const categories = ["개발", "디자인", "마케팅", "비즈니스", "교육"]

export function AddVideoDialog({ children, onAddVideo }: AddVideoDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    youtubeUrl: "",
    category: "",
    keywordInput: "",
  })
  const [keywords, setKeywords] = useState<string[]>([])

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const addKeyword = () => {
    const keyword = formData.keywordInput.trim()
    if (keyword && !keywords.includes(keyword)) {
      setKeywords([...keywords, keyword])
      setFormData({ ...formData, keywordInput: "" })
    }
  }

  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter((k) => k !== keywordToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const youtubeId = extractYouTubeId(formData.youtubeUrl)
    if (!youtubeId) {
      alert("올바른 유튜브 URL을 입력해주세요.")
      return
    }

    if (!formData.title || !formData.summary || !formData.category || keywords.length === 0) {
      alert("모든 필드를 입력해주세요.")
      return
    }

    onAddVideo({
      title: formData.title,
      summary: formData.summary,
      keywords,
      category: formData.category,
      youtubeId,
      thumbnail: `/placeholder.svg?height=180&width=320&query=${encodeURIComponent(formData.title)}`,
    })

    // 폼 리셋
    setFormData({
      title: "",
      summary: "",
      youtubeUrl: "",
      category: "",
      keywordInput: "",
    })
    setKeywords([])
    setOpen(false)
  }

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addKeyword()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>새 영상 추가</DialogTitle>
          <DialogDescription>유튜브 영상 정보를 입력하여 컬렉션에 추가하세요.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="youtubeUrl">유튜브 URL</Label>
            <Input
              id="youtubeUrl"
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">영상 제목</Label>
            <Input
              id="title"
              placeholder="영상 제목을 입력하세요"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">한줄 요약</Label>
            <Textarea
              id="summary"
              placeholder="영상 내용을 간단히 요약해주세요"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">카테고리</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">키워드</Label>
            <div className="flex gap-2">
              <Input
                id="keywords"
                placeholder="키워드를 입력하고 Enter를 누르세요"
                value={formData.keywordInput}
                onChange={(e) => setFormData({ ...formData, keywordInput: e.target.value })}
                onKeyPress={handleKeywordKeyPress}
              />
              <Button type="button" onClick={addKeyword} variant="outline">
                추가
              </Button>
            </div>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="gap-1">
                    {keyword}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeKeyword(keyword)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit">영상 추가</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
