import { serveDir } from "jsr:@std/http/file-server";

Deno.serve(async (req) => {
  const kv = await Deno.openKv();
  const pathname = new URL(req.url).pathname;
  console.log(pathname);

  let loginPlayerName = "";

  /*const keys = kv.list({ prefix: [] });
  for await (const entry of keys) {
    await kv.delete(entry.key);
  }*/

  if (req.method === "GET" && pathname === "/welcome-message") {
    return new Response("ホーム画面です");
  }

  //サインアップ処理（新規作成）
  if (req.method === "POST" && pathname === "/signup") {
    try {
      const { userName, passWord } = await req.json();

      // ユーザー名の重複チェック
      const userIterator = await kv.get(["user", userName]);
      if (userIterator.value) {
        return new Response("ユーザー名が既に存在します", { status: 400 });
      }

      const key = ["user", userName]; // キーをユーザー名にする
      const value = { name: userName, pass: passWord };
      await kv.set(key, value);

      return new Response("新規作成成功", { status: 200 });
    } catch (error) {
      console.error("登録エラー:", error);
      return new Response("サーバーエラー", { status: 500 });
    }
  }

  //ログイン処理
  if (req.method === "POST" && pathname === "/login") {
    try {
      const { userName, passWord } = await req.json();

      const user = await kv.get(["user", userName]);
      if (user.value.name === userName && user.value.pass === passWord) {
        loginPlayerName = userName;
        console.log("loginPlayerName:", loginPlayerName);
        return new Response("ログイン成功", { status: 200 });
      }
      return new Response("ログイン失敗", { status: 401 });
    } catch (error) {
      console.error("ログインエラー:", error);
      return new Response("サーバーエラー", { status: 500 });
    }
  }

  return serveDir(req, {
    fsRoot: "public",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  });
});
