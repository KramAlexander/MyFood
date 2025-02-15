export function setupChat() {
    document.getElementById("chat-input").addEventListener("keypress", async (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const userMessage = event.target.value.trim();
        if (!userMessage) return;
  
        appendMessage("You", userMessage, "user-message");
        event.target.value = "";
  
        let response = await fetch("/chat/gemini", { method: "POST", body: JSON.stringify({ prompt: userMessage }) });
        let data = await response.json();
        appendMessage("Bot", data.response || "No response", "bot-message");
      }
    });
  }
  