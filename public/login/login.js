document.getElementById("loginForm")
    .addEventListener("submit", async (e) => {
        e.preventDefault();

        const userName = document.getElementById("username")
            .value;
        const passWord = document.getElementById("password")
            .value;

        try {
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

            const responseText = await response.text(); // JSONではなくテキストとして読み込み

            if (response.ok) {
                alert("ログイン成功！");
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
