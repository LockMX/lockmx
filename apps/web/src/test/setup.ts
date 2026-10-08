import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { installDialogDouble } from "@/test/dialog-double";

// Testing Library only cleans up automatically when Vitest globals are enabled.
afterEach(cleanup);

// For every test file: any component may hold a `Dialog`.
installDialogDouble();
