"use client";
import { createAvatar } from "@dicebear/core";
import * as styles from "@dicebear/collection";
import { useEffect, useState } from "react";

export default function DiceBearTest() {
  const [svgContent, setSvgContent] = useState<string>("");
  const [availableStyles, setAvailableStyles] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    try {
      // 检查可用的样式
      const styleKeys = Object.keys(styles);
      setAvailableStyles(styleKeys);

      // 尝试生成一个测试头像
      if (styleKeys.length > 0) {
        const firstStyle = styleKeys[0];
        // 使用类型断言，但更安全的方式
        const styleModule = (styles as Record<string, unknown>)[firstStyle];
        
        if (styleModule && typeof styleModule === 'object' && styleModule !== null) {
          const avatar = createAvatar(styleModule as any, { seed: "test" });
          const svg = avatar.toString();
          setSvgContent(svg);
          console.log("Generated SVG:", svg.substring(0, 100) + "...");
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error("DiceBear test error:", err);
    }
  }, []);

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">DiceBear 测试</h3>
      
      <div className="mb-2">
        <strong>可用样式:</strong> {availableStyles.join(", ")}
      </div>
      
      {error && (
        <div className="text-red-500 mb-2">
          <strong>错误:</strong> {error}
        </div>
      )}
      
      {svgContent && (
        <div className="mb-2">
          <strong>生成的头像:</strong>
          <div 
            className="w-16 h-16 border rounded"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>
      )}
    </div>
  );
} 