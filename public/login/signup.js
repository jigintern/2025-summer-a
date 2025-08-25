document.querySelector("#signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
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
