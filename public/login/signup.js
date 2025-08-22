document.getElementById("loginForm")
    .addEventListener("submit", async (e) => {
        e.preventDefault();

        const userName = document.getElementById("username").value;
        const passWord = document.getElementById("password").value;

        try {
            const response = await fetch("/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userName,
                    passWord,
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
