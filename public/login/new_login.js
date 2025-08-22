document.getElementById("loginForm")
    .addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("/new_login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const result = await response.text();

            if (response.ok) {
                alert("新規作成成功！");
                window.location.href = "./login.html";
            } else {
                alert(result || "新規作成に失敗しました。");
            }
        } catch (error) {
            console.error("エラー:", error);
            alert("アカウント作成中にエラーが発生しました。");
        }
    });
