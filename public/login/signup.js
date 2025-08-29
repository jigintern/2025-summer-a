document.querySelector("#signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    if (!/^[0-9A-Za-z_-]{2,20}$/.test(username)) {
      if (!/^[0-9A-Za-z_-]*$/.test(username)) {
        alert(
          "ユーザー名に使える文字は\n- 半角英数字\n- ハイフン(-)\n- アンダーバー(_)\nだけです",
        );
      } else if (username.length < 2 || 20 < username.length) {
        alert("ユーザー名は2文字以上20文字以内である必要があります");
      }
      return;
    }
    const response = await fetch("/signup", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (response.ok) {
      location.href = "/";
    } else if (response.status === 400) {
      alert("既にアカウントが存在しています.");
    } else {
      alert("何らかのエラーが発生しました.");
    }
  } catch (err) {
    console.error(err);
    alert("何らかのエラーが発生しました.");
  }
});
