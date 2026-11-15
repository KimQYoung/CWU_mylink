"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { LinkFormFields } from "@/components/link-form-fields";
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
import {
  createAddLinkSchema,
  inferIconFromUrl,
  parseAndNormalizeLinkUrl,
  type LinkFormValues,
} from "@/lib/schemas/link";
import { useProfileStore } from "@/lib/store";

const DEFAULT_FORM_VALUES: LinkFormValues = {
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
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(() => createAddLinkSchema(links), [links]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const nextOrder =
    links.reduce((max, item) => Math.max(max, item.order), 0) + 1;
  const nextEndpointLabel = `ENDPOINT ${String(nextOrder).padStart(2, "0")}`;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isSubmitting) return;
    if (!nextOpen) {
      reset(DEFAULT_FORM_VALUES);
      setHasManualIcon(false);
      setSubmitError(null);
    }
    onOpenChange(nextOpen);
  };

  const onValidSubmit = async (values: LinkFormValues) => {
    const parsedUrl = parseAndNormalizeLinkUrl(values.url);
    if (!parsedUrl.valid) return;

    setSubmitError(null);

    try {
      const created = await addLink({
        title: values.title,
        url: parsedUrl.url,
        displayUrl: parsedUrl.displayUrl,
        endpointLabel: nextEndpointLabel,
        description: values.description,
        buttonText: values.buttonText || "Open Link",
        icon: values.icon,
        isActive: values.isActive,
        clicks: 0,
      });

      onAdded?.({
        title: created.title,
        isActive: created.isActive,
        endpointLabel: created.endpointLabel ?? nextEndpointLabel,
      });

      reset(DEFAULT_FORM_VALUES);
      setHasManualIcon(false);
      onOpenChange(false);
    } catch (error) {
      setSubmitError(getFirestoreErrorMessage(error));
    }
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
              CLOUD FIRESTORE
            </Badge>
          </div>
          <DialogTitle>새 링크 추가</DialogTitle>
          <DialogDescription>
            등록한 링크는 Cloud Firestore ({FIRESTORE_LINKS_PATH})에 저장되며
            저장 후 목록이 갱신됩니다.
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4" />

        <form
          onSubmit={handleSubmit(onValidSubmit)}
          noValidate
          className="space-y-4"
        >
          <LinkFormFields
            idPrefix="add-link"
            register={register}
            control={control}
            errors={errors}
            autoFocusTitle
            onUrlChange={(nextUrl) => {
              if (!hasManualIcon) {
                setValue("icon", inferIconFromUrl(nextUrl), {
                  shouldDirty: false,
                });
              }
            }}
            onIconManualSelect={() => setHasManualIcon(true)}
            submitError={submitError}
          />

          <Separator />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" variant="default" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
                  <span>저장 중...</span>
                </>
              ) : (
                <>
                  <Plus className="size-4" strokeWidth={1.5} />
                  <span>링크 추가</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
