const fs = require("fs");
const cp = require("child_process");

const updateFa12Schema = () => {
  console.log("Updating FA12 schema...");

  const filePath = "./src/utils/api/generated/schemas/fa12.ts";

  const fileData = fs.readFileSync(filePath, "utf8");

  var updatedData = fileData.replace(
    "import type { TezosTransaction } from './tezosTransaction';",
    "",
  );

  updatedData = updatedData.replace(
    "origination?: TezosTransaction;",
    "address?: string;",
  );

  try {
    fs.writeFileSync(filePath, updatedData, "utf8");

    console.log("Updated FA12 schema successfully.");
    console.log("Linting the file...");
    cp.execSync(`npx eslint --no-ignore --fix ${filePath}`);
    console.log("Linted the file successfully.");
  } catch (error) {
    throw new Error("Error while updating fa12 schema : " + error.message);
  }
};

const updateLenderPoolSchema = () => {
  console.log("Updating LenderPool schema...");

  const filePath = "./src/utils/api/generated/schemas/lenderPool.ts";

  const fileData = fs.readFileSync(filePath, "utf8");

  const updatedData = fileData.replace(
    "readonly global_interest?: string;",
    "global_interest?: number;",
  );

  try {
    fs.writeFileSync(filePath, updatedData, "utf8");

    console.log("Updated LenderPool schema successfully.");
    console.log("Linting the file...");
    cp.execSync(`npx eslint --no-ignore --fix ${filePath}`);
    console.log("Linted the file successfully.");
  } catch (error) {
    throw new Error(
      "Error while updating LenderPool schema : " + error.message,
    );
  }
};

const updateLenderDepositSchema = () => {
  console.log("Updating LenderDeposit schema...");

  const filePath = "./src/utils/api/generated/schemas/lenderDeposit.ts";

  const fileData = fs.readFileSync(filePath, "utf8");

  const updatedData = fileData.replace(
    "readonly interest?: string;",
    "interest?: number;",
  );

  try {
    fs.writeFileSync(filePath, updatedData, "utf8");

    console.log("Updated LenderDeposit schema successfully.");
    console.log("Linting the file...");
    cp.execSync(`npx eslint --no-ignore --fix ${filePath}`);
    console.log("Linted the file successfully.");
  } catch (error) {
    throw new Error(
      "Error while updating LenderDeposit schema : " + error.message,
    );
  }
};

const updateUserLenderPoolSchema = () => {
  console.log("Updating UserLenderPool schema...");

  const filePath = "./src/utils/api/generated/schemas/userLenderPools.ts";

  const fileData = fs.readFileSync(filePath, "utf8");

  const updatedData = fileData.replace(
    "readonly interest?: string;",
    "interest?: number;",
  );

  try {
    fs.writeFileSync(filePath, updatedData, "utf8");

    console.log("Updated UserLenderPool schema successfully.");
    console.log("Linting the file...");
    cp.execSync(`npx eslint --no-ignore --fix ${filePath}`);
    console.log("Linted the file successfully.");
  } catch (error) {
    throw new Error(
      "Error while updating UserLenderPool schema : " + error.message,
    );
  }
};

const updatefarmPoolschema = () => {
  console.log("Updating BorrowerPool schema...");

  const filePath = "./src/utils/api/generated/schemas/borrowerPool.ts";

  const fileData = fs.readFileSync(filePath, "utf8");

  var updatedData = fileData.replace(
    "readonly balanced_liquidation_threshold?: string;",
    "balanced_liquidation_threshold?: number;",
  );

  updatedData = updatedData.replace(
    "readonly unbalanced_liquidation_threshold?: string;",
    "unbalanced_liquidation_threshold?: number;",
  );

  try {
    fs.writeFileSync(filePath, updatedData, "utf8");

    console.log("Updated BorrowerPool schema successfully.");
    console.log("Linting the file...");
    cp.execSync(`npx eslint --no-ignore --fix ${filePath}`);
    console.log("Linted the file successfully.");
  } catch (error) {
    throw new Error(
      "Error while updating BorrowerPool schema : " + error.message,
    );
  }
};

updateFa12Schema();
updateLenderPoolSchema();
updateLenderDepositSchema();
updateUserLenderPoolSchema();
updatefarmPoolschema();
