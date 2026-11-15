"use client";

import { useMemo } from "react";
import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  createUserLink,
  deleteUserLink,
  fetchUserLinks,
  getFirestoreErrorMessage,
  getUserLinksPath,
  incrementUserLinkClicks,
  sortLinksByCreatedAtDesc,
  updateUserLink,
  updateUserLinkActive,
  type UpdateUserLinkInput,
} from "@/lib/firestore-links";
import {
  checkDisplayNameAvailability,
  DisplayNamePermissionError,
  fetchUserProfile,
  findUserByDisplayName,
  getProfileFirestoreErrorMessage,
  getUserProfilePath,
  saveUserProfile,
  type DisplayNameCheckResult,
  type FirestoreUserProfile,
  type ResolvedPublicUser,
  type SaveUserProfileInput,
} from "@/lib/firestore-profile";
import {
  normalizeDisplayNameKey,
  parseProfileAvatarUrl,
  sanitizeDisplayName,
} from "@/lib/schemas/profile";
import {
  buildProfileForAuthUser,
  useProfileStore,
  type FirestoreSyncStatus,
} from "@/lib/store";
import type { LinkItem } from "@/types";

export const userQueryKeys = {
  all: ["user"] as const,
  links: (uid: string) => ["user", uid, "links"] as const,
  profile: (uid: string) => ["user", uid, "profile"] as const,
  publicUserByDisplayName: (normalizedKey: string, authScope: string) =>
    ["public-user", "displayName", normalizedKey, authScope] as const,
  linkMutations: ["user-link-mutation"] as const,
  profileMutations: ["user-profile-mutation"] as const,
};

function requireAuthenticatedUid(): string {
  const uid = useProfileStore.getState().authUser?.uid;
  if (!uid) {
    throw new Error("로그인이 필요합니다. Google 계정으로 먼저 로그인해 주세요.");
  }
  return uid;
}

function upsertLinkById(links: LinkItem[], target: LinkItem): LinkItem[] {
  const exists = links.some((link) => link.id === target.id);
  if (exists) {
    return links.map((link) => (link.id === target.id ? target : link));
  }
  return [target, ...links];
}

/**
 * Firestore `users/{uid}/links` 비실시간 단건 조회 쿼리 훅
 */
export function useUserLinksQuery(uid?: string | null) {
  const normalizedUid = uid?.trim() || "";
  return useQuery<LinkItem[]>({
    queryKey: normalizedUid
      ? userQueryKeys.links(normalizedUid)
      : ["user", "guest", "links"],
    queryFn: () => fetchUserLinks(normalizedUid),
    enabled: Boolean(normalizedUid),
  });
}

/**
 * Firestore `users/{uid}` 사용자 프로필 비실시간 단건 조회 쿼리 훅
 */
export function useUserProfileQuery(uid?: string | null) {
  const normalizedUid = uid?.trim() || "";
  return useQuery<FirestoreUserProfile | null>({
    queryKey: normalizedUid
      ? userQueryKeys.profile(normalizedUid)
      : ["user", "guest", "profile"],
    queryFn: () => fetchUserProfile(normalizedUid),
    enabled: Boolean(normalizedUid),
  });
}

/**
 * Display Name으로 Firestore에서 공개 프로필 사용자(`uid` + 프로필)를 검색하는 쿼리 훅
 */
export function usePublicUserByDisplayNameQuery(
  displayName?: string | null,
  authScope: string = "guest"
) {
  const normalizedKey = normalizeDisplayNameKey(displayName ?? "");
  return useQuery<ResolvedPublicUser | null>({
    queryKey: userQueryKeys.publicUserByDisplayName(normalizedKey, authScope),
    queryFn: () => findUserByDisplayName(displayName ?? ""),
    enabled: Boolean(normalizedKey) && isFirebaseConfigured(),
    retry: (failureCount, error) =>
      !(error instanceof DisplayNamePermissionError) && failureCount < 1,
  });
}

/**
 * 현재 로그인 세션과 TanStack Query 캐시를 결합해 화면 표시용 프로필과 상태를 반환합니다.
 */
