"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Tag, X, Lock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BlogModalProps {
  blog: {
    id: string
    title: string
    summary: string
    keywords: string[]
    thumbnail: string
    addedDate: string
    content?: string
    isPremium?: boolean
  }
  isOpen: boolean
  onClose: () => void
  canReadContent: boolean
  onUpgrade: () => void
}

export function BlogModal({ blog, isOpen, onClose, canReadContent, onUpgrade }: BlogModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex-1 pr-4">
            <DialogTitle className="text-2xl font-bold text-balance leading-tight mb-2">{blog.title}</DialogTitle>
            <p className="text-muted-foreground text-pretty mb-4">{blog.summary}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {blog.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {keyword}
                </Badge>
              ))}
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(blog.addedDate).toLocaleDateString("ko-KR")}
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={onClose} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="mb-6">
          <img
            src={blog.thumbnail || "/placeholder.svg"}
            alt={blog.title}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>

        <div className="prose prose-gray max-w-none">
          {(!blog.isPremium || canReadContent) ? (
            blog.content ? (
              <div className="whitespace-pre-wrap leading-relaxed">
                {blog.content.split("\n").map((line, index) => {
                  if (line.startsWith("# ")) {
                    return (
                      <h1 key={index} className="text-3xl font-bold mt-8 mb-4">
                        {line.substring(2)}
                      </h1>
                    )
                  } else if (line.startsWith("## ")) {
                    return (
                      <h2 key={index} className="text-2xl font-semibold mt-6 mb-3">
                        {line.substring(3)}
                      </h2>
                    )
                  } else if (line.startsWith("### ")) {
                    return (
                      <h3 key={index} className="text-xl font-medium mt-4 mb-2">
                        {line.substring(4)}
                      </h3>
                    )
                  } else if (line.startsWith("- ")) {
                    return (
                      <li key={index} className="ml-4 mb-1">
                        {line.substring(2)}
                      </li>
                    )
                  } else if (line.trim() === "") {
                    return <br key={index} />
                  } else {
                    return (
                      <p key={index} className="mb-4 leading-relaxed">
                        {line}
                      </p>
                    )
                  }
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">블로그 내용을 불러올 수 없습니다.</p>
            )
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border-2 border-dashed border-amber-300">
              <Lock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">프리미엄 회원 전용 콘텐츠</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                이 콘텐츠는 프리미엄 회원만 읽을 수 있습니다.<br/>
                AI가 작성한 고품질 블로그 전문을 보려면 프리미엄 구독이 필요합니다.
              </p>
              <Button
                onClick={onUpgrade}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              >
                <Star className="w-4 h-4 mr-2" />
                프리미엄 회원 가입하기
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
