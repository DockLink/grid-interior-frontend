"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

const MENU_WIDTH = 170;
const MENU_GAP = 4;
const VIEWPORT_PAD = 8;
const ITEM_HEIGHT = 36;

type MenuPosition = {
  top: number;
  left: number;
};

export function UserActionMenu({
  disabled,
  onEditRole,
  onDeactivate,
  onDelete,
  canDeactivate = true,
}: {
  disabled?: boolean;
  onEditRole?: () => void;
  onDeactivate: () => void;
  /** When provided, shows a "Delete permanently" action (super admin only). */
  onDelete?: () => void;
  /** Hide the Deactivate action (e.g. for already-inactive users). */
  canDeactivate?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const showEditRole = Boolean(onEditRole);
  const showDelete = Boolean(onDelete);
  const itemCount = Number(showEditRole) + Number(canDeactivate) + Number(showDelete);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || itemCount === 0) {
      setPosition(null);
      return;
    }

    function place() {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const menuHeight = menuRef.current?.offsetHeight || itemCount * ITEM_HEIGHT;

      const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PAD;
      const openUp = spaceBelow < menuHeight && rect.top - VIEWPORT_PAD >= menuHeight;

      const top = openUp
        ? rect.top - MENU_GAP - menuHeight
        : rect.bottom + MENU_GAP;

      const left = Math.min(
        Math.max(VIEWPORT_PAD, rect.right - MENU_WIDTH),
        window.innerWidth - VIEWPORT_PAD - MENU_WIDTH,
      );

      setPosition((prev) =>
        prev && prev.top === top && prev.left === left ? prev : { top, left },
      );
    }

    place();
    // Remeasure after paint once the portal menu exists (accurate height + flip).
    const raf = window.requestAnimationFrame(place);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, itemCount]);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const itemStyle: CSSProperties = {
    display: "block",
    width: "100%",
    padding: "8px 12px",
    background: "none",
    border: "none",
    textAlign: "left",
    fontSize: "13px",
    color: "var(--ds-label)",
    cursor: "pointer",
  };

  const menu =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={menuRef}
        role="menu"
        style={{
          position: "fixed",
          top: position?.top ?? -9999,
          left: position?.left ?? -9999,
          width: MENU_WIDTH,
          visibility: position ? "visible" : "hidden",
          background: "var(--ds-surface-elevated)",
          border: "1px solid rgba(90,60,30,0.14)",
          borderRadius: "8px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          zIndex: 80,
          overflow: "hidden",
        }}
      >
        {showEditRole && onEditRole && (
          <button
            type="button"
            role="menuitem"
            style={itemStyle}
            onClick={() => {
              setOpen(false);
              onEditRole();
            }}
          >
            Edit role
          </button>
        )}
        {canDeactivate && (
          <button
            type="button"
            role="menuitem"
            style={{ ...itemStyle, color: "var(--ds-destructive)" }}
            onClick={() => {
              setOpen(false);
              onDeactivate();
            }}
          >
            Deactivate
          </button>
        )}
        {showDelete && onDelete && (
          <button
            type="button"
            role="menuitem"
            style={{ ...itemStyle, color: "var(--ds-destructive)", fontWeight: 500 }}
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            Delete permanently
          </button>
        )}
      </div>,
      document.body,
    );

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "6px",
          background: "none",
          border: "none",
          cursor: disabled ? "default" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ds-secondary-label)",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <MoreHorizontal size={16} />
      </button>
      {menu}
    </div>
  );
}
