import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type NovelNode = {
  type?: string;
  text?: string;
  content?: NovelNode[];
};

/**
 * Novel 에디터의 JSONContent 형식에서 순수 텍스트를 추출합니다.
 * ProseMirror/TipTap의 JSON 구조를 재귀적으로 탐색하여 모든 텍스트 노드를 추출합니다.
 *
 * @param content - Novel 에디터의 JSON 문자열 또는 파싱된 객체
 * @returns 추출된 순수 텍스트 문자열
 */
export function extractTextFromNovelContent(content: string | unknown): string {
  if (!content) return "";

  // 문자열인 경우 JSON 파싱 시도
  let jsonContent: unknown;
  if (typeof content === "string") {
    try {
      jsonContent = JSON.parse(content);
    } catch {
      // JSON 파싱 실패 시 원본 문자열 반환
      return content;
    }
  } else {
    jsonContent = content;
  }

  // 재귀적으로 텍스트 노드 추출
  function extractText(node: unknown): string {
    if (!node || typeof node !== "object") return "";

    const novelNode = node as NovelNode;

    // 텍스트 노드인 경우
    if (novelNode.type === "text" && novelNode.text) {
      return novelNode.text;
    }

    // content 배열이 있는 경우 재귀적으로 처리
    if (Array.isArray(novelNode.content)) {
      return novelNode.content
        .map((child: NovelNode) => extractText(child))
        .filter(Boolean)
        .join(" ");
    }

    return "";
  }

  const extracted = extractText(jsonContent);
  return extracted.trim();
}
