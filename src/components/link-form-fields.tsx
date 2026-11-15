"use client";

import type { ChangeEvent } from "react";
import {
  Controller,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { LinkIcon } from "@/components/link-icon";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  LINK_FIELD_LIMITS,
  LINK_ICON_OPTIONS,
  parseAndNormalizeLinkUrl,
  type LinkFormValues,
} from "@/lib/schemas/link";
import { cn } from "@/lib/utils";

interface LinkFormFieldsProps {
  idPrefix: string;
  register: UseFormRegister<LinkFormValues>;
  control: Control<LinkFormValues>;
  errors: FieldErrors<LinkFormValues>;
  autoFocusTitle?: boolean;
  onUrlChange?: (nextUrl: string) => void;
  onIconManualSelect?: () => void;
  visibilityDescription?: {
    active: string;
    inactive: string;
  };
  submitError?: string | null;
}

const DEFAULT_VISIBILITY_DESCRIPTION = {
  active: "추가 즉시 공개 프로필 페이지에 노출됩니다.",
  inactive: "비공개(HIDDEN) 상태로 저장되어 목록에서만 관리됩니다.",
};

/**
 * 링크 추가 다이얼로그와 인라인 편집 폼이 공통으로 사용하는 입력 필드 및 검증 메시지 컴포넌트
 */
export function LinkFormFields({
  idPrefix,
  register,
  control,
  errors,
  autoFocusTitle = false,
  onUrlChange,
  onIconManualSelect,
  visibilityDescription = DEFAULT_VISIBILITY_DESCRIPTION,
  submitError,
}: LinkFormFieldsProps) {
  const [watchedTitle, watchedUrl, watchedDescription, watchedButtonText] =
    useWatch({
      control,
      name: ["title", "url", "description", "buttonText"],
    });

  const titleLength = (watchedTitle ?? "").trim().length;
  const descriptionLength = (watchedDescription ?? "").trim().length;
  const buttonTextLength = (watchedButtonText ?? "").trim().length;
  const previewUrl = parseAndNormalizeLinkUrl(watchedUrl ?? "");

  const urlRegistration = register("url", {
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      onUrlChange?.(event.target.value);
    },
  });

  const titleId = `${idPrefix}-title`;
  const urlId = `${idPrefix}-url`;
  const descriptionId = `${idPrefix}-description`;
  const buttonTextId = `${idPrefix}-button-text`;

  return (
    <>
      {/* Title */}
      <div className="space-y-1.5">
        <label
          htmlFor={titleId}
          className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid"
        >
          <span>TITLE *</span>
          <span
            className={cn(
              "text-[10px]",
              titleLength > LINK_FIELD_LIMITS.TITLE_MAX_LENGTH
                ? "text-red-400"
                : "text-body-mid/70"
            )}
          >
            {titleLength}/{LINK_FIELD_LIMITS.TITLE_MAX_LENGTH}
          </span>
        </label>
        <Input
          id={titleId}
          type="text"
          placeholder="예: GitHub Repository, 기술 블로그"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? `${titleId}-error` : undefined}
          autoFocus={autoFocusTitle}
          {...register("title")}
        />
        {errors.title?.message && (
          <p
            id={`${titleId}-error`}
            role="alert"
            className="font-mono text-[11px] text-red-400"
          >
            {errors.title.message}
          </p>
        )}
      </div>

      {/* URL */}
      <div className="space-y-1.5">
        <label
          htmlFor={urlId}
          className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid"
        >
          <span>DESTINATION URL *</span>
          <span className="text-[10px] text-body-mid/70">HTTP(S) ONLY</span>
        </label>
        <Input
          id={urlId}
          type="url"
          placeholder="https://github.com/username"
          aria-invalid={Boolean(errors.url)}
          aria-describedby={errors.url ? `${urlId}-error` : undefined}
          {...urlRegistration}
        />
        {errors.url?.message ? (
          <p
            id={`${urlId}-error`}
            role="alert"
            className="font-mono text-[11px] text-red-400"
          >
            {errors.url.message}
          </p>
        ) : (
          previewUrl.valid && (
            <p className="font-mono text-[11px] text-body-mid truncate">
              DISPLAY: {previewUrl.displayUrl}
            </p>
          )
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label
          htmlFor={descriptionId}
          className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid"
        >
          <span>DESCRIPTION (OPTIONAL)</span>
          <span
            className={cn(
              "text-[10px]",
              descriptionLength > LINK_FIELD_LIMITS.DESCRIPTION_MAX_LENGTH
                ? "text-red-400"
                : "text-body-mid/70"
            )}
          >
            {descriptionLength}/{LINK_FIELD_LIMITS.DESCRIPTION_MAX_LENGTH}
          </span>
        </label>
        <Textarea
          id={descriptionId}
          placeholder="링크에 대한 간단한 설명을 입력하세요 (선택, 최대 160자)"
          rows={2}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? `${descriptionId}-error` : undefined
          }
          {...register("description")}
        />
        {errors.description?.message && (
          <p
            id={`${descriptionId}-error`}
            role="alert"
            className="font-mono text-[11px] text-red-400"
          >
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Icon + Button Text */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <span className="block font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid">
            ICON
          </span>
          <Controller
            control={control}
            name="icon"
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={(nextValue) => {
                  field.onChange(nextValue);
                  onIconManualSelect?.();
                }}
                aria-label="링크 아이콘 선택"
                className="grid-cols-4"
              >
                {LINK_ICON_OPTIONS.map((option) => (
                  <RadioItem
                    key={option.id}
                    value={option.id}
                    aria-label={option.label}
                    title={option.label}
                  >
                    <LinkIcon icon={option.id} />
                  </RadioItem>
                ))}
              </RadioGroup>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={buttonTextId}
            className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid"
          >
            <span>CTA LABEL</span>
            <span
              className={cn(
                "text-[10px]",
                buttonTextLength > LINK_FIELD_LIMITS.BUTTON_TEXT_MAX_LENGTH
                  ? "text-red-400"
                  : "text-body-mid/70"
              )}
            >
              {buttonTextLength}/{LINK_FIELD_LIMITS.BUTTON_TEXT_MAX_LENGTH}
            </span>
          </label>
          <Input
            id={buttonTextId}
            type="text"
            placeholder="Open Link"
            aria-invalid={Boolean(errors.buttonText)}
            aria-describedby={
              errors.buttonText ? `${buttonTextId}-error` : undefined
            }
            {...register("buttonText")}
          />
          {errors.buttonText?.message && (
            <p
              id={`${buttonTextId}-error`}
              role="alert"
              className="font-mono text-[11px] text-red-400"
            >
              {errors.buttonText.message}
            </p>
          )}
        </div>
      </div>

      {/* Visibility Switch */}
      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-canvas-soft px-3.5 py-3">
            <div className="space-y-0.5">
              <p className="font-mono text-[11px] uppercase tracking-[1.2px] text-ink">
                PUBLIC VISIBILITY
              </p>
              <p className="text-xs text-body-mid">
                {field.value
                  ? visibilityDescription.active
                  : visibilityDescription.inactive}
              </p>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer select-none shrink-0">
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-label="공개 여부 설정"
              />
              <span className="font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid w-14 text-right">
                {field.value ? "VISIBLE" : "HIDDEN"}
              </span>
            </label>
          </div>
        )}
      />

      {submitError && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 font-mono text-[11px] text-red-300"
        >
          {submitError}
        </p>
      )}
    </>
  );
}
