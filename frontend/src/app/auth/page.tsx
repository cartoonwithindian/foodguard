import { redirect } from "next/navigation";

export default function AuthPlaceholderPage() {
  redirect("/login");
}
