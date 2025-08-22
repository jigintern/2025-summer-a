document.getElementById("loginForm")
    .addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username")
            .value;
        const password = document.getElementById("password")
            .value;

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    alert("ログイン成功！");
                    window.location.href = "/";
                } else {
                    alert(
                        data.message ||
                            "ログインに失敗しました。",
                    );
                }
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
