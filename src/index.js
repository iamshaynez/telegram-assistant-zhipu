import { completion } from "./zhipu";
import { responseToAssistant, errorToString } from "./util";
import { initEnv } from "./env";

export default {
    async fetch(request, env) {
        console.log(`Recieved request on LLM`)
        initEnv(env)
        try {
            const body = await request.json();
            const text = body.message.text;
            console.log(`Text: ${text}`)
            const reply = await completion(text)
            console.log(`Reply Message: ${reply}`)
            return responseToAssistant(reply);
        } catch (e) {
            console.error(e);
            return responseToAssistant(errorToString(e));
        }
    },
};

