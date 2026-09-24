import Link from "next/link";
import { X } from "lucide-react";
import "./DetailSurface.css";

type DetailSurfaceKind = "brief" | "service" | "project";

const legacyClass = {
  brief: {
    root: "brief-detail-page",
    close: "brief-detail-close",
    sheet: "brief-detail-sheet",
    header: "brief-detail-header",
    scroll: "brief-detail-scroll",
  },
  service: {
    root: "service-detail-page",
    close: "service-detail-close",
    sheet: "service-detail-sheet",
    header: "service-detail-header",
    scroll: "service-detail-scroll",
  },
  project: {
    root: "project-detail-page",
    close: "project-close",
    sheet: "project-sheet",
    header: "project-detail-header",
    scroll: "project-detail-scroll",
  },
} satisfies Record<DetailSurfaceKind, Record<"root" | "close" | "sheet" | "header" | "scroll", string>>;

type DetailSurfaceProps = {
  kind: DetailSurfaceKind;
  isModal?: boolean;
  isClosing?: boolean;
  onClose?: () => void;
  closeHref?: string;
  closeLabel: string;
  dialogLabel: string;
  header?: React.ReactNode;
  children: React.ReactNode;
  sheetClassName?: string;
  sheetAfter?: React.ReactNode;
};

export default function DetailSurface({
  kind,
  isModal = false,
  isClosing = false,
  onClose,
  closeHref = "/",
  closeLabel,
  dialogLabel,
  header,
  children,
  sheetClassName = "",
  sheetAfter,
}: DetailSurfaceProps) {
  const legacy = legacyClass[kind];
  const rootClassName = `detail-surface detail-surface--${kind} ${legacy.root}${isModal ? " is-modal" : ""}${isClosing ? " is-closing" : ""}`;
  const sheetClasses = ["detail-surface__sheet", legacy.sheet, sheetClassName].filter(Boolean).join(" ");

  return <div className={rootClassName} role={isModal ? "dialog" : undefined} aria-modal={isModal || undefined} aria-label={isModal ? dialogLabel : undefined}>
    <div className={`detail-surface__close ${legacy.close}`}>
      {onClose ? <button type="button" className="detail-surface__close-button" onClick={onClose} aria-label={closeLabel}><X /></button> : <Link className="detail-surface__close-button" href={closeHref} aria-label={closeLabel}><X /></Link>}
    </div>
    <div className={sheetClasses}>
      {header && <header className={`detail-surface__header ${legacy.header}`}>{header}</header>}
      <div className={`detail-surface__scroll ${legacy.scroll}`}>{children}</div>
      {sheetAfter}
    </div>
  </div>;
}
