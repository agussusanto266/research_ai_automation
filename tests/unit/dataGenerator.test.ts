import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  randomEmail,
  randomFirstName,
  randomLastName,
  randomFullName,
  randomZip,
  randomPhone,
  randomInt,
  randomPrice,
  randomUsername,
} from "../../utils/dataGenerator";

describe("dataGenerator", () => {
  it("randomEmail returns a valid-looking email", () => {
    const email = randomEmail("buyer");
    assert.match(email, /^buyer\+\d+@[\w.]+\.test$/);
  });

  it("randomEmail uses default prefix when none given", () => {
    const email = randomEmail();
    assert.match(email, /^testuser\+/);
  });

  it("randomFirstName returns a non-empty string", () => {
    assert.ok(randomFirstName().length > 0);
  });

  it("randomLastName returns a non-empty string", () => {
    assert.ok(randomLastName().length > 0);
  });

  it("randomFullName contains first and last name", () => {
    const full = randomFullName();
    const parts = full.split(" ");
    assert.strictEqual(parts.length, 2);
    assert.ok(parts[0].length > 0);
    assert.ok(parts[1].length > 0);
  });

  it("randomZip returns a 5-digit string", () => {
    const zip = randomZip();
    assert.match(zip, /^\d{5}$/);
  });

  it("randomPhone returns a formatted phone number", () => {
    const phone = randomPhone();
    assert.match(phone, /^\+1-\d{3}-\d{3}-\d{4}$/);
  });

  it("randomInt returns value in range", () => {
    for (let i = 0; i < 100; i++) {
      const v = randomInt(1, 10);
      assert.ok(v >= 1 && v <= 10, `Expected 1–10 but got ${v}`);
    }
  });

  it("randomPrice returns a formatted price string", () => {
    const price = randomPrice(1, 100);
    assert.match(price, /^\$\d+\.\d{2}$/);
  });

  it("randomUsername returns prefixed string with digits", () => {
    const u = randomUsername("qa");
    assert.match(u, /^qa_\d{6}$/);
  });
});
