import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import OtpVerification from "./OtpVerification";

const authMocks = vi.hoisted(() => ({
  signInWithOtp: vi.fn(),
  verifyOtp: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: authMocks },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

afterEach(() => {
  vi.unstubAllEnvs();
  authMocks.signInWithOtp.mockReset();
  authMocks.verifyOtp.mockReset();
});

describe("phone OTP test mode", () => {
  it("shows and accepts 123456 without contacting Supabase Auth", async () => {
    vi.stubEnv("VITE_ENABLE_TEST_OTP", "true");
    render(
      <MemoryRouter initialEntries={[{ pathname: "/otp-verify", state: { phone: "8700602524", countryCode: "+91", fullPhone: "+918700602524", testMode: true } }]}>
        <OtpVerification />
      </MemoryRouter>,
    );

    expect(screen.getByText("Test mode", { exact: true })).toBeVisible();
    expect(screen.getByText("123456", { exact: true })).toBeVisible();

    const otpInput = document.querySelector<HTMLInputElement>("input[data-input-otp]");
    expect(otpInput).not.toBeNull();
    fireEvent.change(otpInput!, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify & Continue" }));

    expect(authMocks.verifyOtp).not.toHaveBeenCalled();
    expect(authMocks.signInWithOtp).not.toHaveBeenCalled();
  });
});
