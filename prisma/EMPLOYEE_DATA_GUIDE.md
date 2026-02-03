# Employee Data Transformation Guide

This guide explains how to transform your employee data to match the Prisma schema using the `employee-data-template.json` file.

## Template File

**Location**: `prisma/employee-data-template.json`

## Field Descriptions

### Step 1: Basic Information

| Field            | Type    | Required | Description                | Example                      |
| ---------------- | ------- | -------- | -------------------------- | ---------------------------- |
| `id`             | Integer | Yes      | Unique employee ID         | `4088`                       |
| `employeeCode`   | Integer | Yes      | Unique employee code       | `10001`                      |
| `profilePicture` | String  | No       | URL to profile picture     | `null` or `"https://..."`    |
| `nameEn`         | String  | Yes      | Employee name in English   | `"MAHMOOD AHMAD AHMAD KHAN"` |
| `nameAr`         | String  | No       | Employee name in Arabic    | `"محمود احمد - أحمد خان"`    |
| `dob`            | Date    | No       | Date of birth (ISO format) | `"1975-01-01"`               |
| `phone`          | String  | No       | Phone number               | `"0501198042"`               |

### Step 2: Employment Details

| Field                | Type    | Required | Description                          | Example                                        |
| -------------------- | ------- | -------- | ------------------------------------ | ---------------------------------------------- |
| `gender`             | String  | No       | Gender (Male/Female)                 | `"Male"`                                       |
| `countryId`          | Integer | No       | Foreign key to Country (residence)   | `1` (Egypt), `3` (Pakistan)                    |
| `nationalityId`      | Integer | No       | Foreign key to Country (nationality) | `1` (Egypt), `3` (Pakistan)                    |
| `cityId`             | Integer | No       | Foreign key to City                  | `2`                                            |
| `statusId`           | Integer | No       | Foreign key to EmployeeStatus        | `1` (Active), `2` (Inactive), `5` (Terminated) |
| `branchId`           | Integer | No       | Foreign key to Branch                | `1`                                            |
| `designationId`      | Integer | No       | Foreign key to Designation           | `10`, `11`, `12`, etc.                         |
| `payrollSectionId`   | Integer | No       | Foreign key to PayrollSection        | `1`, `2`, `17`, etc.                           |
| `isDeductable`       | Boolean | Yes      | Is salary deductable                 | `true` or `false`                              |
| `isFixed`            | Boolean | Yes      | Is fixed salary                      | `true` or `false`                              |
| `workingDays`        | Integer | No       | Working days per month               | `30`                                           |
| `workingHours`       | Integer | No       | Working hours per day                | `8`                                            |
| `hourlyRate`         | Decimal | No       | Hourly rate                          | `188.0`                                        |
| `salary`             | Decimal | No       | Monthly salary                       | `45000.0`                                      |
| `breakfastAllowance` | Boolean | Yes      | Breakfast allowance enabled          | `true` or `false`                              |
| `foodAllowance`      | Decimal | No       | Food allowance amount                | `0`                                            |
| `mobileAllowance`    | Decimal | No       | Mobile allowance amount              | `0`                                            |
| `otherAllowance`     | Decimal | No       | Other allowance amount               | `0`                                            |
| `contractStartDate`  | Date    | No       | Contract start date (ISO format)     | `"2021-08-23"` or `null`                       |
| `contractEndDate`    | Date    | No       | Contract end date (ISO format)       | `"2025-12-31"` or `null`                       |
| `contractDocument`   | String  | No       | URL to contract document             | `null` or `"https://..."`                      |
| `contractEndReason`  | String  | No       | Reason for contract end              | `null` or text                                 |
| `joiningDate`        | Date    | No       | Joining date (ISO format)            | `"2021-01-01"` or `null`                       |

### Step 3: Documents & Identity

| Field                | Type   | Required | Description                       | Example                   |
| -------------------- | ------ | -------- | --------------------------------- | ------------------------- |
| `idCardNo`           | String | No       | ID card number                    | `"2189128248"`            |
| `idCardExpiryDate`   | Date   | No       | ID card expiry date (ISO format)  | `"2025-08-30"`            |
| `idCardDocument`     | String | No       | URL to ID card document           | `null` or `"https://..."` |
| `profession`         | String | No       | Profession in Arabic              | `"مدير عام"`              |
| `passportNo`         | String | No       | Passport number                   | `"FB1165192"`             |
| `passportExpiryDate` | Date   | No       | Passport expiry date (ISO format) | `"2027-01-24"`            |
| `passportDocument`   | String | No       | URL to passport document          | `null` or `"https://..."` |
| `lastExitDate`       | Date   | No       | Last exit date (ISO format)       | `null` or `"2024-01-01"`  |
| `lastEntryDate`      | Date   | No       | Last entry date (ISO format)      | `null` or `"2024-02-01"`  |

