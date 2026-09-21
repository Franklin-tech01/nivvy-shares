import { redirect } from "next/navigation";

// No landing page: the proxy sends signed-out visitors to /login.
export default function Home() {
  redirect("/dashboard");
}
