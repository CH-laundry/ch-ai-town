const client = require("../openaiClient");

module.exports = async function (message, userId) {
  const reply = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
你是 C.H 精緻洗衣的客服，語氣專業、親切、簡潔。
回答時避免保證「百分之百可清除」，需強調依實際材質與污漬狀況。
`
      },
      { role: "user", content: message }
    ]
  });

  return {
    roleId: "ch_customer_service",
    roleName: "C.H 客服",
    reply: reply.choices[0].message.content
  };
};
