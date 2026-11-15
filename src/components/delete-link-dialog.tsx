"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { LinkIcon } from "@/components/link-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  FIRESTORE_LINKS_PATH,
  getFirestoreErrorMessage,
} from "@/lib/firestore-links";
import type { LinkItem } from "@/types";

interface DeleteLinkDialogProps {
  link: LinkItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: (link: LinkItem) => Promise<void>;
}

/**
 * 링크 삭제 전 사용자 확인을 받는 모달 컴포넌트
 * - 제목, 대상 링크 이름, 빨간색 경고 문구, 취소/삭제하기 버튼 및 Firestore 삭제 연동을 제공합니다.
 */
export function DeleteLinkDialog({
  link,
  open,
  onOpenChange,
  onConfirmDelete,
}: DeleteLinkDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDeleting) return;
    if (!nextOpen) {
      setDeleteError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleDelete = async () => {
    if (!link || isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await onConfirmDelete(link);
      onOpenChange(false);
    } catch (error) {
      setDeleteError(getFirestoreErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const endpointLabel =
    link?.endpointLabel ||
    (link ? `ENDPOINT ${String(link.order).padStart(2, "0")}` : "ENDPOINT");
  const displayTarget = link?.displayUrl || link?.url || "";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPopup
        className="max-w-md p-5 sm:p-6"
        showCloseButton={!isDeleting}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 pb-1">
            <span className="font-mono text-[11px] uppercase tracking-[1.4px] text-red-400">
              {"//"} DELETE {endpointLabel}
            </span>
            <Badge variant="default" className="text-[10px]">
              CLOUD FIRESTORE
            </Badge>
          </div>
          <DialogTitle>정말 삭제하시겠습니까?</DialogTitle>
          <DialogDescription>
            선택한 링크 문서가 Cloud Firestore ({FIRESTORE_LINKS_PATH})에서
            영구적으로 제거되며 삭제 후 목록이 갱신됩니다.
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4" />

        {link && (
          <div className="space-y-3">
            {/* 대상 링크 이름 표시 */}
            <div className="flex items-start gap-3 rounded-lg border border-hairline bg-canvas-soft p-3.5">
              <div className="size-9 rounded-lg border border-hairline bg-canvas text-ink flex items-center justify-center shrink-0">
                <LinkIcon icon={link.icon} />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <span className="block font-mono text-[10px] uppercase tracking-[1.2px] text-body-mid">
                  TARGET LINK
                </span>
                <p className="text-sm font-medium text-ink break-words">
                  {link.title}
                </p>
                {displayTarget && (
                  <p className="font-mono text-xs text-body-mid break-all">
                    {displayTarget}
                  </p>
                )}
              </div>
            </div>

            {/* 빨간색 경고 문구 */}
            <div
              role="note"
              className="flex items-center gap-2.5 rounded-lg border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-red-400"
            >
              <AlertTriangle className="size-4 shrink-0" strokeWidth={1.75} />
              <p className="text-sm font-medium text-red-400">
                이 작업은 되돌릴 수 없습니다
              </p>
            </div>

            {deleteError && (
              <p
                role="alert"
                className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 font-mono text-[11px] text-red-300"
              >
                {deleteError}
              </p>
            )}
          </div>
        )}

        <Separator className="my-4" />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => handleOpenChange(false)}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting || !link}
            aria-busy={isDeleting}
            onClick={() => void handleDelete()}
            className={isDeleting ? "disabled:opacity-80" : undefined}
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
            ) : (
              <Trash2 className="size-4" strokeWidth={1.5} />
            )}
            <span>삭제하기</span>
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
