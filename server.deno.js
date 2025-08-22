import { serveDir } from "jsr:@std/http/file-server";

let player_data = [];

Deno.serve(async (req) => {
  const pathname = new URL(req.url).pathname;
  console.log(pathname);

  if (req.method === "GET" && pathname === "/welcome-message") {
    return new Response("ホーム画面です");
  }

  if (req.method === "POST" && pathname === "/new_login") {
    const { username, password } = await req.json();
    // ユーザー名が既に存在するかチェック
    const userIndex = player_data.findIndex((player) => player[0] === username);
    if (userIndex !== -1) {
      return new Response("ユーザー名が既に存在します", { status: 400 });
    }
    player_data.push([username, password]);
    console.log("登録されたユーザー:", player_data);
    return new Response("新規作成成功", { status: 200 });
  }

  if (req.method === "POST" && pathname === "/login") {
    const { username, password } = await req.json();
    console.log("ログイン試行:", { username, password });

    // ユーザー名とパスワードの照合
    const userIndex = player_data.findIndex((player) => player[0] === username);
    console.log("ログイン試行:", { userIndex });

    if (userIndex !== -1 && player_data[userIndex][1] === password) {
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
