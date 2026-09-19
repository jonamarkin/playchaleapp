import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { load as parseYaml } from 'js-yaml';

/**
 * Validates responses against docs/api/openapi.yaml itself.
 *
 * OpenAPI 3.1 schemas are JSON Schema 2020-12, so the spec is loaded whole and referenced
 * by pointer — no second copy of the shapes to keep in sync, and no test that passes
 * because someone updated the test's idea of the contract instead of the contract.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const SPEC_PATH = path.join(here, '../../docs/api/openapi.yaml');
const SPEC_ID = 'https://playchale.app/openapi.yaml';

const spec = parseYaml(readFileSync(SPEC_PATH, 'utf8'));

const ajv = new Ajv2020({
    strict: false,
    allErrors: true,
    // The spec documents extra response fields loosely; we check the shapes we name.
    validateFormats: true,
});
addFormats(ajv);
ajv.addSchema({ ...spec, $id: SPEC_ID });

const cache = new Map();

function validatorFor(schemaName) {
    if (!cache.has(schemaName)) {
        const validate = ajv.getSchema(`${SPEC_ID}#/components/schemas/${schemaName}`);
        if (!validate) throw new Error(`No such schema in the spec: ${schemaName}`);
        cache.set(schemaName, validate);
    }
    return cache.get(schemaName);
}

/** Throws with a readable diff-ish message when `value` doesn't match the named schema. */
export function assertSchema(schemaName, value, context = '') {
    const validate = validatorFor(schemaName);
    if (validate(value)) return value;

    const problems = (validate.errors ?? [])
        .map((e) => `    ${e.instancePath || '/'} ${e.message}${e.params?.additionalProperty ? ` (${e.params.additionalProperty})` : ''}`)
        .join('\n');
    throw new Error(`${context || schemaName} does not match schema ${schemaName}:\n${problems}\n  got: ${JSON.stringify(value).slice(0, 400)}`);
}

/** A paginated envelope of `schemaName` items. */
export function assertPage(schemaName, value, context = '') {
    if (!value || !Array.isArray(value.items) || !('nextCursor' in value)) {
        throw new Error(`${context} is not a page envelope: ${JSON.stringify(value).slice(0, 200)}`);
    }
    value.items.forEach((item, i) => assertSchema(schemaName, item, `${context}[${i}]`));
    return value;
}

export { spec };
