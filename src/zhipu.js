
export async function completion(sentence) {
    const messages = [
        { role: "system", content: "You are a friendly assistant" },
        {
            role: "user",
            content: sentence,
        },
    ];

    
    const response = await ai.run("@cf/meta/llama-2-7b-chat-int8", {
        messages,
    });

    return response["response"];
}
