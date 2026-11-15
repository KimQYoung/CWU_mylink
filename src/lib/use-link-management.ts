"use client";

import { useState } from "react";
import type { UpdateUserLinkInput } from "@/lib/firestore-links";
import type { LinkItem } from "@/types";

interface UseLinkManagementOptions {
  links: LinkItem[];
  updateLink: (id: string, input: UpdateUserLinkInput) => Promise<LinkItem>;
  deleteLink: (id: string) => Promise<void>;
  onSuccessToast?: (message: string) => void;
}

function resolveEndpointLabel(link?: Pick<LinkItem, "endpointLabel" | "order">) {
  if (!link) return "ENDPOINT";
  return (
    link.endpointLabel || `ENDPOINT ${String(link.order).padStart(2, "0")}`
  );
}

/**
 * 링크 인라인 수정 및 삭제 확인 모달 상태를 공통으로 관리하는 훅
 */
export function useLinkManagement({
  links,
  updateLink,
  deleteLink,
  onSuccessToast,
}: UseLinkManagementOptions) {
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [deletingLink, setDeletingLink] = useState<LinkItem | null>(null);
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);

  const handleEditStart = (link: LinkItem) => {
    setEditingLinkId(link.id);
  };

  const handleEditCancel = () => {
    setEditingLinkId(null);
  };

  const handleSaveEdit = async (
    id: string,
    input: UpdateUserLinkInput
  ) => {
    const target = links.find((item) => item.id === id);
    const updated = await updateLink(id, input);
    setEditingLinkId((current) => (current === id ? null : current));

    const label = resolveEndpointLabel(updated ?? target);
    onSuccessToast?.(`${label} UPDATED: ${updated.title}`);
  };

  const handleDeleteRequest = (link: LinkItem) => {
    setDeletingLink(link);
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    if (!open) {
      setDeletingLink(null);
    }
  };

  const handleConfirmDelete = async (link: LinkItem) => {
    setDeletingLinkId(link.id);
    try {
      await deleteLink(link.id);
      setEditingLinkId((current) => (current === link.id ? null : current));

      const label = resolveEndpointLabel(link);
      onSuccessToast?.(`${label} DELETED: ${link.title}`);
    } finally {
      setDeletingLinkId((current) => (current === link.id ? null : current));
    }
  };

  return {
    editingLinkId,
    deletingLink,
    deletingLinkId,
    handleEditStart,
    handleEditCancel,
    handleSaveEdit,
    handleDeleteRequest,
    handleDeleteDialogOpenChange,
    handleConfirmDelete,
  };
}