### Step 4: Banking & GOSI

| Field        | Type    | Required | Description             | Example                                |
| ------------ | ------- | -------- | ----------------------- | -------------------------------------- |
| `bankName`   | String  | No       | Bank name code          | `"RJHI"`, `"BJAZ"`, `"NCBK"`, `"BSFR"` |
| `bankCode`   | String  | No       | Bank code               | `"RJHI"`, `"BJAZ"`, etc.               |
| `iban`       | String  | No       | IBAN number             | `"SA82550000000D2173700493"`           |
| `gosiSalary` | Decimal | No       | GOSI salary amount      | `45000.0`                              |
| `gosiCityId` | Integer | No       | Foreign key to GosiCity | `2`                                    |

### Step 5: Loan & Card Details

| Field             | Type    | Required | Description            | Example                   |
| ----------------- | ------- | -------- | ---------------------- | ------------------------- |
| `openingBalance`  | Decimal | No       | Opening loan balance   | `0`                       |
| `isCardDelivered` | Boolean | Yes      | Is bank card delivered | `true` or `false`         |
| `cardDocument`    | String  | No       | URL to card document   | `null` or `"https://..."` |

## Common Foreign Key Values

### Country IDs

- `1` = Egypt (مصر)
- `3` = Pakistan (باكستان)

### Status IDs

- `1` = Active
- `2` = Inactive
- `5` = Terminated

### Bank Codes

- `RJHI` = Al Rajhi Bank
- `BJAZ` = Bank AlJazira
- `NCBK` = National Commercial Bank
- `BSFR` = Banque Saudi Fransi

## ⚠️ Important Business Logic

### Salary vs Hourly Rate Calculation

The relationship between `isFixed`, `hourlyRate`, and `salary` follows specific rules:

#### If `isFixed = true` (Fixed Salary Employee)

1. **Calculate salary**: `salary = hourlyRate × 30`
2. **Set hourlyRate to 0**: After calculating salary, set `hourlyRate = 0`
3. **Exception**: If source `hourlyRate = 0`, leave both as `0`

**Example:**

```
Source Data: hourlyRate = 188.0, isFixed = true
Transformed: hourlyRate = 0, salary = 5640.0 (188 × 30)
```

#### If `isFixed = false` (Hourly Rate Employee)

1. **Keep hourlyRate**: Use the exact hourly rate from source
2. **Set salary to 0**: `salary = 0`

**Example:**

```
Source Data: hourlyRate = 50.0, isFixed = false
Transformed: hourlyRate = 50.0, salary = 0
```

#### Summary Table

| isFixed | Source hourlyRate | Final hourlyRate | Final salary        |
| ------- | ----------------- | ---------------- | ------------------- |
| `true`  | `188.0`           | `0`              | `5640.0` (188 × 30) |
| `true`  | `0`               | `0`              | `0`                 |
| `false` | `50.0`            | `50.0`           | `0`                 |
| `false` | `0`               | `0`              | `0`                 |

## Date Format

All dates must be in **ISO 8601 format**: `YYYY-MM-DD`

Examples:

- `"2021-08-23"` ✅
- `"08/23/2021"` ❌
- `null` ✅ (for optional dates)

## Usage Instructions

1. **Copy the template**: Duplicate `employee-data-template.json` for your data
2. **Fill in employee data**: Replace example values with actual employee information
3. **Validate foreign keys**: Ensure all IDs reference existing records in the database
4. **Check required fields**: Make sure all required fields have values
5. **Format dates**: Use ISO format (YYYY-MM-DD) for all date fields
6. **Use null for empty values**: For optional fields without data, use `null` instead of empty strings

## Example Transformation

### Before (Raw CSV Data)

```
Name: MAHMOOD AHMAD AHMAD KHAN
Code: 10001
DOB: 01/01/1975
Country: Pakistan
```

### After (JSON Format)

```json
{
  "id": 4088,
  "employeeCode": 10001,
  "nameEn": "MAHMOOD AHMAD AHMAD KHAN",
  "nameAr": "محمود احمد - أحمد خان",
  "dob": "1975-01-01",
  "countryId": 3,
  "nationalityId": 3
}
```

## Import to Seed File

Once your JSON is ready, you can import it into the seed file:

```typescript
// In prisma/seed.ts
import employeeData from "./employee-data.json";

for (const employee of employeeData) {
  await prisma.employee.upsert({
    where: { employeeCode: employee.employeeCode },
    update: employee,
    create: employee,
  });
}
```
