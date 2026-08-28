import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";

const homePath = new URL("../client/src/pages/Home.tsx", import.meta.url);

describe("brand registration UI wiring", () => {
  it("keeps both entry buttons connected to the registration dialog and refreshes the list", async () => {
    const source = await readFile(homePath, "utf8");

    expect(source).toContain("function BrandCreateDialog");
    expect(source).toContain("onClick={onAddBrand}");
    expect(source).toContain("await utils.brands.list.invalidate()");
    expect(source).toContain("trpc.brands.list.useQuery");
    expect(source).toContain("brandNames = brandList.data?.length");
    expect(source).toContain('"고객 질문"');
    expect(source).toContain('"첫 글"');
    expect(source).toContain('localStorage.setItem("blogmate.onboarding.draft"');
    expect(source).toContain("자동 저장됨");
  });
});
