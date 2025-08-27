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

/**
 * @typedef {Object} Room
 * @property {string[]} users
 * @property {WebSocket[]} sockets
 */

/** @type {Map<string, Room>} */
const rooms = new Map();

// ユーザー一覧を全員に送信する関数
function broadcastUsers(room) {
  const msg = JSON.stringify({ type: "users", users: room.users });
  for (const s of room.sockets) {
    try {
      s.send(msg);
    } catch {}
  }
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

  // 部屋作成 これ以下追加分

  // 部屋情報の初期化
  /*room.users = [];
  room.sockets = [];*/

  if (pathname === "/cookiePlayer" && req.method === "GET") {
    const cookie = getCookies(req.headers);
    const userName = sessions.get(cookie["sessionid"] ?? "");
    return new Response(userName);
  }

  if (req.method === "GET" && pathname === "/room-users") {
    const params = new URL(req.url).searchParams; // ← ここで定義
    const roomName = params.get("room");
    const room = rooms.get(roomName);
    if (!room) {
      return new Response(JSON.stringify([]), { status: 404 });
    }
    return new Response(JSON.stringify(room.users), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // WebSocket 接続
  if (pathname.startsWith("/ws")) {
    const { socket, response } = Deno.upgradeWebSocket(req);
    const params = new URL(req.url).searchParams; // ← ここで定義
    const roomName = params.get("room");
    const userName = params.get("user");

    // 部屋がなければ新規作成
    if (!rooms.has(roomName)) {
      rooms.set(roomName, { users: [], sockets: [] });
    }

    const room = rooms.get(roomName);

    // 最大人数を設定（2人）
    const MAX_USERS = 2;
    if (rooms.get(roomName).users.length >= MAX_USERS) {
      return new Response("この部屋は満員です", { status: 403 });
    }

    // ユーザー追加
    if (userName && !room.users.includes(userName)) {
      room.users.push(userName);
    } else {
      if (!userName) {
        socket.close(1000, "User no name");
      }
      socket.close(1000, "User already in room");
    }

    room.sockets.push(socket);
    // 入室時にユーザー一覧を全員に送信
    broadcastUsers(room);

    socket.onclose = () => {
      room.sockets = room.sockets.filter((s) => s !== socket);
      room.users = room.users.filter((u) => u !== userName);
      // 退出時もユーザー一覧を全員に送信
      broadcastUsers(room);
    };

    return response;
  }

  return serveDir(req, {
    fsRoot: "public",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  });
});
