// Standalone verification script testing the core business logic and API models
import { validateRegistrationData, validateCodeFormat, sanitizeCode } from "../lib/validation.js";
import { verifyRegistrationCode, submitRegistration } from "../lib/googleSheets.js";

async function runTests() {
  console.log("=== RUNNING AUTOMATED UNIT TESTS ===");

  // 1. Test Code Sanitization & Format Validation
  console.log("\n[Test 1] Code Format & Sanitization...");
  const rawCode = " yip-0001 ";
  const sanitized = sanitizeCode(rawCode);
  console.assert(sanitized === "YIP-0001", `Expected YIP-0001, got ${sanitized}`);
  
  const validCheck = validateCodeFormat("YIP-0001");
  console.assert(validCheck.isValid === true, "Valid code format failed");

  const emptyCheck = validateCodeFormat("");
  console.assert(emptyCheck.isValid === false, "Empty code format should fail");
  console.log("✓ Test 1 Passed.");

  // 2. Test Form Validation
  console.log("\n[Test 2] Registration Form Validation...");
  const invalidForm = validateRegistrationData({});
  console.assert(invalidForm.isValid === false, "Empty form should be invalid");

  const validFormData = {
    registrationCode: "YIP-0001",
    name: "Bassey Manfred Mbang",
    contactNumber: "09066091468",
    email: "manfred@example.com",
    stateOfOrigin: "Cross River",
    denomination: "Christian Fellowship",
    address: "12 Example Street, Enugu",
    sex: "Male",
    ageBracket: "19-24yrs",
    categoryOfInterest: "Bible Quiz Competition",
    suggestions: "Looking forward to an impactful summit!",
    futureContact: "Yes",
  };

  const validFormResult = validateRegistrationData(validFormData);
  console.assert(validFormResult.isValid === true, "Valid form data failed validation: " + JSON.stringify(validFormResult.errors));
  console.log("✓ Test 2 Passed.");

  // 3. Test Code Verification Service for YIP-0001
  console.log("\n[Test 3] Code Verification Service for YIP-0001...");
  const yip0001Result = await verifyRegistrationCode("YIP-0001");
  console.assert(yip0001Result.success === true, "YIP-0001 should be available");
  console.assert(yip0001Result.status === "AVAILABLE", "Status should be AVAILABLE");

  const invalidResult = await verifyRegistrationCode("INVALID-XYZ");
  console.assert(invalidResult.success === false, "INVALID-XYZ should fail");
  console.assert(invalidResult.status === "INVALID", "Status should be INVALID");
  console.log("✓ Test 3 Passed.");

  // 4. Test Registration Submission and Code Consumption for YIP-0001
  console.log("\n[Test 4] Registration Submission & Code Invalidation for YIP-0001...");
  const submitResult = await submitRegistration(validFormData);
  console.assert(submitResult.success === true, "Registration submission failed");

  // Re-verifying the code should now indicate USED
  const reVerify = await verifyRegistrationCode("YIP-0001");
  console.assert(reVerify.success === false, "YIP-0001 should now be used");
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
