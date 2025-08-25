// 認証状態をチェックする関数
function checkAuthState() {
  const userInfo = localStorage.getItem("userInfo");
  if (!userInfo) {
    const currentPath = window.location.pathname;
    window.location.href = `/login/login.html?redirect=${
      encodeURIComponent(currentPath)
    }`;
    return null;
  }
  return JSON.parse(userInfo);
}

// ログアウト処理
async function handleLogout() {
  try {
    const response = await fetch("/logout", {
      method: "POST",
    });
    if (response.ok) {
      localStorage.removeItem("userInfo");
      window.location.href = "/login/login.html";
    }
  } catch (error) {
    console.error("ログアウトエラー:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // 認証状態のチェック
  const user = checkAuthState();
  if (!user) return; // 未ログインの場合はリダイレクト

  // ユーザー情報の表示
  const userInfoElement = document.getElementById("userInfo");
  if (userInfoElement) {
    userInfoElement.innerHTML = `
            <p>ログインユーザー: ${user.userName}</p>
            <p>ログイン時刻: ${new Date(user.loginTime).toLocaleString()}</p>
            <button onclick="handleLogout()">ログアウト</button>
        `;
  }
});
