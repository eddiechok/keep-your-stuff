import { InjectionToken } from "@angular/core";

const defaultErrors = {
  required: () => `This field is required`,
  minlength: ({ requiredLength, actualLength }) =>
    `Expect ${requiredLength} but got ${actualLength}`
};

export type FormErrors = typeof defaultErrors;

export const FORM_ERRORS = new InjectionToken("FORM_ERRORS", {
  providedIn: "root",
  factory: () => defaultErrors
});
