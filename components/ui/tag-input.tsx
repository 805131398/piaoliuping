"use client"

import * as React from "react"
import { X, Plus, Search, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"

interface TagInputProps {
  value: string[]
  options: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}

export function TagInput({ value = [], options = [], onChange, placeholder }: TagInputProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(inputValue.toLowerCase())
  )

  const toggleTag = (tag: string) => {
    console.log('🔄 toggleTag 调用:', { tag, currentValue: value });
    if (value.includes(tag)) {
      const newValue = value.filter(v => v !== tag);
      console.log('➖ 移除标签:', newValue);
      onChange(newValue);
    } else {
      const newValue = [...value, tag];
      console.log('➕ 添加标签:', newValue);
      onChange(newValue);
    }
  }

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
  }

  const handleAddTag = () => {
    if (inputValue) {
      addTag(inputValue)
      setInputValue("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    onChange(value.filter(v => v !== tag))
  }

  // 处理输入变化，支持逗号分隔自动创建
  const handleInputChange = (val: string) => {
    // 检查是否包含逗号（中英文）
    if (val.includes(",") || val.includes("，")) {
      const parts = val.split(/[,，]/)
      const newTags: string[] = []
      
      parts.forEach((part, index) => {
        const trimmed = part.trim()
        // 最后一个部分保留在输入框（可能还没输完）
        if (index === parts.length - 1) {
          setInputValue(trimmed)
        } else if (trimmed && !value.includes(trimmed)) {
          newTags.push(trimmed)
        }
      })
      
      if (newTags.length > 0) {
        onChange([...value, ...newTags])
      }
    } else {
      setInputValue(val)
    }
  }

  // 处理粘贴事件，支持批量粘贴
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text")
    
    // 分割粘贴的文本
    const parts = pastedText.split(/[,，\n\r]+/)
    const newTags: string[] = []
    
    parts.forEach(part => {
      const trimmed = part.trim()
      if (trimmed && !value.includes(trimmed) && !newTags.includes(trimmed)) {
        newTags.push(trimmed)
      }
    })
    
    if (newTags.length > 0) {
      onChange([...value, ...newTags])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div 
          className="relative w-full rounded-md border border-input bg-background text-sm ring-offset-background cursor-text hover:border-ring focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2" 
          onClick={() => inputRef.current?.focus()}
        >
          <div className="flex items-center gap-1.5 min-h-10 px-3 py-2 pr-9 overflow-x-auto scrollbar-hide">
            {value.map((tag) => (
              <Badge key={tag} variant="secondary" className="shrink-0 h-6 whitespace-nowrap">
                {tag}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleRemoveTag(tag)
                  }}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))}
            <input
              ref={inputRef}
              className="flex-1 min-w-[100px] bg-transparent outline-none placeholder:text-muted-foreground text-sm h-6"
              placeholder={value.length === 0 ? (placeholder || "输入标签，逗号分隔...") : "继续添加..."}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddTag()
                } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
                  // 输入框为空时按退格删除最后一个标签
                  handleRemoveTag(value[value.length - 1])
                }
              }}
              onFocus={() => setOpen(true)}
            />
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="flex flex-col">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <span className="text-sm text-muted-foreground">从已有标签中选择</span>
          </div>
          <div className="max-h-[200px] overflow-y-auto p-1">
            {filteredOptions.map((option) => (
              <div
                key={option}
                className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
              >
                <Checkbox 
                  checked={value.includes(option)} 
                  onCheckedChange={() => toggleTag(option)}
                  id={`tag-${option}`}
                />
                <label 
                  htmlFor={`tag-${option}`} 
                  className="flex-1 cursor-pointer select-none"
                >
                  {option}
                </label>
              </div>
            ))}
            {inputValue && !options.includes(inputValue) && !value.includes(inputValue) && (
               <div
                className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer text-primary"
                onClick={handleAddTag}
              >
                <Plus className="h-4 w-4 mr-2" />
                创建 "{inputValue}"
              </div>
            )}
            {filteredOptions.length === 0 && !inputValue && (
              <div className="py-4 text-center text-sm text-muted-foreground">
                {options.length === 0 ? "直接输入创建标签" : "无匹配标签"}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