export function useResolvedUserProfile() {
  const authStatus = useProfileStore((state) => state.authStatus);
  const authUser = useProfileStore((state) => state.authUser);
  const theme = useProfileStore((state) => state.theme);
  const analytics = useProfileStore((state) => state.analytics);
  const updatingLinkIds = useProfileStore((state) => state.updatingLinkIds);
  const firestoreMutationError = useProfileStore(
    (state) => state.firestoreMutationError
  );
  const profileMutationError = useProfileStore(
    (state) => state.profileMutationError
  );

  const uid = authStatus === "authenticated" ? authUser?.uid : undefined;
  const linksPath = getUserLinksPath(uid);
  const profilePath = getUserProfilePath(uid);

  const linksQuery = useUserLinksQuery(uid);
  const profileQuery = useUserProfileQuery(uid);
  const mutatingLinksCount = useIsMutating({
    mutationKey: userQueryKeys.linkMutations,
  });
  const mutatingProfileCount = useIsMutating({
    mutationKey: userQueryKeys.profileMutations,
  });

  const links = useMemo(() => linksQuery.data ?? [], [linksQuery.data]);
  const customProfile = profileQuery.data ?? null;

  const profile = useMemo(() => {
    const built = buildProfileForAuthUser(
      authUser,
      links,
      analytics,
      customProfile
    );
    return {
      ...built,
      theme,
    };
  }, [authUser, links, analytics, customProfile, theme]);

  const isLoadingLinks =
    Boolean(uid) &&
    (linksQuery.isPending || linksQuery.isFetching || mutatingLinksCount > 0);

  const firestoreError = linksQuery.isError
    ? getFirestoreErrorMessage(linksQuery.error, linksPath)
    : firestoreMutationError;

  const firestoreStatus: FirestoreSyncStatus = !uid
    ? "idle"
    : firestoreError
    ? "error"
    : isLoadingLinks
    ? "syncing"
    : "connected";

  const isProfileLoading = Boolean(uid) && profileQuery.isPending;
  const isSavingProfile = Boolean(uid) && mutatingProfileCount > 0;
  const profileError = profileQuery.isError
    ? getProfileFirestoreErrorMessage(profileQuery.error, profilePath)
    : profileMutationError;

  const refetchLinks = async () => {
    if (!uid) return;
    useProfileStore.getState().setFirestoreMutationError(null);
    await linksQuery.refetch();
  };

  const refetchProfile = async () => {
    if (!uid) return;
    useProfileStore.getState().setProfileMutationError(null);
    await profileQuery.refetch();
  };

  const clearProfileError = () => {
    useProfileStore.getState().setProfileMutationError(null);
  };

  return {
    authStatus,
    authUser,
    profile,
    customProfile,
    links,
    firestoreStatus,
    firestoreError,
    isLoadingLinks,
    isProfileLoading,
    isSavingProfile,
    profileError,
    updatingLinkIds,
    refetchLinks,
    refetchProfile,
    clearProfileError,
  };
}

/**
 * 새 링크를 Firestore에 추가하고 TanStack Query 링크 캐시를 무효화합니다.
 */
export function useAddLinkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: userQueryKeys.linkMutations,
    mutationFn: async (newLink: Omit<LinkItem, "id" | "order">) => {
      const uid = requireAuthenticatedUid();
      const cachedLinks =
        queryClient.getQueryData<LinkItem[]>(userQueryKeys.links(uid)) ?? [];
      const nextOrder =
        cachedLinks.reduce((max, item) => Math.max(max, item.order), 0) + 1;
      const endpointLabel =
        newLink.endpointLabel ??
        `ENDPOINT ${String(nextOrder).padStart(2, "0")}`;

      useProfileStore.getState().setFirestoreMutationError(null);
      const created = await createUserLink(uid, {
        title: newLink.title,
        url: newLink.url ?? "",
        displayUrl: newLink.displayUrl ?? "",
        endpointLabel,
        description: newLink.description,
        buttonText: newLink.buttonText,
        icon: newLink.icon ?? "globe",
        isActive: newLink.isActive,
        order: nextOrder,
        clicks: newLink.clicks ?? 0,
      });

      return { uid, created };
    },
    onSuccess: async ({ uid, created }) => {
      queryClient.setQueryData<LinkItem[]>(
        userQueryKeys.links(uid),
        (current = []) =>
          sortLinksByCreatedAtDesc(upsertLinkById(current, created))
      );
      try {
        await queryClient.invalidateQueries({
          queryKey: userQueryKeys.links(uid),
        });
      } catch {
        // 재조회 실패 시 낙관적으로 반영된 캐시 상태를 유지합니다.
      }
    },
    onError: (error) => {
      const uid = useProfileStore.getState().authUser?.uid;
      useProfileStore
        .getState()
        .setFirestoreMutationError(
          getFirestoreErrorMessage(error, getUserLinksPath(uid))
        );
    },
  });
}

