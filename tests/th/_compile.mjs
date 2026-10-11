// Shared helper for the task-hypergraph gates: compile a Svelte component
// in-process (no subprocess) and return the compiler warnings.
import { readFileSync } from 'node:fs';
import { compile } from 'svelte/compiler';

export function compileSvelte(path) {
	const source = readFileSync(path, 'utf8');
	let result;
	try {
		result = compile(source, { generate: 'client', filename: path });
	} catch (e) {
		if (/generate/.test(String(e && e.message))) {
			result = compile(source, { generate: 'dom', filename: path });
		} else {
			throw e;
		}
	}
	return { source, warnings: result.warnings ?? [] };
}

export function read(path) {
	return readFileSync(path, 'utf8');
}
