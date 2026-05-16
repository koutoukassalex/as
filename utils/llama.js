import { initLlama } from 'llama.rn';

let currentLlamaContext = null;

export const loadLlamaModel = async (modelPath, mmprojPath = null) => {
  if (currentLlamaContext) {
    await currentLlamaContext.release();
    currentLlamaContext = null;
  }

  try {
    const config = {
      model: modelPath,
      n_ctx: 2048, // Context window size
      n_gpu_layers: 100, // Offload entirely to Metal GPU
      use_mlock: true,
    };

    // Include the vision projector if available
    if (mmprojPath) {
      config.mmproj = mmprojPath;
    }

    currentLlamaContext = await initLlama(config);
    return currentLlamaContext;
  } catch (error) {
    console.error("Failed to load Llama model:", error);
    throw error;
  }
};

export const generateLlamaResponse = async (messages, onToken) => {
  if (!currentLlamaContext) {
    throw new Error('Model is not loaded');
  }

  // Use the context's completion API
  // For Qwen2-VL, we format it as ChatML or the internal llama.cpp chat template handles it
  const result = await currentLlamaContext.completion({
    messages: messages,
    n_predict: 256,
    temperature: 0.7,
    top_p: 0.9,
    // We can emit partial tokens
  }, (data) => {
    if (onToken) onToken(data.token);
  });

  return result.text;
};

export const releaseLlamaModel = async () => {
  if (currentLlamaContext) {
    await currentLlamaContext.release();
    currentLlamaContext = null;
  }
};
