"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  createAddLinkSchema,
  inferIconFromUrl,
  LINK_FIELD_LIMITS,
  LINK_ICON_OPTIONS,
  parseAndNormalizeLinkUrl,
  type AddLinkFormValues,
} from "@/lib/schemas/link";
import { useProfileStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const DEFAULT_FORM_VALUES: AddLinkFormValues = {
  title: "",
  url: "",
  description: "",
  buttonText: "",
  icon: "globe",
  isActive: true,
};

export interface AddedLinkSummary {
  title: string;
  isActive: boolean;
  endpointLabel: string;
}

interface AddLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded?: (summary: AddedLinkSummary) => void;
}

export function AddLinkDialog({
  open,
  onOpenChange,
  onAdded,
}: AddLinkDialogProps) {
  const links = useProfileStore((state) => state.profile.links);
  const addLink = useProfileStore((state) => state.addLink);

  const [hasManualIcon, setHasManualIcon] = useState(false);

  const schema = useMemo(() => createAddLinkSchema(links), [links]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddLinkFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const [watchedTitle, watchedUrl, watchedDescription, watchedButtonText] =
    useWatch({
      control,
      name: ["title", "url", "description", "buttonText"],
    });

  const nextOrder =
    links.reduce((max, item) => Math.max(max, item.order), 0) + 1;
  const nextEndpointLabel = `ENDPOINT ${String(nextOrder).padStart(2, "0")}`;

  const titleLength = (watchedTitle ?? "").trim().length;
  const descriptionLength = (watchedDescription ?? "").trim().length;
  const buttonTextLength = (watchedButtonText ?? "").trim().length;

  const previewUrl = parseAndNormalizeLinkUrl(watchedUrl ?? "");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset(DEFAULT_FORM_VALUES);
      setHasManualIcon(false);
    }
    onOpenChange(nextOpen);
  };

  const urlRegistration = register("url", {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!hasManualIcon) {
        setValue("icon", inferIconFromUrl(event.target.value), {
          shouldDirty: false,
        });
      }
    },
  });

  const onValidSubmit = (values: AddLinkFormValues) => {
    const parsedUrl = parseAndNormalizeLinkUrl(values.url);
    if (!parsedUrl.valid) return;

    addLink({
      title: values.title,
      url: parsedUrl.url,
      displayUrl: parsedUrl.displayUrl,
      description: values.description,
      buttonText: values.buttonText || "Open Link",
      icon: values.icon,
      isActive: values.isActive,
      clicks: 0,
    });

    onAdded?.({
      title: values.title,
      isActive: values.isActive,
      endpointLabel: nextEndpointLabel,
    });

    reset(DEFAULT_FORM_VALUES);
    setHasManualIcon(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPopup className="max-w-lg p-5 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 pb-1">
            <span className="font-mono text-[11px] uppercase tracking-[1.4px] text-body-mid">
              {"//"} NEW {nextEndpointLabel}
            </span>
            <Badge variant="default" className="text-[10px]">
              IN-MEMORY STATE
            </Badge>
          </div>
          <DialogTitle>새 링크 추가</DialogTitle>
          <DialogDescription>
            등록한 링크는 현재 세션의 로컬 메모리 상태에 즉시 반영됩니다.
            (새로고침 시 기본 더미 데이터로 초기화)
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4" />

        <form
          onSubmit={handleSubmit(onValidSubmit)}
          noValidate
          className="space-y-4"
        >
          {/* Title */}
          <div className="space-y-1.5">
            <label
              htmlFor="add-link-title"
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
              id="add-link-title"
              type="text"
              placeholder="예: GitHub Repository, 기술 블로그"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={
                errors.title ? "add-link-title-error" : undefined
              }
              autoFocus
              {...register("title")}
            />
            {errors.title?.message && (
              <p
                id="add-link-title-error"
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
              htmlFor="add-link-url"
              className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid"
            >
              <span>DESTINATION URL *</span>
              <span className="text-[10px] text-body-mid/70">HTTP(S) ONLY</span>
            </label>
            <Input
              id="add-link-url"
              type="url"
              placeholder="https://github.com/username"
              aria-invalid={Boolean(errors.url)}
              aria-describedby={errors.url ? "add-link-url-error" : undefined}
              {...urlRegistration}
            />
            {errors.url?.message ? (
              <p
                id="add-link-url-error"
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
              htmlFor="add-link-description"
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
              id="add-link-description"
              placeholder="링크에 대한 간단한 설명을 입력하세요 (선택, 최대 160자)"
              rows={2}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? "add-link-description-error" : undefined
              }
              {...register("description")}
            />
            {errors.description?.message && (
              <p
                id="add-link-description-error"
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
                      setHasManualIcon(true);
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
                htmlFor="add-link-button-text"
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
                id="add-link-button-text"
                type="text"
                placeholder="Open Link"
                aria-invalid={Boolean(errors.buttonText)}
                aria-describedby={
                  errors.buttonText ? "add-link-button-text-error" : undefined
                }
                {...register("buttonText")}
              />
              {errors.buttonText?.message && (
                <p
                  id="add-link-button-text-error"
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
              <div className="flex items-center justify-between rounded-lg border border-hairline bg-canvas-soft px-3.5 py-3">
                <div className="space-y-0.5">
                  <p className="font-mono text-[11px] uppercase tracking-[1.2px] text-ink">
                    PUBLIC VISIBILITY
                  </p>
                  <p className="text-xs text-body-mid">
                    {field.value
                      ? "추가 즉시 공개 프로필 페이지에 노출됩니다."
                      : "비공개(HIDDEN) 상태로 저장되어 목록에서만 관리됩니다."}
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

          <Separator />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" variant="default">
              <Plus className="size-4" strokeWidth={1.5} />
              <span>링크 추가</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
