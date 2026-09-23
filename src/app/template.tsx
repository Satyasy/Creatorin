import { ViewTransition } from "react";

export default function Template({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      <div className="page-transition-shell">{children}</div>
    </ViewTransition>
  );
}
