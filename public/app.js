let currentRoleId = null;

async function loadRoles() {
  const res = await fetch("/api/roles");
  const data = await res.json();

  const grid = document.getElementById("roleGrid");
  grid.innerHTML = "";

  data.roles.forEach(role => {
    const card = document.createElement("div");
    card.className = "role-card";
    card.innerHTML = `<div style="font-size:22px">${role.name}</div>`;
    card.onclick = () => selectRole(role.id);
    grid.appendChild(card);
  });
}

function selectRole(roleId) {
  currentRoleId = roleId;
  document.getElementById("chatBox").innerHTML = "";
}

async function sendMessage() {
  if (!currentRoleId) return alert("請先選角色");

  const msg = document.getElementById("msg").value;
  if (!msg) return;

  appendUser(msg);
  document.getElementById("msg").value = "";

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "browser-user",
      roleId: currentRoleId,
      message: msg
    })
  });

  const data = await res.json();
  appendAI(data.reply);
}

function appendUser(text) {
  const box = document.getElementById("chatBox");
  box.innerHTML += `<div class="msg user-msg">${text}</div>`;
  box.scrollTop = box.scrollHeight;
}

function appendAI(text) {
  const box = document.getElementById("chatBox");
  box.innerHTML += `<div class="msg ai-msg">${text}</div>`;
  box.scrollTop = box.scrollHeight;
}

loadRoles();
