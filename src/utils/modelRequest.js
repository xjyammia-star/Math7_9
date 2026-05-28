export function buildChatCompletionBody(modelConfig, messages, jsonMode = false, maxTokens = 800, temperature = 0.7, modelId = "") {
  const body = {
    model: modelConfig.model,
    messages,
    max_tokens: maxTokens,
    temperature,
    top_p: 0.95,
  };

  if (modelId === "glm47") {
    body.thinking = { type: "disabled" };
  }

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  return body;
}
