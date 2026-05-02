import type { Spec } from "@json-render/core";

export function isRenderableSpec(spec: Spec | null | undefined): spec is Spec {
	return Boolean(spec?.root && spec.elements?.[spec.root]);
}