/**
 * 기존 링크를 Firestore에서 수정하고 TanStack Query 링크 캐시를 갱신합니다.
 */
export function useUpdateLinkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: userQueryKeys.linkMutations,
    onMutate: ({ id }: { id: string; input: UpdateUserLinkInput }) => {
      useProfileStore.getState().setFirestoreMutationError(null);
      useProfileStore.getState().addUpdatingLinkId(id);
    },
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateUserLinkInput;
    }) => {
      const uid = requireAuthenticatedUid();
      const cachedLinks =
        queryClient.getQueryData<LinkItem[]>(userQueryKeys.links(uid)) ?? [];
      const target = cachedLinks.find((link) => link.id === id);
      if (!target) {
        throw new Error("수정할 Firestore 링크 문서를 찾을 수 없습니다.");
      }

      const buttonText = input.buttonText.trim() || "Open Link";
      const icon = input.icon || "globe";

      await updateUserLink(uid, id, {
        ...input,
        buttonText,
        icon,
      });

      const updatedLink: LinkItem = {
        ...target,
        title: input.title,
        url: input.url,
        displayUrl: input.displayUrl,
        description: input.description,
        buttonText,
        icon,
        isActive: input.isActive,
        updatedAt: Date.now(),
      };

      return { uid, id, updatedLink };
    },
    onSuccess: async ({ uid, id, updatedLink }) => {
      queryClient.setQueryData<LinkItem[]>(
        userQueryKeys.links(uid),
        (current = []) =>
          sortLinksByCreatedAtDesc(
            current.map((link) => (link.id === id ? updatedLink : link))
          )
      );
      try {
        await queryClient.invalidateQueries({
          queryKey: userQueryKeys.links(uid),
        });
      } catch {
        // 재조회 실패 시 낙관적으로 반영된 캐시 상태를 유지합니다.
      }
    },
    onError: (error) => {
      const uid = useProfileStore.getState().authUser?.uid;
      useProfileStore
        .getState()
        .setFirestoreMutationError(
          getFirestoreErrorMessage(error, getUserLinksPath(uid))
        );
    },
    onSettled: (_data, _error, { id }) => {
      useProfileStore.getState().removeUpdatingLinkId(id);
    },
  });
}

/**
 * Firestore 링크 문서를 삭제하고 TanStack Query 링크 캐시에서 제거합니다.
 */
export function useDeleteLinkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: userQueryKeys.linkMutations,
    onMutate: (id: string) => {
      useProfileStore.getState().setFirestoreMutationError(null);
      useProfileStore.getState().addUpdatingLinkId(id);
    },
    mutationFn: async (id: string) => {
      const uid = requireAuthenticatedUid();
      const cachedLinks =
        queryClient.getQueryData<LinkItem[]>(userQueryKeys.links(uid)) ?? [];
      const exists = cachedLinks.some((link) => link.id === id);
      if (!exists) {
        throw new Error("삭제할 Firestore 링크 문서를 찾을 수 없습니다.");
      }

      await deleteUserLink(uid, id);
      return { uid, id };
    },
    onSuccess: async ({ uid, id }) => {
      queryClient.setQueryData<LinkItem[]>(
        userQueryKeys.links(uid),
        (current = []) => current.filter((link) => link.id !== id)
      );
      try {
        await queryClient.invalidateQueries({
          queryKey: userQueryKeys.links(uid),
        });
      } catch {
        // 재조회 실패 시 로컬 캐시에서 제거된 상태를 유지합니다.
      }
    },
    onError: (error) => {
      const uid = useProfileStore.getState().authUser?.uid;
      useProfileStore
        .getState()
        .setFirestoreMutationError(
          getFirestoreErrorMessage(error, getUserLinksPath(uid))
        );
    },
    onSettled: (_data, _error, id) => {
      useProfileStore.getState().removeUpdatingLinkId(id);
    },
  });
}

/**
 * 링크의 공개 활성화 상태를 낙관적으로 전환하고 실패 시 캐시를 롤백합니다.
 */
