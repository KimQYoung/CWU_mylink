import {
  Archive,
  BookOpen,
  Briefcase,
  Code2,
  Globe,
  Layers,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkIconProps {
  icon?: string;
  className?: string;
}

/**
 * 링크 아이템의 icon 식별자에 대응하는 모노크롬 1.5px 스트로크 아이콘을 렌더링합니다.
 */
export function LinkIcon({ icon, className }: LinkIconProps) {
  const iconClass = cn("size-4 shrink-0", className);

  switch (icon) {
    case "github":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={iconClass}
          aria-hidden="true"
        >
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
      );
    case "code-2":
      return <Code2 strokeWidth={1.5} className={iconClass} aria-hidden="true" />;
    case "layers":
      return <Layers strokeWidth={1.5} className={iconClass} aria-hidden="true" />;
    case "book-open":
      return <BookOpen strokeWidth={1.5} className={iconClass} aria-hidden="true" />;
    case "briefcase":
      return <Briefcase strokeWidth={1.5} className={iconClass} aria-hidden="true" />;
    case "mail":
      return <Mail strokeWidth={1.5} className={iconClass} aria-hidden="true" />;
    case "archive":
      return <Archive strokeWidth={1.5} className={iconClass} aria-hidden="true" />;
    default:
      return <Globe strokeWidth={1.5} className={iconClass} aria-hidden="true" />;
  }
}
