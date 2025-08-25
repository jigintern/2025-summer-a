import { serveDir } from "jsr:@std/http/file-server";
import { getCookies, setCookie } from "jsr:@std/http/cookie";

// パスワードハッシュ化の関数
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ログインが必要なページ一覧
const needLogin = ["/", "/index.html"];

/** @type {Map<string, string>} sessionid -> username のMap */
const sessions = new Map();

/**
 * セッションを新たに作成する
 * @param {string} username ログインしたユーザー名
 * @returns {Headers}
 */
const makeSession = (username) => {
  const sessionid = crypto.randomUUID();
  const headers = new Headers();
  setCookie(headers, {
    name: "sessionid",
    value: sessionid,
    httpOnly: true,
    maxAge: 86400 * 14, // 2週間
  });
  sessions.set(sessionid, username);
  return headers;
};

Deno.serve(async (req) => {
  const kv = await Deno.openKv();
  const pathname = new URL(req.url).pathname;
  console.log(pathname);

  if (needLogin.includes(pathname)) {
    const cookie = getCookies(req.headers);
    if (!sessions.has(cookie["sessionid"] ?? "")) {
      const url = new URL(req.url);
      url.pathname = "/login";
      url.search = "";
      url.hash = "";
      return Response.redirect(url.href, 303);
    }
  }

  /*const keys = kv.list({ prefix: [] });
  for await (const entry of keys) {
    await kv.delete(entry.key);
  }*/

  if (req.method === "GET" && pathname === "/welcome-message") {
    return new Response("ホーム画面です");
  }

  if (pathname === "/logout") {
    const cookie = getCookies(req.headers);
    sessions.delete(cookie["sessionid"] ?? "");

    const headers = new Headers({
      Location: new URL(req.url).origin + "/login/",
    });
    setCookie(headers, { name: "sessionid", value: "", maxAge: 0 });
    return new Response(null, { status: 303, headers });
  }

  //サインアップ処理（新規作成）
  if (req.method === "POST" && pathname === "/signup") {
    try {
      const { username, password } = await req.json();

      // ユーザー名の重複チェック
      const userIterator = await kv.get(["user", username]);
      if (userIterator.value) {
        return new Response("ユーザー名が既に存在します", { status: 400 });
      }

      // パスワードをハッシュ化
      const hashedPassword = await hashPassword(password);

      const key = ["user", username]; // キーをユーザー名にする
      const value = { name: username, pass: hashedPassword };
      await kv.set(key, value);

      return new Response(null, { headers: makeSession(username) });
    } catch (error) {
      console.error("登録エラー:", error);
      return new Response("サーバーエラー", { status: 500 });
    }
  }

  //ログイン処理
  if (req.method === "POST" && pathname === "/login") {
    try {
      /*const userIterator = kv.list({
        prefix: ["user"],
      });
      // ループしながらDeno KVに問い合わせるので、forループにawaitを付ける
      for await (const userItem of userIterator) {
        console.log("user_data: ", userItem);
      }*/

      const { username, password } = await req.json();

      const user = await kv.get(["user", username]);
      // パスワードをハッシュ化して比較
      const hashedPassword = await hashPassword(password);

      if (
        user.value?.name === username &&
        user.value?.pass === hashedPassword
      ) {
        return new Response(null, { headers: makeSession(username) });
      }
      return new Response("ログイン失敗", { status: 401 });
    } catch (error) {
      console.error("ログインエラー:", error);
      return new Response("サーバーエラー", { status: 500 });
    }
  }

  // ログアウトエンドポイントを追加
  if (req.method === "POST" && pathname === "/logout") {
    return new Response(
      JSON.stringify({
        status: "success",
        message: "ログアウト成功",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  if (req.method === "POST" && pathname === "/AALibrary") {
    try {
      const { title, AA } = await req.json();

      //ユーザー名は仮でaにしておく。cookieなどから取得するようにする
      const userName = "a";

      console.log(title, AA);

      const key = ["user", userName]; // キーをユーザー名にする
      const value = { AALibrary: [{ title: title, AA: AA }] };

      await kv.set(key, value);
      console.log(await kv.get(key));

      console.log("AALibraryに追加:", { title, AA });
      return new Response("追加した", { status: 200 });
    } catch (error) {
      console.error("エラー:", error);
      return new Response("サーバーエラー", { status: 500 });
    }
  }

  if (req.method === "GET" && pathname === "/AALibraryList") {
    try {
      //ユーザー名は仮でaにしておく。cookieなどから取得するようにする
      const userName = "a";

      const key = ["user", userName];
      const res = await kv.get(key);

      return new Response(JSON.stringify(res.value), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("エラー:", error);
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
