//ログインフォームの送信イベントをキャッチ
document.getElementById("loginForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const userName = document.getElementById("username")
      .value;
    const passWord = document.getElementById("password")
      .value;

    try {
      // ログイン処理
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName,
          passWord,
        }),
      });

      const data = await response.json();
      console.log("Login response:", data); // デバッグ用

      if (response.ok && data.status === "success") {
        // ログイン情報を確実に保存
        const userInfo = {
          userName: data.user.userName,
          loginTime: data.user.loginTime,
        };
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        console.log("Saved user info:", userInfo); // デバッグ用

        window.location.href = "/"; // ログイン成功時のリダイレクト
      } else {
        alert(
          "ログインに失敗しました。ユーザー名とパスワードを確認してください。",
        );
      }
    } catch (error) {
      console.error("エラー:", error);
      alert(
        "ログイン処理中にエラーが発生しました。",
      );
    }
  });
