import { serveDir } from "jsr:@std/http/file-server";

// パスワードハッシュ化の関数
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

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

      // パスワードをハッシュ化
      const hashedPassword = await hashPassword(passWord);

      const key = ["user", userName]; // キーをユーザー名にする
      const value = { name: userName, pass: hashedPassword };
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
      const userIterator = kv.list({
        prefix: ["user"],
      });
      // ループしながらDeno KVに問い合わせるので、forループにawaitを付ける
      for await (const userItem of userIterator) {
        console.log("user_data: ", userItem);
      }

      const { userName, passWord } = await req.json();

      const user = await kv.get(["user", userName]);
      // パスワードをハッシュ化して比較
      const hashedPassword = await hashPassword(passWord);

      if (user.value.name === userName && user.value.pass === hashedPassword) {
        loginPlayerName = userName;
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
