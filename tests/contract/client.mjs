/**
 * A tiny HTTP client for the contract suite: one cookie jar per "person", so a test can
 * hold two signed-in players at once and see what each of them is allowed to do.
 */
export class Session {
    constructor(baseUrl, label) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.label = label;
        this.cookie = null;
    }

    async request(method, path, { body, idempotencyKey, expect = null } = {}) {
        const headers = { accept: 'application/json' };
        if (body !== undefined) headers['content-type'] = 'application/json';
        if (this.cookie) headers.cookie = this.cookie;
        if (idempotencyKey) headers['idempotency-key'] = idempotencyKey;

        const response = await fetch(`${this.baseUrl}${path}`, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
            redirect: 'manual',
        });

        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
            const pair = setCookie.split(';')[0];
            this.cookie = pair.startsWith('pc_session=;') ? null : pair;
        }

        const text = await response.text();
        const payload = text ? JSON.parse(text) : null;

        if (expect !== null && response.status !== expect) {
            throw new Error(
                `${this.label}: ${method} ${path} expected ${expect}, got ${response.status}` +
                `\n  body: ${text.slice(0, 400)}`
            );
        }
        return { status: response.status, body: payload };
    }

    get = (path, options) => this.request('GET', path, options);
    post = (path, body, options) => this.request('POST', path, { body, ...options });
    put = (path, body, options) => this.request('PUT', path, { body, ...options });
    patch = (path, body, options) => this.request('PATCH', path, { body, ...options });
    del = (path, options) => this.request('DELETE', path, options);
}
