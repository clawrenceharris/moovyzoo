// Simple verification script for FormLayout enhancement
const fs = require("fs");

console.log("🔍 Verifying FormLayout Enhancement...\n");

let allGood = true;

// Check if FormLayout exists
if (fs.existsSync("src/components/FormLayout.tsx")) {
  console.log("✅ FormLayout.tsx exists");
} else {
  console.log("❌ FormLayout.tsx missing");
  allGood = false;
}

// Check if FormLayout uses Headless UI Button
const formLayoutContent = fs.readFileSync(
  "src/components/FormLayout.tsx",
  "utf8"
);
if (
  formLayoutContent.includes('import { Button } from "@/components/ui/Button"')
) {
  console.log("✅ FormLayout imports enhanced Button component");
} else {
  console.log("❌ FormLayout missing Button import");
  allGood = false;
}

// Check if FormLayout uses Button components instead of raw buttons
if (
  formLayoutContent.includes("<Button") &&
  !formLayoutContent.includes("<button")
) {
  console.log("✅ FormLayout uses Button components instead of raw buttons");
} else {
  console.log("❌ FormLayout still uses raw button elements");
  allGood = false;
}

// Check if FormLayout has proper styling
if (
  formLayoutContent.includes("space-y-6") &&
  formLayoutContent.includes("space-y-4")
) {
  console.log("✅ FormLayout has enhanced spacing and layout");
} else {
  console.log("❌ FormLayout missing enhanced styling");
  allGood = false;
}

// Check if FormLayout has proper accessibility
if (
  formLayoutContent.includes('role="alert"') &&
  formLayoutContent.includes('aria-live="polite"')
) {
  console.log("✅ FormLayout has proper accessibility attributes");
} else {
  console.log("❌ FormLayout missing accessibility features");
  allGood = false;
}

// Check if ComponentShowcase includes FormLayout example
const showcaseContent = fs.readFileSync(
  "src/components/ui/examples/ComponentShowcase.tsx",
  "utf8"
);
if (
  showcaseContent.includes("FormLayoutExample") &&
  showcaseContent.includes("Enhanced FormLayout")
) {
  console.log("✅ ComponentShowcase includes FormLayout demonstration");
} else {
  console.log("❌ ComponentShowcase missing FormLayout example");
  allGood = false;
}

console.log(
  "\n" +
    (allGood
      ? "🎉 FormLayout enhancement verified successfully!"
      : "⚠️  Some issues found")
);
