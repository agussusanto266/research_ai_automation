const FIRST_NAMES = ["Alice", "Bob", "Carol", "Dave", "Eve", "Frank", "Grace", "Hank"];
const LAST_NAMES = ["Smith", "Jones", "Brown", "Taylor", "Wilson", "Davis", "Miller"];
const DOMAINS = ["example.test", "qa.test", "automation.test"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function digits(n: number): string {
  return String(Math.floor(Math.random() * Math.pow(10, n))).padStart(n, "0");
}

export function randomEmail(prefix = "testuser"): string {
  return `${prefix}+${Date.now()}@${pick(DOMAINS)}`;
}

export function randomFirstName(): string {
  return pick(FIRST_NAMES);
}

export function randomLastName(): string {
  return pick(LAST_NAMES);
}

export function randomFullName(): string {
  return `${randomFirstName()} ${randomLastName()}`;
}

export function randomZip(): string {
  return digits(5);
}

export function randomPhone(): string {
  return `+1-${digits(3)}-${digits(3)}-${digits(4)}`;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomPrice(min = 1, max = 999): string {
  return `$${(randomInt(min * 100, max * 100) / 100).toFixed(2)}`;
}

export function randomUsername(prefix = "user"): string {
  return `${prefix}_${digits(6)}`;
}
