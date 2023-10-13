export function errorToString(e) {
    return JSON.stringify({
        message: e.message,
        stack: e.stack,
        from: "translator",
    });
}

export function responseToAssistant(message) {
    const data = { message: message };
    const json = JSON.stringify(data);
    return new Response(json);
}
