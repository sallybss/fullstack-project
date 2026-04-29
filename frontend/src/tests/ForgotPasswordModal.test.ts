import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import ForgotPasswordModal from "../components/auth/ForgotPasswordModal.vue";

describe("ForgotPasswordModal", () => {
  it("emits email updates and submit when the form is sent", async () => {
    const wrapper = mount(ForgotPasswordModal, {
      props: {
        email: "",
        error: "",
      },
    });

    await wrapper.get("input[type='email']").setValue("student@example.com");
    await wrapper.get("form").trigger("submit");

    expect(wrapper.emitted("update:email")?.[0]).toEqual(["student@example.com"]);
    expect(wrapper.emitted("submit")).toHaveLength(1);
  });
});
