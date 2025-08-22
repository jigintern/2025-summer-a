import { serveDir } from "jsr:@std/http/file-server";

Deno.serve(async (req) => {
  const pathname = new URL(req.url).pathname;
  console.log(pathname);

  if (req.method === "GET" && pathname === "/welcome-message") {
    return new Response("ホーム画面です");
  }

  if (req.method === "POST" && pathname === "/login") {
    const { username, password } = await req.json();
    console.log("ログイン試行:", { username, password });

    if (username === "test" && password === "password") {
      return new Response("ログイン成功", { status: 200 });
    } else {
      return new Response("ログイン失敗", { status: 401 });
    }
  }

  return serveDir(req, {
    fsRoot: "public",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  });
});
