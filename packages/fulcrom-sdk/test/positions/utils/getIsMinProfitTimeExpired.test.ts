import { getIsMinProfitTimeExpired } from "../../../src/positions/utils/getIsMinProfitTimeExpired";

describe("getIsMinProfitTimeExpired", () => {
  const realDateNow = Date.now;

  afterEach(() => {
    global.Date.now = realDateNow;
  });

  it("returns true if now > lastIncreasedTime", () => {
    const now = 1_700_000_000;
    global.Date.now = () => (now + 10) * 1000;
    expect(getIsMinProfitTimeExpired(now)).toBe(true);
  });

  it("returns false if now == lastIncreasedTime", () => {
    const now = 1_700_000_000;
    global.Date.now = () => now * 1000;
    expect(getIsMinProfitTimeExpired(now)).toBe(false);
  });

  it("returns false if now < lastIncreasedTime", () => {
    const now = 1_700_000_000;
    global.Date.now = () => (now - 10) * 1000;
    expect(getIsMinProfitTimeExpired(now)).toBe(false);
  });
});
