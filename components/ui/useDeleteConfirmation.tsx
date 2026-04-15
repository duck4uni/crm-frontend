"use client";

import { useCallback } from "react";
import { useDialog } from "./Dialog";

interface DeleteConfirmationOptions {
  description: string;
  onConfirm: () => void | Promise<void>;
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

export function useDeleteConfirmation() {
  const { showDialog, closeDialog, DialogComponent } = useDialog();

  const requestDeleteConfirmation = useCallback(
    ({
      description,
      onConfirm,
      title = "Xác nhận xóa",
      confirmText = "Xóa",
      cancelText = "Hủy",
    }: DeleteConfirmationOptions) => {
      showDialog({
        type: "danger",
        title,
        description,
        confirmText,
        cancelText,
        onConfirm: async () => {
          try {
            await onConfirm();
          } finally {
            closeDialog();
          }
        },
      });
    },
    [closeDialog, showDialog],
  );

  return {
    requestDeleteConfirmation,
    DeleteConfirmationDialog: DialogComponent,
    closeDeleteConfirmation: closeDialog,
  };
}
