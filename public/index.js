let opuses_length = 0;

(async () => {
  const response = await fetch("/opus_check");
  document.getElementById("opus_num").innerText = await response.text();
});

if (opuses_length === 0) {
  document.getElementById("opus_is_none").style.display = "block";
  console.log(opuses_length);
} else {
  document.getElementById("opus_is_none").style.display = "none";
}
