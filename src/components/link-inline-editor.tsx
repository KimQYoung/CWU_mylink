"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { LinkFormFields } from "@/components/link-form-fields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FIRESTORE_LINKS_PATH,
  formatLinkTimestamp,
  getFirestoreErrorMessage,
  type UpdateAnonymousLinkInput,
} from "@/lib/firestore-links";
import {
  createEditLinkSchema,
  parseAndNormalizeLinkUrl,
  resolveLinkIconId,
  type LinkFormValues,
} from "@/lib/schemas/link";
import type { LinkItem } from "@/types";

interface LinkInlineEditorProps {
  link: LinkItem;
  endpointLabel: string;
  existingLinks: LinkItem[];
  onCancel: () => void;
  onSave: (id: string, input: UpdateAnonymousLinkInput) => Promise<void>;
}

const EDIT_VISIBILITY_DESCRIPTION = {
  active: "공개 프로필 페이지에 노출됩니다.",
  inactive: "비공개(HIDDEN) 상태로 저장되어 공개 페이지에서 숨겨집니다.",
};

/**
 * 링크 카드 내부에서 인라인으로 링크 정보를 수정하는 폼 컴포넌트
 * - 링크 추가 다이얼로그와 동일한 Zod 스키마 및 입력 검증 규칙을 사용합니다.
 */
export function LinkInlineEditor({
  link,
  endpointLabel,
  existingLinks,
  onCancel,
  onSave,
}: LinkInlineEditorProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formattedUpdatedAt = formatLinkTimestamp(link.updatedAt);

  const schema = useMemo(
    () => createEditLinkSchema(existingLinks, link.id),
    [existingLinks, link.id]
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      title: link.title,
      url: link.url ?? "",
      description: link.description ?? "",
      buttonText: link.buttonText ?? "Open Link",
      icon: resolveLinkIconId(link.icon),
      isActive: link.isActive,
    },
  });

  const onValidSubmit = async (values: LinkFormValues) => {
    const parsedUrl = parseAndNormalizeLinkUrl(values.url);
    if (!parsedUrl.valid) return;

    setSubmitError(null);

    try {
      await onSave(link.id, {
        title: values.title,
        url: parsedUrl.url,
        displayUrl: parsedUrl.displayUrl,
        description: values.description,
        buttonText: values.buttonText || "Open Link",
        icon: values.icon,
        isActive: values.isActive,
      });
    } catch (error) {
      setSubmitError(getFirestoreErrorMessage(error));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onValidSubmit)}
      noValidate
      className="space-y-4 w-full"
      aria-label={`${link.title} 인라인 수정 폼`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[1.4px] text-body-mid">
            {"//"} EDIT {endpointLabel}
          </span>
          <Badge variant="default" className="text-[10px]">
            INLINE EDIT
          </Badge>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-body-mid">
          {formattedUpdatedAt
            ? `UPDATED ${formattedUpdatedAt} · ${FIRESTORE_LINKS_PATH}`
            : FIRESTORE_LINKS_PATH}
        </span>
      </div>

      <Separator />

      <LinkFormFields
        idPrefix={`edit-link-${link.id}`}
        register={register}
        control={control}
        errors={errors}
        autoFocusTitle
        visibilityDescription={EDIT_VISIBILITY_DESCRIPTION}
        submitError={submitError}
      />

      <Separator />

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSubmitting}
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          <X className="size-3.5" strokeWidth={1.5} />
          <span>취소</span>
        </Button>
        <Button
          type="submit"
          variant="default"
          size="sm"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-3.5 animate-spin" strokeWidth={1.5} />
              <span>저장 중...</span>
            </>
          ) : (
            <>
              <Check className="size-3.5" strokeWidth={1.5} />
              <span>저장</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
