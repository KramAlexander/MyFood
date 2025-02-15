export function setupChat() {
  const chatInput = document.getElementById("chat-input");

  if (!chatInput) {
    return;
  }

  chatInput.addEventListener("keypress", async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const userMessage = event.target.value.trim();
      if (!userMessage) return;

      appendMessage("You", userMessage, "user-message");
      event.target.value = "";

      try {
        let response = await fetch("/chat/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userMessage }),
        });

        if (!response.ok) throw new Error("Failed to fetch response");

        let data = await response.json();
        appendMessage("Bot", data.response || "No response", "bot-message");
      } catch (error) {
        console.error("Error fetching chat response:", error);
        appendMessage("Bot", "Sorry, something went wrong.", "bot-message");
      }
    }
  });
}

export async function sendMessage() {
  const inputField = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");
  const userMessage = inputField.value.trim();

  if (userMessage === "") return;

  appendMessage("You", userMessage, "user-message");

  inputField.value = "";

  try {
    let response = await fetch("/chat/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: userMessage }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch response from chatbot.");
    }

    let data = await response.json();

    appendMessage(
      "Bot",
      data.response || "No response from bot",
      "bot-message"
    );

    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
  } catch (error) {
    console.error("Error:", error);
    appendMessage(
      "Bot",
      "Error: Unable to connect to chatbot.",
      "error-message"
    );
  }
}

function appendMessage(sender, text, className) {
  const chatMessages = document.getElementById("chat-messages");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", className);
  messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatMessages.appendChild(messageDiv);
}