export function useToggleLinkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async (id: string) => {
      const uid = requireAuthenticatedUid();
      const store = useProfileStore.getState();
      if (store.updatingLinkIds.includes(id)) {
        return null;
      }

      const previousLinks =
        queryClient.getQueryData<LinkItem[]>(userQueryKeys.links(uid)) ?? [];
      const target = previousLinks.find((link) => link.id === id);
      if (!target) {
        return null;
      }

      const nextIsActive = !target.isActive;
      store.setFirestoreMutationError(null);
      store.addUpdatingLinkId(id);

      await queryClient.cancelQueries({ queryKey: userQueryKeys.links(uid) });
      queryClient.setQueryData<LinkItem[]>(
        userQueryKeys.links(uid),
        (current = []) =>
          sortLinksByCreatedAtDesc(
            current.map((link) =>
              link.id === id
                ? { ...link, isActive: nextIsActive, updatedAt: Date.now() }
                : link
            )
          )
      );

      return { uid, id, nextIsActive, previousLinks };
    },
    mutationFn: async (id: string) => {
      const uid = requireAuthenticatedUid();
      const cachedLinks =
        queryClient.getQueryData<LinkItem[]>(userQueryKeys.links(uid)) ?? [];
      const target = cachedLinks.find((link) => link.id === id);
      if (!target) return;
      await updateUserLinkActive(uid, id, target.isActive);
    },
    onError: (error, _id, context) => {
      if (context) {
        queryClient.setQueryData(
          userQueryKeys.links(context.uid),
          context.previousLinks
        );
        useProfileStore
          .getState()
          .setFirestoreMutationError(
            getFirestoreErrorMessage(error, getUserLinksPath(context.uid))
          );
      }
    },
    onSettled: (_data, _error, id) => {
      useProfileStore.getState().removeUpdatingLinkId(id);
    },
  });
}

interface RecordLinkClickInput {
  linkId: string;
  targetUid?: string | null;
}

/**
 * 링크 클릭 시 캐시 카운터를 즉시 증가시키고 Firestore 클릭 수를 원자적으로 +1 합니다.
 */
export function useRecordLinkClickMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: ({ linkId, targetUid }: RecordLinkClickInput) => {
      const uid =
        targetUid?.trim() || useProfileStore.getState().authUser?.uid || null;
      if (!uid) return { uid: null, hasTarget: false, isOwnUser: false };

      const isOwnUser = uid === useProfileStore.getState().authUser?.uid;
      const cachedLinks =
        queryClient.getQueryData<LinkItem[]>(userQueryKeys.links(uid)) ?? [];
      const hasTarget = cachedLinks.some((link) => link.id === linkId);
      if (!hasTarget) return { uid, hasTarget: false, isOwnUser };

      queryClient.setQueryData<LinkItem[]>(
        userQueryKeys.links(uid),
        (current = []) =>
          sortLinksByCreatedAtDesc(
            current.map((link) =>
              link.id === linkId
                ? { ...link, clicks: (link.clicks ?? 0) + 1 }
                : link
            )
          )
      );
      if (isOwnUser) {
        useProfileStore.getState().recordClickAnalytics();
      }

      return { uid, hasTarget: true, isOwnUser };
    },
    mutationFn: async ({ linkId, targetUid }: RecordLinkClickInput) => {
      const uid =
        targetUid?.trim() || useProfileStore.getState().authUser?.uid || null;
      if (!uid) return;
      const cachedLinks =
        queryClient.getQueryData<LinkItem[]>(userQueryKeys.links(uid)) ?? [];
      if (!cachedLinks.some((link) => link.id === linkId)) return;
      await incrementUserLinkClicks(uid, linkId);
    },
    onError: (error, _variables, context) => {
      if (!context?.isOwnUser) {
        return;
      }
      const uid = context.uid ?? useProfileStore.getState().authUser?.uid;
      useProfileStore
        .getState()
        .setFirestoreMutationError(
          getFirestoreErrorMessage(error, getUserLinksPath(uid))
        );
    },
  });
}

/**
 * 페이지별 링크 CRUD 및 클릭 기록 액션을 일괄 제공하는 편의 훅
 */
