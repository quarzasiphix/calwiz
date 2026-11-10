import "@testing-library/jest-dom/vitest";

// Deterministic formatting: British English day-month order.
Object.defineProperty(window.navigator, "language", { value: "en-GB", configurable: true });
