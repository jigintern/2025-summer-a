import { serveDir } from "jsr:@std/http/file-server";
import { getCookies, setCookie } from "jsr:@std/http/cookie";
import { battle } from "./battle.server.js";

// パスワードハッシュ化の関数
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * @typedef {Object} Room
 * @property {string} username
 * @property {WebSocket} socket
 */

/** @type {Map<string, Room>} */
const waitingUser = new Map();

// ログインが必要なページ一覧
const needLogin = ["/", "/index.html"];

/** @type {Map<string, string>} sessionid -> username のMap */
const sessions = new Map();

/**
 * セッションを新たに作成する
 * @param {string} username ログインしたユーザー名
 * @returns {Headers}
 */
const makeSession = async (username, kv) => {
  const sessionid = crypto.randomUUID();
  const headers = new Headers();
  setCookie(headers, {
    name: "sessionid",
    value: sessionid,
    httpOnly: true,
    maxAge: 86400 * 14, // 2週間
  });
  // Deno KVにセッションを保存（expireInで14日後に自動削除）
  await kv.set(["sessions", sessionid], username, {
    expireIn: 86400 * 14 * 1000,
  });
  return headers;
};

Deno.serve(async (req) => {
  const kv = await Deno.openKv();
  const pathname = new URL(req.url).pathname;
  console.log(pathname);

  if (needLogin.includes(pathname)) {
    const cookie = getCookies(req.headers);
    const sessionid = cookie["sessionid"] ?? "";
    const sessionEntry = await kv.get(["sessions", sessionid]);
    if (sessionEntry.value === null) {
      const url = new URL(req.url);
      url.pathname = "/login";
      url.search = "";
      url.hash = "";
      return Response.redirect(url.href, 303);
    }
  }

  if (pathname === "/logout") {
    const cookie = getCookies(req.headers);
    await kv.delete(["sessions", cookie["sessionid"] ?? ""]);

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

      return new Response(null, { headers: await makeSession(username, kv) });
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
        return new Response(null, { headers: await makeSession(username, kv) });
      }
      return new Response("ログイン失敗", { status: 401 });
    } catch (error) {
      console.error("ログインエラー:", error);
      return new Response("サーバーエラー", { status: 500 });
    }
  }

  if (pathname === "/ws/battle") {
    const params = new URL(req.url).searchParams;
    const roomName = params.get("room") ?? "";
    const cookie = getCookies(req.headers);
    const sessionid = cookie["sessionid"] ?? "";
    const sessionEntry = await kv.get(["sessions", sessionid]);
    const username = sessionEntry.value ?? "";

    if (username === "") {
      return Response("ログインしていません", { status: 401 });
    }
    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.onopen = () => {
      // 部屋がなければ新規作成
      if (!waitingUser.has(roomName)) {
        waitingUser.set(roomName, { username, socket });
        socket.onclose = () => {
          waitingUser.delete(roomName);
          socket.onclose = null;
          socket.onerror = null;
        };
        socket.onerror = () => {
          waitingUser.delete(roomName);
          socket.onclose = null;
          socket.onerror = null;
        };
      } else {
        const {
          username: username2,
          socket: socket2,
        } = waitingUser.get(roomName);
        waitingUser.delete(roomName);
        socket2.onclose = null;
        socket2.onerror = null;
        battle([username2, socket2], [username, socket]);
      }
    };

    return response;
  }

  // 新規保存
  if (req.method === "POST" && pathname === "/AALibrary") {
    try {
      // セッションからユーザー名を取得
      const cookie = getCookies(req.headers);
      const sessionid = cookie["sessionid"] ?? "";
      const sessionEntry = await kv.get(["sessions", sessionid]);
      const username = sessionEntry.value;

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
        .set(["aa_by_user", username, +now], { aa_id: aaId })
        .commit();

      if (!res.ok) {
        throw new Error("保存時のエラー");
      }

      console.log("AALibraryに追加:", { title, AA });
      return new Response(JSON.stringify({ aaId }), { status: 200 });
    } catch (error) {
      console.error("エラー:", error);
      return new Response("サーバーエラー", { status: 500 });
    }
  }

  if (req.method === "GET" && pathname.startsWith("/AALibrary/")) {
    try {
      const aaId = pathname.split("/")[2];
      const entry = await kv.get(["aa", aaId]);

      if (entry.value) {
        const value = entry.value;
        return new Response(JSON.stringify(entry.value), {
          status: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            author: value.author,
            title: value.title,
            content: value.content,
            created_at: +value.created_at,
            updated_at: +value.created_at,
          }),
        });
      } else {
        return new Response(null, { status: 404 });
      }
    } catch (error) {
      console.error("更新エラー:", error);
      return new Response("サーバーエラー", { status: 500 });
    }
  }

  // 上書き保存（共通の処理が多いけど一旦保留）
  if (req.method === "PUT" && pathname.startsWith("/AALibrary/")) {
    try {
      const cookie = getCookies(req.headers);
      const sessionid = cookie["sessionid"] ?? "";
      const sessionEntry = await kv.get(["sessions", sessionid]);
      const username = sessionEntry.value ?? "";
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

      const originalTimestamp = originalEntry.value.updated_at;
      const newTimestamp = new Date();

      const res = await kv.atomic()
        .set(originalKey, {
          ...originalEntry.value,
          title: title,
          content: AA,
          updated_at: newTimestamp,
        })
        .delete(["aa_by_user", username, +originalTimestamp])
        .set(["aa_by_user", username, +newTimestamp], { aa_id: aa_id })
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
      const sessionEntry = await kv.get(["sessions", sessionid]);
      const username = sessionEntry.value;

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
        if (entry.value && typeof entry.value.aa_id === "string") {
          aaIds.push(entry.value.aa_id);
        }
      }

      // getManyは一度に10件までしかキーを取得できないため、分割して処理する
      const chunkSize = 10;
      const AALibrary = [];
      for (let i = 0; i < aaIds.length; i += chunkSize) {
        const chunkIds = aaIds.slice(i, i + chunkSize);
        const aaKeys = chunkIds.map((id) => ["aa", id]);
        const aaEntries = await kv.getMany(aaKeys);

        const processedEntries = aaEntries
          .filter((entry) => entry.value !== null)
          .map((entry) => {
            const id = entry.key[1];
            return { ...entry.value, id: id };
          });
        AALibrary.push(...processedEntries);
      }

      return new Response(JSON.stringify({ AA: AALibrary }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("エラー:", error);
      return new Response("サーバーエラー", { status: 500 });
    }
  }

  if (req.method === "DELETE" && pathname.startsWith("/AALibrary/")) {
    try {
      const cookie = getCookies(req.headers);
      const sessionid = cookie["sessionid"] ?? "";
      const sessionEntry = await kv.get(["sessions", sessionid]);
      const username = sessionEntry.value;

      if (!username) {
        return new Response("認証されていません", { status: 401 });
      }

      const aaId = pathname.split("/")[2];
      if (!aaId) {
        return new Response("IDが指定されていません", { status: 400 });
      }
      const aaKey = ["aa", aaId];
      const aaEntry = await kv.get(aaKey);
      if (!aaEntry.value) {
        return new Response("削除対象のAAが見つかりません", { status: 404 });
      }

      if (aaEntry.value.author !== username) {
        return new Response("削除権限がありません", { status: 403 });
      }

      let userAaRefKey = null;
      const iter = kv.list({ prefix: ["aa_by_user", username] });
      for await (const entry of iter) {
        if (entry.value && entry.value.aa_id === aaId) {
          userAaRefKey = entry.key;
          break;
        }
      }

      if (!userAaRefKey) {
        await kv.delete(aaKey);
        return new Response(
          "削除しました (参照データ不整合の可能性があります。)",
          {
            status: 200,
          },
        );
      }

      const res = await kv.atomic()
        .delete(aaKey)
        .delete(userAaRefKey)
        .commit();

      if (!res.ok) {
        throw new Error("データベースからの削除に失敗しました。");
      }

      return new Response("削除しました", { status: 200 });
    } catch (error) {
      console.error("削除エラー:", error);
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
