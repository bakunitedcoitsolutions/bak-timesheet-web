# Employee CSV to JSON Transformation Script

This script transforms employee data from CSV format to JSON matching the Prisma schema.

## Prerequisites

Install the required dependency:

```bash
npm install csv-parser
```

## Usage

Run the transformation script:

```bash
node prisma/transform-employees.js
```

## What It Does

1. **Reads** the CSV file from `data/Employees.csv`
2. **Transforms** each employee record according to the Prisma schema
3. **Applies business logic**:
   - If `isFixed = true`: Calculates `salary = hourlyRate × 30`, then sets `hourlyRate = 0`
   - If `isFixed = false`: Keeps `hourlyRate` as is, sets `salary = 0`
   - If `hourlyRate = 0`: Leaves both as `0`
4. **Outputs** JSON to `prisma/employee-data.json`

## CSV to Schema Mapping

| CSV Column           | Schema Field         | Notes                         |
| -------------------- | -------------------- | ----------------------------- |
| `Id`                 | `id`                 | Integer                       |
| `EmpCode`            | `employeeCode`       | Integer                       |
| `FullName`           | `nameEn`             | String                        |
| `FullNameAr`         | `nameAr`             | String                        |
| `BirthDate`          | `dob`                | Date (ISO format)             |
| `MobileNo`           | `phone`              | String                        |
| `GenderCode`         | `gender`             | String (M/F)                  |
| `CountryId`          | `countryId`          | Integer                       |
| `NationalityId`      | `nationalityId`      | Integer                       |
| `CityId`             | `cityId`             | Integer                       |
| `EmployeeStatusId`   | `statusId`           | Integer                       |
| `BranchId`           | `branchId`           | Integer                       |
| `DesignationId`      | `designationId`      | Integer                       |
| `PayrollSectionId`   | `payrollSectionId`   | Integer                       |
| `IsDeductable`       | `isDeductable`       | Boolean                       |
| `IsFixedSalary`      | `isFixed`            | Boolean                       |
| `WorkDays`           | `workingDays`        | Integer                       |
| `HourlyRate`         | `hourlyRate`         | Decimal (with business logic) |
| -                    | `salary`             | Decimal (calculated)          |
| `FoodAllowance`      | `foodAllowance`      | Decimal                       |
| `MobileAllowance`    | `mobileAllowance`    | Decimal                       |
| `OtherAllowance`     | `otherAllowance`     | Decimal                       |
| `ContractStartDate`  | `contractStartDate`  | Date                          |
| `ContractEndDate`    | `contractEndDate`    | Date                          |
| `ContractEndReason`  | `contractEndReason`  | String                        |
| `JoiningDate`        | `joiningDate`        | Date                          |
| `IdCardNo`           | `idCardNo`           | String                        |
| `IdCardExpiry`       | `idCardExpiryDate`   | Date                          |
| `IdCardDocLink`      | `idCardDocument`     | String (URL)                  |
| `IdCardProfession`   | `profession`         | String                        |
| `PassportNo`         | `passportNo`         | String                        |
| `PassportExpiry`     | `passportExpiryDate` | Date                          |
| `PassportDocLink`    | `passportDocument`   | String (URL)                  |
| `BankCode`           | `bankName`           | String                        |
| `BankCode`           | `bankCode`           | String                        |
| `IBAN`               | `iban`               | String                        |
| `GosiSalary`         | `gosiSalary`         | Decimal                       |
| `GosiCityId`         | `gosiCityId`         | Integer                       |
| `OpeningBalanceLoan` | `openingBalance`     | Decimal                       |
| `IsCardDelivered`    | `isCardDelivered`    | Boolean                       |
| `PhotoDocLink`       | `profilePicture`     | String (URL)                  |

## Output

The script creates `prisma/employee-data.json` with all transformed employee records ready to be imported into the database.

## Next Steps

After transformation, you can import the data into your database using the seed script:

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