export function useLinkActions() {
  const addMutation = useAddLinkMutation();
  const updateMutation = useUpdateLinkMutation();
  const deleteMutation = useDeleteLinkMutation();
  const toggleMutation = useToggleLinkMutation();
  const clickMutation = useRecordLinkClickMutation();

  return {
    addLink: (input: Omit<LinkItem, "id" | "order">) =>
      addMutation.mutateAsync(input),
    updateLink: async (id: string, input: UpdateUserLinkInput) => {
      const result = await updateMutation.mutateAsync({ id, input });
      return result.updatedLink;
    },
    deleteLink: async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    toggleLink: (id: string) => {
      const updatingIds = useProfileStore.getState().updatingLinkIds;
      if (updatingIds.includes(id)) return;
      toggleMutation.mutate(id);
    },
    recordLinkClick: (linkId: string, targetUid?: string | null) => {
      clickMutation.mutate({ linkId, targetUid });
    },
  };
}

/**
 * Display Name 중복 확인을 명시적 버튼 클릭 시 실행하는 Mutation 훅
 */
export function useCheckDisplayNameMutation() {
  return useMutation<
    DisplayNameCheckResult,
    unknown,
    { displayName: string; uid: string }
  >({
    mutationFn: ({ displayName, uid }) =>
      checkDisplayNameAvailability(displayName, uid),
  });
}

interface SaveProfileOptimisticContext {
  uid: string;
  previousProfile: FirestoreUserProfile | null | undefined;
  previousAuthDisplayName: string | null;
}

interface UseSaveProfileMutationOptions {
  onRollback?: (errorMessage: string) => void;
}

/**
 * 사용자 프로필을 낙관적 업데이트로 즉시 화면에 반영한 뒤 Firestore에 저장합니다.
 * 저장 실패 시 이전 프로필 캐시와 인증 표시 이름으로 자동 롤백합니다.
 */
export function useSaveProfileMutation(
  options?: UseSaveProfileMutationOptions
) {
  const queryClient = useQueryClient();

  return useMutation<
    FirestoreUserProfile,
    unknown,
    Omit<SaveUserProfileInput, "email">,
    SaveProfileOptimisticContext
  >({
    mutationKey: userQueryKeys.profileMutations,
    onMutate: async (input) => {
      const uid = requireAuthenticatedUid();
      const authUser = useProfileStore.getState().authUser;

      await queryClient.cancelQueries({ queryKey: userQueryKeys.profile(uid) });

      const previousProfile = queryClient.getQueryData<
        FirestoreUserProfile | null
      >(userQueryKeys.profile(uid));
      const previousAuthDisplayName = authUser?.displayName ?? null;

      const cleanedDisplayName = sanitizeDisplayName(input.displayName);
      const normalizedDisplayName = normalizeDisplayNameKey(cleanedDisplayName);
      const cleanedBio = input.bio.trim();
      const parsedAvatar = parseProfileAvatarUrl(input.avatarUrl);
      const cleanedAvatarUrl = parsedAvatar.valid
        ? parsedAvatar.url
        : input.avatarUrl.trim();

      const optimisticProfile: FirestoreUserProfile = {
        displayName: cleanedDisplayName,
        normalizedDisplayName,
        bio: cleanedBio,
        avatarUrl: cleanedAvatarUrl,
        ...(authUser?.email ? { email: authUser.email } : {}),
        updatedAt: Date.now(),
      };

      useProfileStore.getState().setProfileMutationError(null);
      queryClient.setQueryData(userQueryKeys.profile(uid), optimisticProfile);
      useProfileStore.getState().setAuthDisplayName(cleanedDisplayName);

      return {
        uid,
        previousProfile,
        previousAuthDisplayName,
      };
    },
    mutationFn: async (input) => {
      const uid = requireAuthenticatedUid();
      const authUser = useProfileStore.getState().authUser;
      return saveUserProfile(uid, {
        ...input,
        email: authUser?.email ?? null,
      });
    },
    onSuccess: (saved, _variables, context) => {
      queryClient.setQueryData(userQueryKeys.profile(context.uid), saved);
      useProfileStore.getState().setAuthDisplayName(saved.displayName);
      useProfileStore.getState().setProfileMutationError(null);
      void queryClient.invalidateQueries({
        queryKey: ["public-user", "displayName"],
      });
    },
    onError: (error, _variables, context) => {
      if (context) {
        queryClient.setQueryData(
          userQueryKeys.profile(context.uid),
          context.previousProfile
        );
        useProfileStore
          .getState()
          .setAuthDisplayName(context.previousAuthDisplayName);

        const message = getProfileFirestoreErrorMessage(
          error,
          getUserProfilePath(context.uid)
        );
        useProfileStore.getState().setProfileMutationError(message);
        options?.onRollback?.(message);
      }
    },
  });
}
