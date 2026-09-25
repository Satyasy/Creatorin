"use client";

import { use } from "react";
import BriefDetailPage from "../../../BriefDetailPage";
import { MOCK_PROJECTS } from "../../../mockProjects";

export default function BriefTabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = use(params);
  const matchedProject = MOCK_PROJECTS.find((p) => p.id === tab) || MOCK_PROJECTS[0];

  return <BriefDetailPage brief={matchedProject} />;
}
