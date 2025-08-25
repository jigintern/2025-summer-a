document.getElementById("AAseve")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const titleName = document.getElementById("title").value;
    const AA = document.getElementById("AA").value;
    console.log(AA, titleName);
    try {
      const response = await fetch("/AALibrary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "title": titleName,
          "AA": AA,
        }),
      });
      console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaa");
      const data = await response.text();
      console.log("AALibrary:", data);
      if (response.ok) {
        // 成功時の処理
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
