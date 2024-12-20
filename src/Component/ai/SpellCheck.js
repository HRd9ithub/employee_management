import { HfInference } from "@huggingface/inference";
import { useState } from "react";

const SpellCheck = () => {
  const API_KEY = process.env.REACT_APP_AI_API_KEY;
  const [loading, setLoading] = useState(false);

  const aiResponse = async (template) => {
    return new Promise(async (resolve, reject) => {
      try {
        setLoading(true);
        const client = new HfInference(API_KEY);

        const chatCompletion = await client.chatCompletion({
          model: "meta-llama/Meta-Llama-3-8B-Instruct",
          messages: [
            {
              role: "user",
              content: template,
            },
          ],
          max_tokens: 500,
        });

        // Resolve the promise with the corrected text
        resolve(chatCompletion?.choices[0]?.message?.content);
      } catch (error) {
        // Reject the promise with an error
        reject(error);
      } finally {
        setLoading(false);
      }
    });
  }

  return {
    aiResponse,
    loading
  }
}

export { SpellCheck }
