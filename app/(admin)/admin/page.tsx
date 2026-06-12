import { isAuthenticated } from "@/lib/auth";
import { readNews } from "@/lib/news";
import LoginForm from "./LoginForm";
import Editor from "./Editor";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAuthenticated();
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <LoginForm />
      </div>
    );
  }
  const items = await readNews();
  return (
    <div className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto">
      <Editor initialItems={items} />
    </div>
  );
}
