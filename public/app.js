const user = JSON.parse(localStorage.getItem("user"));

async function load() {
  // 🔥 Get latest user balance
  const resUser = await fetch("/api/users/all");
  const users = await resUser.json();

  const current = users.find(u => u.name === user.name);
  bal.innerText = current?.balance || 0;

  // 🔥 Transactions
  const res = await fetch("/api/transactions");
  const data = await res.json();

  list.innerHTML = data.map(t => {
    if (t.type === "income")
      return `<p>💰 +₹${t.amount} (${t.note})</p>`;

    if (t.type === "expense")
      return `<p>💸 -₹${t.amount} (${t.note})</p>`;

    if (t.type === "transfer")
      return `<p>🔁 ${t.fromUser} → ${t.toUser} ₹${t.amount} (${t.note})</p>`;
  }).join("");
}

// ADD MONEY
async function add() {
  await fetch("/api/transactions/add", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      name: user.name,
      amount: Number(addAmt.value),
      note: addNote.value
    })
  });

  load();
}

// EXPENSE
async function expense() {
  await fetch("/api/transactions/expense", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      name: user.name,
      amount: Number(expAmt.value),
      note: expNote.value
    })
  });

  load();
}

// SEND MONEY
async function send() {
  await fetch("/api/transactions/send", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      fromUser: user.name,
      toUser: to.value,
      amount: Number(amt.value),
      note: note.value
    })
  });

  load();
}

load();