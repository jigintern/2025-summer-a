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

  if (pathname === "/logout") {
    const cookie = getCookies(req.headers);
    sessions.delete(cookie["sessionid"] ?? "");

    const headers = new Headers({
      Location: new URL(req.url).origin + "/login/",
    });
    setCookie(headers, { name: "sessionid", value: "", maxAge: 0 });
    return new Response(null, { status: 303, headers });
  }

  if (req.method === "POST" && pathname === "/signup") {
    try {
      const { username, password } = await req.json();

      // ユーザー名の重複チェック
      const userEntry = await kv.get(["users", username]);
      if (userEntry.value) {
        return new Response("ユーザー名が既に存在します", { status: 400 });
      }

      // パスワードをハッシュ化
      const hashedPassword = await hashPassword(password);

      const key = ["users", username];
      const value = {
        password_hash: hashedPassword,
        rating: 0,
      };
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
      const { username, password } = await req.json();

      const userEntry = await kv.get(["users", username]);
      const user = userEntry.value;

      // パスワードをハッシュ化して比較
      const hashedPassword = await hashPassword(password);

      if (user && user.password_hash === hashedPassword) {
        return new Response(null, { headers: makeSession(username) });
      }
      return new Response("ログイン失敗", { status: 401 });
    } catch (error) {
      console.error("ログインエラー:", error);
      return new Response("サーバーエラー", { status: 500 });
    }
  }

  // 新規保存
  if (req.method === "POST" && pathname === "/AALibrary") {
    try {
      // セッションからユーザー名を取得
      const cookie = getCookies(req.headers);
      const sessionid = cookie["sessionid"] ?? "";
      const username = sessions.get(sessionid);

      if (!username) {
        return new Response("認証されていません", { status: 401 });
      }

      const { title, AA } = await req.json();
      const aaId = crypto.randomUUID();
      const now = new Date();

      const res = await kv.atomic()
        .set(["aa", aaId], {
          author: username,
          title: title,
          content: AA,
          created_at: now,
          updated_at: now,
        })
        .set(["aa_by_user", username, now], { aa_id: aaId })
        .commit();

      if (!res.ok) {
        throw new Error("保存時のエラー");
      }

      console.log("AALibraryに追加:", { title, AA });
      return new Response("追加しました", { status: 200 });
    } catch (error) {
      console.error("エラー:", error);
      return new Response("サーバーエラー", { status: 500 });
    }
  }

  // 上書き保存（共通の処理が多いけど一旦保留）
  if (req.method === "PUT" && pathname.startsWith("/AALibrary/")) {
    try {
      const cookie = getCookies(req.headers);
      const sessionid = cookie["sessionid"] ?? "";
      const username = sessions.get(sessionid);
      if (!username) {
        return new Response("認証されていません", { status: 401 });
      }

      const aa_id = pathname.split("/")[2];
      const { title, AA } = await req.json();

      if (!aa_id) {
        return new Response("IDが指定されていません", { status: 400 });
      }

      const originalKey = ["aa", aa_id];
      const originalEntry = await kv.get(originalKey);

      if (!originalEntry.value) {
        return new Response("更新対象のAAが見つかりません", { status: 404 });
      }
      if (originalEntry.value.author !== username) {
        return new Response("編集権限がありません", { status: 403 });
      }

      const originalTimestamp = originalEntry.value.created_at;
      const newTimestamp = new Date();

      const res = await kv.atomic()
        .set(originalKey, {
          ...originalEntry.value,
          title: title,
          content: AA,
          updated_at: newTimestamp,
        })
        .delete(["aa_by_user", username, originalTimestamp])
        .set(["aa_by_user", username, newTimestamp], { aa_id: aa_id })
        .commit();

      if (!res.ok) {
        throw new Error("Failed to update AA with atomic operation.");
      }

      return new Response("更新しました", { status: 200 });
    } catch (error) {
      console.error("更新エラー:", error);
      return new Response("サーバーエラー", { status: 500 });
    }
  }

  // アスキーアートのリストを取得する（最初の50個）
  if (req.method === "GET" && pathname === "/AALibraryList") {
    try {
      // セッションからユーザー名を取得
      const cookie = getCookies(req.headers);
      const sessionid = cookie["sessionid"] ?? "";
      const username = sessions.get(sessionid);

      if (!username) {
        return new Response("認証されていません", { status: 401 });
      }

      const aaIds = [];

      for await (
        const entry of kv.list({ prefix: ["aa_by_user", username] }, {
          reverse: true,
          limit: 50,
        })
      ) {
        const aaId = entry.key[2];
        aaIds.push(aaId);
      }

      // 取得したIDのリストを使って、AA本体のデータをまとめて取得
      const aaKeys = aaIds.map((id) => ["aa", id]);
      const aaEntries = await kv.getMany(aaKeys);

      const AALibrary = aaEntries.map((entry) => entry.value);

      return new Response(JSON.stringify({ AA: AALibrary }), {
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
