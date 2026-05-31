import { cloneElement, isValidElement, useState, type ReactElement } from "react";

import { useAdminAuth } from "@/features/admin-auth/AdminAuthProvider";
import { AdminConfirmDialog } from "@/components/admin/shared/AdminConfirmDialog";

type AdminLogoutDialogProps = {
  children: ReactElement<any>;
};

const copy = {
  title: "Confirmer la déconnexion",
  description:
    "Vous allez quitter l’espace administrateur. Voulez-vous vraiment vous déconnecter ?",
  cancel: "Annuler",
  confirm: "Se déconnecter",
} as const;

export function AdminLogoutDialog({ children }: AdminLogoutDialogProps) {
  const { logout } = useAdminAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isValidElement(children)) {
    return null;
  }

  const originalProps = children.props as {
    onClick?: (event: React.MouseEvent) => void;
    onSelect?: (event: Event) => void;
  };

  const trigger = cloneElement(children as ReactElement<any>, {
    onClick: (event: React.MouseEvent) => {
      originalProps.onClick?.(event);
      setOpen(true);
    },
    onSelect: (event: Event) => {
      originalProps.onSelect?.(event);
      event.preventDefault();
      setOpen(true);
    },
  } as any);

  return (
    <>
      {trigger}
      <AdminConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={copy.title}
        description={copy.description}
        cancelLabel={copy.cancel}
        isSubmitting={isSubmitting}
        actionLabel={isSubmitting ? "Déconnexion..." : copy.confirm}
        onConfirm={async () => {
          setIsSubmitting(true);

          try {
            await logout();
            setOpen(false);
          } finally {
            setIsSubmitting(false);
          }
        }}
      />
    </>
  );
}
