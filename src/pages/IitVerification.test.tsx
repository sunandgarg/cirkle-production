import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import IitVerification from "./IitVerification";

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  refetchProfile: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: mocks.invoke } },
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "test-user" },
    profile: null,
    refetchProfile: mocks.refetchProfile,
  }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/components/PostVerifyOnboarding", () => ({
  default: () => <div>Onboarding shown</div>,
}));

describe("IIT email OTP test mode", () => {
  afterEach(() => vi.unstubAllEnvs());

  beforeEach(() => {
    mocks.invoke.mockReset();
    mocks.refetchProfile.mockReset();
    mocks.invoke
      .mockResolvedValueOnce({ data: { success: true, test_mode: true }, error: null })
      .mockResolvedValueOnce({ data: { success: true }, error: null });
  });

  it("shows the real OTP input and verifies test code 123456", async () => {
    render(
      <MemoryRouter>
        <IitVerification />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("IIT Delhi", { exact: true }));
    fireEvent.click(screen.getByText("🎓 Current Student", { exact: true }));
    fireEvent.change(screen.getByPlaceholderText("yourname@iitd.ac.in"), {
      target: { value: "student@iitd.ac.in" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Verification Code" }));

    expect(await screen.findByText("Test mode", { exact: true })).toBeVisible();
    expect(screen.getByText("123456", { exact: true })).toBeVisible();
    expect(mocks.invoke).toHaveBeenNthCalledWith(1, "send-verification-email", {
      body: {
        email: "student@iitd.ac.in",
        iit_name: "IIT Delhi",
        student_status: "current_student",
      },
    });

    const otpInput = document.querySelector<HTMLInputElement>("input[data-input-otp]");
    expect(otpInput).not.toBeNull();
    fireEvent.change(otpInput!, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify & Continue" }));

    await waitFor(() => {
      expect(mocks.invoke).toHaveBeenNthCalledWith(2, "verify-iit-email", {
        body: {
          email: "student@iitd.ac.in",
          code: "123456",
          iit_name: "IIT Delhi",
          student_status: "current_student",
        },
      });
    });
    expect(await screen.findByText("Onboarding shown")).toBeVisible();
  });

  it("can run the email OTP screen without Edge Functions in browser test mode", async () => {
    vi.stubEnv("VITE_ENABLE_TEST_OTP", "true");
    render(
      <MemoryRouter>
        <IitVerification />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("IIT Delhi", { exact: true }));
    fireEvent.click(screen.getByText("🎓 Current Student", { exact: true }));
    fireEvent.change(screen.getByPlaceholderText("yourname@iitd.ac.in"), {
      target: { value: "student@iitd.ac.in" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Verification Code" }));

    expect(await screen.findByText("Test mode", { exact: true })).toBeVisible();
    expect(mocks.invoke).not.toHaveBeenCalled();

    const otpInput = document.querySelector<HTMLInputElement>("input[data-input-otp]");
    expect(otpInput).not.toBeNull();
    fireEvent.change(otpInput!, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify & Continue" }));

    expect(await screen.findByText("Onboarding shown")).toBeVisible();
    expect(mocks.invoke).not.toHaveBeenCalled();
  });
});
