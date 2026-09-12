import { redirect } from "next/navigation";

export default function CapacityGridRedirectPage() {
  redirect("/admin/heatmap");
}