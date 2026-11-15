"use client";

import { type ChangeEvent, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Loader2,
  Save,
  SearchCheck,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import {
  checkDisplayNameAvailability,
  DuplicateDisplayNameError,
  getProfileFirestoreErrorMessage,
  getUserProfilePath,
  type FirestoreUserProfile,
} from "@/lib/firestore-profile";
import {
  hasProfileFormChanges,
  normalizeDisplayNameKey,
  PROFILE_FIELD_LIMITS,
  profileFormSchema,
  sanitizeDisplayName,
  type ProfileFormValues,
} from "@/lib/schemas/profile";
import { useProfileStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type DuplicateCheckStatus =
  | "idle"
  | "checking"
  | "available"
  | "same"
  | "taken"
  | "error";

interface DuplicateCheckState {
  status: DuplicateCheckStatus;
  checkedKey: string;
  message: string | null;
}

const INITIAL_CHECK_STATE: DuplicateCheckState = {
  status: "idle",
  checkedKey: "",
  message: null,
};

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (profile: FirestoreUserProfile) => void;
}

/**
 * 마이페이지 프로필 수정 모달
 * - Display Name 수정 및 Firestore 기반 실시간 중복 확인을 지원합니다.
 * - 한 줄 소개(Bio) 및 프로필 이미지 URL 수정을 제공합니다.
 */
export function EditProfileDialog({
  open,
  onOpenChange,
  onSaved,
}: EditProfileDialogProps) {
  const authUser = useProfileStore((state) => state.authUser);
  const profile = useProfileStore((state) => state.profile);
  const customProfile = useProfileStore((state) => state.customProfile);
  const saveProfile = useProfileStore((state) => state.saveProfile);

  const profilePath = getUserProfilePath(authUser?.uid);

  const [duplicateCheck, setDuplicateCheck] =
    useState<DuplicateCheckState>(INITIAL_CHECK_STATE);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formValues: ProfileFormValues = {
    displayName: profile.name,
    bio: profile.bio ?? "",
    avatarUrl: customProfile?.avatarUrl ?? authUser?.photoURL ?? "/avatar.png",
  };

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    setError,
    clearErrors,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: formValues,
    values: formValues,
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const [watchedDisplayName, watchedBio, watchedAvatarUrl] = useWatch({
    control,
    name: ["displayName", "bio", "avatarUrl"],
  });

  const displayNameLength = sanitizeDisplayName(watchedDisplayName ?? "").length;
  const bioLength = (watchedBio ?? "").trim().length;
  const currentNormalizedKey = normalizeDisplayNameKey(watchedDisplayName ?? "");
  const hasChanges = hasProfileFormChanges(
    {
      displayName: watchedDisplayName ?? "",
      bio: watchedBio ?? "",
      avatarUrl: watchedAvatarUrl ?? "",
    },
    formValues
  );
  const isCheckingDuplicate = duplicateCheck.status === "checking";
  const isBusy = isSubmitting || isCheckingDuplicate;

  const previewAvatarSrc =
    (watchedAvatarUrl ?? "").trim() || authUser?.photoURL || "/avatar.png";

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isSubmitting) return;
    if (!nextOpen) {
      reset(formValues);
      setDuplicateCheck(INITIAL_CHECK_STATE);
      setSubmitError(null);
    }
    onOpenChange(nextOpen);
  };

  const displayNameField = register("displayName");

  const handleDisplayNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    void displayNameField.onChange(event);
    setSubmitError(null);
    setDuplicateCheck(INITIAL_CHECK_STATE);
    if (errors.displayName?.type === "duplicate") {
      clearErrors("displayName");
    }
  };

  const handleCheckDuplicate = async () => {
    if (!authUser?.uid || isBusy) return;

    const isFieldValid = await trigger("displayName");
    if (!isFieldValid) {
      setDuplicateCheck(INITIAL_CHECK_STATE);
      return;
    }

    const rawDisplayName = getValues("displayName");
    const targetKey = normalizeDisplayNameKey(rawDisplayName);

    setSubmitError(null);
    setDuplicateCheck({
      status: "checking",
      checkedKey: targetKey,
      message: "Firestore에서 Display Name 사용 가능 여부를 확인 중입니다...",
    });

    try {
      const result = await checkDisplayNameAvailability(
        rawDisplayName,
        authUser.uid
      );
      if (normalizeDisplayNameKey(getValues("displayName")) !== targetKey) {
        return;
      }

      if (result.available) {
        clearErrors("displayName");
        setDuplicateCheck((current) =>
          current.status === "checking" && current.checkedKey === targetKey
            ? {
                status: result.isOwnCurrent ? "same" : "available",
                checkedKey: result.normalizedDisplayName,
                message: result.isOwnCurrent
                  ? "현재 회원님이 사용 중인 Display Name입니다."
                  : "사용 가능한 Display Name입니다.",
              }
            : current
        );
      } else {
        const takenMessage = "이미 다른 사용자가 사용 중인 Display Name입니다.";
        setDuplicateCheck((current) => {
          if (
            current.status !== "checking" ||
            current.checkedKey !== targetKey
          ) {
            return current;
          }
          return {
            status: "taken",
            checkedKey: result.normalizedDisplayName,
            message: takenMessage,
          };
        });
        setError("displayName", {
          type: "duplicate",
          message: takenMessage,
        });
      }
    } catch (error) {
      if (normalizeDisplayNameKey(getValues("displayName")) !== targetKey) {
        return;
      }
      const message = getProfileFirestoreErrorMessage(error, profilePath);
      setDuplicateCheck((current) =>
        current.status === "checking" && current.checkedKey === targetKey
          ? {
              status: "error",
              checkedKey: targetKey,
              message,
            }
          : current
      );
    }
  };

  const onValidSubmit = async (values: ProfileFormValues) => {
    if (!authUser?.uid) return;

    if (!hasProfileFormChanges(values, formValues)) {
      return;
    }

    const submittedKey = normalizeDisplayNameKey(values.displayName);
    if (
      duplicateCheck.status === "taken" &&
      duplicateCheck.checkedKey === submittedKey
    ) {
      setError("displayName", {
        type: "duplicate",
        message: "이미 다른 사용자가 사용 중인 Display Name입니다.",
      });
      return;
    }

    setSubmitError(null);

    try {
      const saved = await saveProfile({
        displayName: values.displayName,
        bio: values.bio,
        avatarUrl: values.avatarUrl,
      });

      reset({
        displayName: saved.displayName,
        bio: saved.bio,
        avatarUrl: saved.avatarUrl || authUser?.photoURL || "/avatar.png",
      });
      setDuplicateCheck(INITIAL_CHECK_STATE);
      onSaved?.(saved);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof DuplicateDisplayNameError) {
        setDuplicateCheck({
          status: "taken",
          checkedKey: submittedKey,
          message: error.message,
        });
        setError("displayName", {
          type: "duplicate",
          message: error.message,
        });
        return;
      }

      setSubmitError(getProfileFirestoreErrorMessage(error, profilePath));
    }
  };

  const showDuplicateStatusBanner =
    duplicateCheck.status !== "idle" &&
    duplicateCheck.status !== "taken" &&
    duplicateCheck.message &&
    (duplicateCheck.status === "checking" ||
      duplicateCheck.status === "error" ||
      duplicateCheck.checkedKey === currentNormalizedKey);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPopup
        className="max-w-lg p-5 sm:p-6"
        showCloseButton={!isSubmitting}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 pb-1">
            <span className="font-mono text-[11px] uppercase tracking-[1.4px] text-body-mid">
              {"//"} EDIT PROFILE
            </span>
            <Badge variant="default" className="text-[10px]">
              CLOUD FIRESTORE
            </Badge>
          </div>
          <DialogTitle>프로필 수정</DialogTitle>
          <DialogDescription>
            Display Name은 다른 사용자와 중복되지 않도록 Firestore(
            {profilePath})에 검증 후 저장됩니다.
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4" />

        <form
          onSubmit={handleSubmit(onValidSubmit)}
          noValidate
          className="space-y-4"
        >
          {/* 라이브 프로필 미리보기 */}
          <div className="flex items-center gap-3.5 rounded-lg border border-hairline bg-canvas-soft/60 p-3.5">
            <UserAvatar
              src={previewAvatarSrc}
              name={watchedDisplayName || profile.name}
              size={54}
            />
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="font-mono text-[10px] uppercase tracking-[1.2px] text-body-mid">
                LIVE PREVIEW
              </p>
              <p className="text-base font-normal text-ink truncate">
                {sanitizeDisplayName(watchedDisplayName ?? "") || profile.name}
              </p>
              <p className="font-mono text-xs text-body-mid truncate">
                {profile.callsign}
              </p>
            </div>
          </div>

          {/* Display Name + 중복 확인 */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-profile-display-name"
              className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid"
            >
              <span>DISPLAY NAME *</span>
              <span
                className={cn(
                  "text-[10px]",
                  displayNameLength >
                    PROFILE_FIELD_LIMITS.DISPLAY_NAME_MAX_LENGTH
                    ? "text-red-400"
                    : "text-body-mid/70"
                )}
              >
                {displayNameLength}/
                {PROFILE_FIELD_LIMITS.DISPLAY_NAME_MAX_LENGTH}
              </span>
            </label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input
                id="edit-profile-display-name"
                type="text"
                placeholder="예: 김규영, KimQYoung"
                aria-invalid={Boolean(errors.displayName)}
                aria-describedby={
                  errors.displayName
                    ? "edit-profile-display-name-error"
                    : undefined
                }
                autoFocus
                disabled={isSubmitting}
                className="flex-1"
                {...displayNameField}
                onChange={handleDisplayNameChange}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isBusy}
                aria-busy={isCheckingDuplicate}
                onClick={() => void handleCheckDuplicate()}
                className="h-10 sm:px-4 shrink-0"
              >
                {isCheckingDuplicate ? (
                  <Loader2 className="size-3.5 animate-spin" strokeWidth={1.5} />
                ) : (
                  <SearchCheck className="size-3.5" strokeWidth={1.5} />
                )}
                <span>중복 확인</span>
              </Button>
            </div>

            {errors.displayName?.message && (
              <p
                id="edit-profile-display-name-error"
                role="alert"
                className="flex items-center gap-1.5 font-mono text-[11px] text-red-400"
              >
                <AlertCircle className="size-3.5 shrink-0" strokeWidth={1.75} />
                <span>{errors.displayName.message}</span>
              </p>
            )}

            {!errors.displayName && showDuplicateStatusBanner && (
              <p
                role="status"
                aria-live="polite"
                className={cn(
                  "flex items-center gap-1.5 font-mono text-[11px]",
                  duplicateCheck.status === "available" ||
                    duplicateCheck.status === "same"
                    ? "text-emerald-400"
                    : duplicateCheck.status === "error"
                    ? "text-amber-300"
                    : "text-body-mid"
                )}
              >
                {(duplicateCheck.status === "available" ||
                  duplicateCheck.status === "same") && (
                  <CheckCircle2
                    className="size-3.5 shrink-0"
                    strokeWidth={1.75}
                  />
                )}
                {duplicateCheck.status === "error" && (
                  <AlertCircle
                    className="size-3.5 shrink-0"
                    strokeWidth={1.75}
                  />
                )}
                {duplicateCheck.status === "checking" && (
                  <Loader2
                    className="size-3.5 animate-spin shrink-0"
                    strokeWidth={1.75}
                  />
                )}
                <span>{duplicateCheck.message}</span>
              </p>
            )}
          </div>

          {/* 한 줄 소개 (Bio) */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-profile-bio"
              className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid"
            >
              <span>BIO (OPTIONAL)</span>
              <span
                className={cn(
                  "text-[10px]",
                  bioLength > PROFILE_FIELD_LIMITS.BIO_MAX_LENGTH
                    ? "text-red-400"
                    : "text-body-mid/70"
                )}
              >
                {bioLength}/{PROFILE_FIELD_LIMITS.BIO_MAX_LENGTH}
              </span>
            </label>
            <Textarea
              id="edit-profile-bio"
              rows={3}
              placeholder="자신을 소개하는 짧은 문구를 입력해 주세요 (선택, 최대 160자)"
              aria-invalid={Boolean(errors.bio)}
              aria-describedby={
                errors.bio ? "edit-profile-bio-error" : undefined
              }
              disabled={isSubmitting}
              {...register("bio")}
            />
            {errors.bio?.message && (
              <p
                id="edit-profile-bio-error"
                role="alert"
                className="font-mono text-[11px] text-red-400"
              >
                {errors.bio.message}
              </p>
            )}
          </div>

          {/* 프로필 이미지 URL */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="edit-profile-avatar-url"
                className="font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid"
              >
                AVATAR IMAGE URL (OPTIONAL)
              </label>

              <div className="flex items-center gap-1.5">
                {authUser?.photoURL && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="xs"
                    disabled={isSubmitting}
                    onClick={() =>
                      setValue("avatarUrl", authUser.photoURL ?? "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className="font-mono text-[10px]"
                  >
                    {(watchedAvatarUrl ?? "").trim() === authUser.photoURL && (
                      <Check className="size-3 text-emerald-400" strokeWidth={1.75} />
                    )}
                    <span>Google 사진</span>
                  </Button>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="xs"
                  disabled={isSubmitting}
                  onClick={() =>
                    setValue("avatarUrl", "/avatar.png", {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className="font-mono text-[10px]"
                >
                  {(watchedAvatarUrl ?? "").trim() === "/avatar.png" && (
                    <Check className="size-3 text-emerald-400" strokeWidth={1.75} />
                  )}
                  <span>기본 아바타</span>
                </Button>
              </div>
            </div>

            <Input
              id="edit-profile-avatar-url"
              type="url"
              placeholder="https://... 또는 /avatar.png (비워두면 Google 사진 사용)"
              aria-invalid={Boolean(errors.avatarUrl)}
              aria-describedby={
                errors.avatarUrl ? "edit-profile-avatar-url-error" : undefined
              }
              disabled={isSubmitting}
              {...register("avatarUrl")}
            />
            {errors.avatarUrl?.message && (
              <p
                id="edit-profile-avatar-url-error"
                role="alert"
                className="font-mono text-[11px] text-red-400"
              >
                {errors.avatarUrl.message}
              </p>
            )}
          </div>

          {submitError && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 font-mono text-[11px] text-red-300"
            >
              {submitError}
            </p>
          )}

          <Separator />

          <DialogFooter>
            {!hasChanges && (
              <span className="font-mono text-[11px] text-body-mid sm:mr-auto text-center sm:text-left">
                변경된 사항이 없습니다.
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting || isCheckingDuplicate || !hasChanges}
              aria-busy={isSubmitting}
              className={isSubmitting ? "disabled:opacity-80" : undefined}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <Save className="size-4" strokeWidth={1.5} />
              )}
              <span>저장하기</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
