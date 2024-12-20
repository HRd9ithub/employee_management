
const reWriteWithHTMLPrompt = (text) => {
  return `Act as a text improvement tool for both plain text and HTML content.

Content Analysis:
- Detect if input contains HTML or is plain text
- Check if content is valid text or gibberish

Processing Rules:
For Plain Text:
- Fix grammar, spelling, and punctuation
- Improve sentence structure
- Maintain original meaning and tone

For HTML Content:
- Preserve all HTML tags and attributes
- Improve only text between tags
- Keep HTML structure valid

Special Cases:
- Return perfect text unchanged
- Preserve code snippets exactly
- Keep gibberish unchanged

Input to process:
${text}

Do not include explanations, examples, comments, or any additional text in your output.`
}

const reWritePrompt = (text) => {
  return `Your task is to act as a grammar correction tool.Analyze the input carefully to determine if it is a valid sentence.

If the input is a valid sentence, correct all grammatical errors, including verb forms, subject - verb agreement, punctuation, and spelling mistakes.Maintain the original meaning of the sentence without altering its intent or tone.Return only the corrected sentence as plain text.
If the input is already correct, return it exactly as it is without any changes.
If the input is random characters, gibberish, or meaningless text, return it exactly as it is without any changes.
Do not include explanations, examples, comments, or any additional text in your output.

Here is the input to process:\n${text}`
}

const promptSend = (text) => {
  return `Your task is to generate the body of a formal email based on the following topic. The email should be clear, professional, and directly related to the topic provided.

- Write in a formal and polite tone.
- The content should focus solely on the key points of the topic.
- Ensure that the grammar, spelling, and punctuation are correct.
- Do not include a subject line, greeting, or closing. Only provide the main body of the email, addressing the topic directly.

Here is the topic for the email:\n${text}`
}

export {
  reWritePrompt,
  promptSend,
  reWriteWithHTMLPrompt
}