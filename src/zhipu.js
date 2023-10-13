import { ENV } from "./env";
import * as jose from "jose";

export async function completion(sentence) {
    // init authentication information
    let [id, secret] = ENV.ZHIPU_TOKEN.split(".");
    if (id === undefined || secret === undefined) {
        throw new Error("invalid apikey");
    }

    let timestamp = new Date().getTime();
    let payload = {
        api_key: id,
        exp: timestamp + 1000 * 60,
        timestamp: timestamp,
    };
    secret = new TextEncoder().encode(secret);
    let jwt = new jose.SignJWT(payload).setProtectedHeader({
        alg: "HS256",
        sign_type: "SIGN",
    });
    let token = await jwt.sign(secret);

    const headers = {
        "Content-Type": "application/json",
        accept: "text/event-stream",
        Authorization: token,
    };

    // one time prompt
    const messages = [
        {
            role: "user",
            content: sentence,
        },
    ];

    // json body
    let body = {
        prompt: messages,
    };

    console.log(`Sending...\n${JSON.stringify(body)}`);
    const res = await fetch(
        `https://open.bigmodel.cn/api/paas/v3/model-api/${ENV.ZHIPU_MODEL}/sse-invoke`,
        {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body),
        }
    );

    // read response from sse-invoke
    if (res.ok) {
        let target = "";
        let errRes = res.clone();
        const reader = res.body.getReader();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    if (target === "") {
                        let json = await errRes.json();
                        if (json.msg) {
                            throw json.msg;
                        } else {
                            throw JSON.stringify(json);
                        }
                    }
                    return target.trim();
                }
                const str = new TextDecoder().decode(value);
                console.log(`${str}`);
                let list = str.split("\n");
                for (let line of list) {
                    if (line.startsWith("data:")) {
                        let data = line.replace("data:", "");
                        if (data === "") {
                            target += "\n";
                        } else {
                            target += data;
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
            try {
                errRes.json();
            } catch (e) {
                console.log(`Finally clean requestClone failed...never mind.`)
            }
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(
            res.data
        )}`;
    }
}
