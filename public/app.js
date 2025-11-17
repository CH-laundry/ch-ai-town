let selectedRole = null;

// 角色按鈕事件
document.querySelectorAll('.role-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    selectedRole = card.dataset.role;
    document.getElementById('currentRole').innerText =
      "目前由：「" + card.querySelector('.name').innerText + "」為您服務";
  });
});

// 送出訊息
document.getElementById('sendBtn').addEventListener('click', sendMessage);

async function sendMessage() {
  const msg = document.getElementById('msgInput').value.trim();
  if (!msg) return;

  if (!selectedRole) {
    alert("請先選擇一個角色");
    return;
  }

  appendMessage(msg, 'user-msg');
  document.getElementById('msgInput').value = "";

  const res = await fetch('/api/chat', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "web-user",
      message: msg,
      preferredRole: selectedRole
    })
  });

  const data = await res.json();
  appendMessage("【" + data.roleName + "】" + data.reply, 'ai-msg');
}

function appendMessage(text, cls) {
  const box = document.getElementById('chatBox');
  const div = document.createElement('div');
  div.className = `msg ${cls}`;
  div.innerText = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}
