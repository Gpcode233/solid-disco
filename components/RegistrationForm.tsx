"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  SpinnerGap,
  WarningCircle,
  Lock,
  CaretDown,
} from "@phosphor-icons/react";
import { eventConfig } from "@/lib/config";
import { RegistrationFormData } from "@/lib/validation";

interface RegistrationFormProps {
  registrationCode: string;
  onSuccess: (data: RegistrationFormData) => void;
}

export default function RegistrationForm({
  registrationCode,
  onSuccess,
}: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationFormData>({
    registrationCode,
    name: "",
    contactNumber: "",
    email: "",
    stateOfOrigin: "",
    denomination: "",
    address: "",
    sex: "",
    ageBracket: "",
    categoryOfInterest: "",
    suggestions: "",
    futureContact: "Yes",
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegistrationFormData, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    field: keyof RegistrationFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Client validation
    const errors: Partial<Record<keyof RegistrationFormData, string>> = {};
    if (!formData.name.trim()) errors.name = "Full Name is required.";
    if (!formData.contactNumber.trim()) errors.contactNumber = "Contact phone number is required.";
    if (!formData.email.trim() || !formData.email.includes("@")) errors.email = "A valid email is required.";
    if (!formData.stateOfOrigin.trim()) errors.stateOfOrigin = "State of Origin is required.";
    if (!formData.denomination.trim()) errors.denomination = "Denomination is required.";
    if (!formData.address.trim()) errors.address = "Address is required.";
    if (!formData.sex) errors.sex = "Please select your sex.";
    if (!formData.ageBracket) errors.ageBracket = "Please select your age bracket.";
    if (!formData.categoryOfInterest) errors.categoryOfInterest = "Please select a category of interest.";
    if (!formData.suggestions.trim()) errors.suggestions = "Please share suggestions for future projects.";
    if (!formData.futureContact) errors.futureContact = "Please select a response.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError("Please fill in all required fields marked with an asterisk (*).");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        setFormError(
          data.message || "Failed to complete registration. Please try again."
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      onSuccess(formData);
    } catch (err) {
      console.error("Submission error:", err);
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-10 shadow-xs">
        {/* Verified Code Header Banner */}
        <div className="flex items-center justify-between bg-brand-light border border-brand-border rounded-xl p-3.5 sm:p-4 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center">
              <CheckCircle size={16} weight="fill" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand block">
                Code Verified & Unlocked
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-neutral-900">
                {registrationCode}
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs text-neutral-500 font-medium">
            <Lock size={14} className="text-brand" weight="fill" />
            <span>Single Use</span>
          </div>
        </div>

        {/* Section Heading */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
            Complete Your Registration
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Please fill out your accurate details below to confirm your seat for the program.
          </p>
        </div>

        {/* Top-level error notification */}
        {formError && (
          <div className="mb-6 p-4 rounded-xl bg-purple-50/60 border border-brand-border text-brand text-xs sm:text-sm flex items-start gap-2.5">
            <WarningCircle size={18} weight="fill" className="shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span>{formError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-700 block mb-1.5"
            >
              Full Name <span className="text-brand">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Bassey Manfred Mbang"
              className={`w-full px-4 py-3 rounded-xl border text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${
                fieldErrors.name
                  ? "border-brand focus:border-brand"
                  : "border-neutral-300 focus:border-brand"
              }`}
            />
            {fieldErrors.name && (
              <p className="text-xs text-brand font-medium mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* Contact Number & Email Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="contactNumber"
                className="text-xs font-semibold uppercase tracking-wider text-neutral-700 block mb-1.5"
              >
                Contact Number <span className="text-brand">*</span>
              </label>
              <input
                id="contactNumber"
                type="tel"
                required
                value={formData.contactNumber}
                onChange={(e) => handleChange("contactNumber", e.target.value)}
                placeholder="e.g. 08012345678"
                className={`w-full px-4 py-3 rounded-xl border text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${
                  fieldErrors.contactNumber
                    ? "border-brand focus:border-brand"
                    : "border-neutral-300 focus:border-brand"
                }`}
              />
              {fieldErrors.contactNumber && (
                <p className="text-xs text-brand font-medium mt-1">
                  {fieldErrors.contactNumber}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-neutral-700 block mb-1.5"
              >
                E-Mail Address <span className="text-brand">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="e.g. participant@example.com"
                className={`w-full px-4 py-3 rounded-xl border text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${
                  fieldErrors.email
                    ? "border-brand focus:border-brand"
                    : "border-neutral-300 focus:border-brand"
                }`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-brand font-medium mt-1">{fieldErrors.email}</p>
              )}
            </div>
          </div>

          {/* State of Origin & Denomination Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="stateOfOrigin"
                className="text-xs font-semibold uppercase tracking-wider text-neutral-700 block mb-1.5"
              >
                State of Origin <span className="text-brand">*</span>
              </label>
              <input
                id="stateOfOrigin"
                type="text"
                required
                value={formData.stateOfOrigin}
                onChange={(e) => handleChange("stateOfOrigin", e.target.value)}
                placeholder="e.g. Enugu, Cross River, etc."
                className={`w-full px-4 py-3 rounded-xl border text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${
                  fieldErrors.stateOfOrigin
                    ? "border-brand focus:border-brand"
                    : "border-neutral-300 focus:border-brand"
                }`}
              />
              {fieldErrors.stateOfOrigin && (
                <p className="text-xs text-brand font-medium mt-1">
                  {fieldErrors.stateOfOrigin}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="denomination"
                className="text-xs font-semibold uppercase tracking-wider text-neutral-700 block mb-1.5"
              >
                Denomination / Affiliation <span className="text-brand">*</span>
              </label>
              <input
                id="denomination"
                type="text"
                required
                value={formData.denomination}
                onChange={(e) => handleChange("denomination", e.target.value)}
                placeholder="e.g. Anglican, Catholic, etc."
                className={`w-full px-4 py-3 rounded-xl border text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${
                  fieldErrors.denomination
                    ? "border-brand focus:border-brand"
                    : "border-neutral-300 focus:border-brand"
                }`}
              />
              {fieldErrors.denomination && (
                <p className="text-xs text-brand font-medium mt-1">
                  {fieldErrors.denomination}
                </p>
              )}
            </div>
          </div>

          {/* Residential Address */}
          <div>
            <label
              htmlFor="address"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-700 block mb-1.5"
            >
              Residential Address <span className="text-brand">*</span>
            </label>
            <textarea
              id="address"
              rows={2}
              required
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Enter your current residential address"
              className={`w-full px-4 py-3 rounded-xl border text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all resize-none ${
                fieldErrors.address
                  ? "border-brand focus:border-brand"
                  : "border-neutral-300 focus:border-brand"
              }`}
            />
            {fieldErrors.address && (
              <p className="text-xs text-brand font-medium mt-1">{fieldErrors.address}</p>
            )}
          </div>

          {/* Sex & Age Bracket Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="sex"
                className="text-xs font-semibold uppercase tracking-wider text-neutral-700 block mb-1.5"
              >
                Sex <span className="text-brand">*</span>
              </label>
              <div className="relative">
                <select
                  id="sex"
                  required
                  value={formData.sex}
                  onChange={(e) => handleChange("sex", e.target.value)}
                  className={`w-full appearance-none px-4 py-3 rounded-xl border text-neutral-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${
                    fieldErrors.sex
                      ? "border-brand focus:border-brand"
                      : "border-neutral-300 focus:border-brand"
                  }`}
                >
                  <option value="" disabled>
                    Select Sex
                  </option>
                  {eventConfig.formOptions.sex.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <CaretDown
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                />
              </div>
              {fieldErrors.sex && (
                <p className="text-xs text-brand font-medium mt-1">{fieldErrors.sex}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="ageBracket"
                className="text-xs font-semibold uppercase tracking-wider text-neutral-700 block mb-1.5"
              >
                Age Bracket <span className="text-brand">*</span>
              </label>
              <div className="relative">
                <select
                  id="ageBracket"
                  required
                  value={formData.ageBracket}
                  onChange={(e) => handleChange("ageBracket", e.target.value)}
                  className={`w-full appearance-none px-4 py-3 rounded-xl border text-neutral-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${
                    fieldErrors.ageBracket
                      ? "border-brand focus:border-brand"
                      : "border-neutral-300 focus:border-brand"
                  }`}
                >
                  <option value="" disabled>
                    Select Age Bracket
                  </option>
                  {eventConfig.formOptions.ageBrackets.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <CaretDown
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                />
              </div>
              {fieldErrors.ageBracket && (
                <p className="text-xs text-brand font-medium mt-1">
                  {fieldErrors.ageBracket}
                </p>
              )}
            </div>
          </div>

          {/* Category of Interest Dropdown */}
          <div>
            <label
              htmlFor="categoryOfInterest"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-700 block mb-1.5"
            >
              Category of Interest <span className="text-brand">*</span>
            </label>
            <p className="text-xs text-neutral-400 mb-2">
              Kindly select the category of interest that best aligns with your goals.
            </p>
            <div className="relative">
              <select
                id="categoryOfInterest"
                required
                value={formData.categoryOfInterest}
                onChange={(e) => handleChange("categoryOfInterest", e.target.value)}
                className={`w-full appearance-none px-4 py-3 rounded-xl border text-neutral-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${
                  fieldErrors.categoryOfInterest
                    ? "border-brand focus:border-brand"
                    : "border-neutral-300 focus:border-brand"
                }`}
              >
                <option value="" disabled>
                  Select Category of Interest
                </option>
                {eventConfig.formOptions.categories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <CaretDown
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
            </div>
            {fieldErrors.categoryOfInterest && (
              <p className="text-xs text-brand font-medium mt-1">
                {fieldErrors.categoryOfInterest}
              </p>
            )}
          </div>

          {/* Suggestions for Future Projects */}
          <div>
            <label
              htmlFor="suggestions"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-700 block mb-1.5"
            >
              Suggestions for Future Projects <span className="text-brand">*</span>
            </label>
            <textarea
              id="suggestions"
              rows={3}
              required
              value={formData.suggestions}
              onChange={(e) => handleChange("suggestions", e.target.value)}
              placeholder="What topics, skill tracks, or community projects would you love to see organized in future editions?"
              className={`w-full px-4 py-3 rounded-xl border text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all resize-none ${
                fieldErrors.suggestions
                  ? "border-brand focus:border-brand"
                  : "border-neutral-300 focus:border-brand"
              }`}
            />
            {fieldErrors.suggestions && (
              <p className="text-xs text-brand font-medium mt-1">
                {fieldErrors.suggestions}
              </p>
            )}
          </div>

          {/* Future Contact Radio */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700 block mb-2">
              Would you like to be contacted for future events or competitions?{" "}
              <span className="text-brand">*</span>
            </label>
            <div className="flex flex-wrap items-center gap-6 pt-1">
              {eventConfig.formOptions.futureContact.map((option) => (
                <label
                  key={option}
                  className="inline-flex items-center gap-2 cursor-pointer text-sm text-neutral-800 font-medium"
                >
                  <input
                    type="radio"
                    name="futureContact"
                    value={option}
                    checked={formData.futureContact === option}
                    onChange={(e) => handleChange("futureContact", e.target.value)}
                    className="w-4 h-4 text-brand focus:ring-brand/20 border-neutral-300"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {fieldErrors.futureContact && (
              <p className="text-xs text-brand font-medium mt-1">
                {fieldErrors.futureContact}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-brand text-white font-semibold text-base hover:bg-brand-hover active:bg-brand-active disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <SpinnerGap size={20} className="animate-spin" />
                  <span>Submitting Registration...</span>
                </>
              ) : (
                <span>Complete Registration</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
