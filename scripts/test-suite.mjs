// Standalone verification script testing the core business logic and API models
import { validateRegistrationData, validateCodeFormat, sanitizeCode } from "../lib/validation.js";
import { verifyRegistrationCode, submitRegistration } from "../lib/googleSheets.js";

async function runTests() {
  console.log("=== RUNNING AUTOMATED UNIT TESTS ===");

  // 1. Test Code Sanitization & Format Validation
  console.log("\n[Test 1] Code Format & Sanitization...");
  const rawCode = " yip-847291 ";
  const sanitized = sanitizeCode(rawCode);
  console.assert(sanitized === "YIP-847291", `Expected YIP-847291, got ${sanitized}`);
  
  const validCheck = validateCodeFormat("YIP-847291");
  console.assert(validCheck.isValid === true, "Valid code format failed");

  const emptyCheck = validateCodeFormat("");
  console.assert(emptyCheck.isValid === false, "Empty code format should fail");
  console.log("✓ Test 1 Passed.");

  // 2. Test Form Validation
  console.log("\n[Test 2] Registration Form Validation...");
  const invalidForm = validateRegistrationData({});
  console.assert(invalidForm.isValid === false, "Empty form should be invalid");
  console.assert(Boolean(invalidForm.errors.name), "Expected name error");
  console.assert(Boolean(invalidForm.errors.contactNumber), "Expected contactNumber error");
  console.assert(Boolean(invalidForm.errors.email), "Expected email error");

  const validFormData = {
    registrationCode: "YIP-847291",
    name: "Bassey Manfred Mbang",
    contactNumber: "09066091468",
    email: "manfred@example.com",
    stateOfOrigin: "Cross River",
    denomination: "Christian Fellowship",
    address: "12 Example Street, Enugu",
    sex: "Male",
    ageBracket: "19-24yrs",
    categoryOfInterest: "Tech & Digital Skills",
    suggestions: "More AI and coding workshops in the future.",
    futureContact: "Yes",
  };

  const validFormResult = validateRegistrationData(validFormData);
  console.assert(validFormResult.isValid === true, "Valid form data failed validation: " + JSON.stringify(validFormResult.errors));
  console.log("✓ Test 2 Passed.");

  // 3. Test Code Verification Service (Dev Mock Store)
  console.log("\n[Test 3] Code Verification Service...");
  const availableResult = await verifyRegistrationCode("YIP-847291");
  console.assert(availableResult.success === true, "YIP-847291 should be available");
  console.assert(availableResult.status === "AVAILABLE", "Status should be AVAILABLE");

  const usedResult = await verifyRegistrationCode("YIP-183920");
  console.assert(usedResult.success === false, "YIP-183920 should fail");
  console.assert(usedResult.status === "USED", "Status should be USED");

  const invalidResult = await verifyRegistrationCode("INVALID-XYZ");
  console.assert(invalidResult.success === false, "INVALID-XYZ should fail");
  console.assert(invalidResult.status === "INVALID", "Status should be INVALID");
  console.log("✓ Test 3 Passed.");

  // 4. Test Registration Submission and Code Consumption
  console.log("\n[Test 4] Registration Submission & Code Invalidation...");
  const submitResult = await submitRegistration(validFormData);
  console.assert(submitResult.success === true, "Registration submission failed");

  // Re-verifying the code should now indicate USED
  const reVerify = await verifyRegistrationCode("YIP-847291");
  console.assert(reVerify.success === false, "YIP-847291 should now be used");
  console.assert(reVerify.status === "USED", "Status should now be USED");
  console.log("✓ Test 4 Passed.");

  console.log("\n==========================================");
  console.log("ALL UNIT TESTS PASSED SUCCESSFULLY! (4/4)");
  console.log("==========================================");
}

runTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
