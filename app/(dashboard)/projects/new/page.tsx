import { redirect } from "next/navigation";

import { NAV_ROUTES } from "@/types/navigation";

export default function NewProjectRedirectPage() {
  redirect(NAV_ROUTES.projects);
}
