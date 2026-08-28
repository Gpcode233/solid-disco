import { eventConfig } from "./config";

export interface RegistrationFormData {
  registrationCode: string;
  name: string;
  contactNumber: string;
  email: string;
  stateOfOrigin: string;
  denomination: string;
  address: string;
  sex: string;
  ageBracket: string;
  categoryOfInterest: string;
  suggestions: string;
  futureContact: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof RegistrationFormData, string>>;
}

export function sanitizeCode(code: string): string {
  return (code || "").trim().toUpperCase();
}

export function validateCodeFormat(code: string): { isValid: boolean; error?: string } {
  const sanitized = sanitizeCode(code);
  if (!sanitized) {
    return { isValid: false, error: "Please enter your registration code." };
  }
  if (sanitized.length < 3 || sanitized.length > 32) {
    return { isValid: false, error: "Registration code must be between 3 and 32 characters." };
  }
  return { isValid: true };
}

export function validateRegistrationData(data: Partial<RegistrationFormData>): ValidationResult {
  const errors: Partial<Record<keyof RegistrationFormData, string>> = {};

  if (!data.registrationCode || !sanitizeCode(data.registrationCode)) {
    errors.registrationCode = "Registration code is required.";
  }

  if (!data.name || data.name.trim().length < 2) {
    errors.name = "Please enter your full name.";
  }

  if (!data.contactNumber || data.contactNumber.trim().length < 7) {
    errors.contactNumber = "Please enter a valid contact phone number.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!data.stateOfOrigin || data.stateOfOrigin.trim().length < 2) {
    errors.stateOfOrigin = "Please enter your state of origin.";
  }

  if (!data.denomination || data.denomination.trim().length < 2) {
    errors.denomination = "Please enter your denomination or affiliation.";
  }

  if (!data.address || data.address.trim().length < 3) {
    errors.address = "Please enter your address.";
  }

  if (!data.sex || !eventConfig.formOptions.sex.includes(data.sex)) {
    errors.sex = "Please select your sex.";
  }

  if (!data.ageBracket || !eventConfig.formOptions.ageBrackets.includes(data.ageBracket)) {
    errors.ageBracket = "Please select your age bracket.";
  }

  if (!data.categoryOfInterest || !data.categoryOfInterest.trim()) {
    errors.categoryOfInterest = "Please select your category of interest.";
  }

  if (!data.suggestions || data.suggestions.trim().length < 2) {
    errors.suggestions = "Please provide your suggestions for future projects.";
  }

  if (!data.futureContact || !eventConfig.formOptions.futureContact.includes(data.futureContact)) {
    errors.futureContact = "Please select an option for future contact.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
