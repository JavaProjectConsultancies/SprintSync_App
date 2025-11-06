/**
 * Salary Calculation Utility
 * 
 * This utility calculates net salary and hourly rate from Annual CTC
 * based on the payroll formula document.
 */

// Basic Salary mapping by experience level
const BASIC_SALARY_MAP: Record<string, number> = {
  'E1': 12000,
  'E2': 12000,
  'M1': 13500,
  'M2': 14500,
  'M3': 15500,
  'L1': 18500,
  'L2': 23000,
  'L3': 29000,
  'S1': 35000, // Estimated for S1 level (20+ years)
};

// Constants
const CONVEYANCE_ALLOWANCE = 1600; // Fixed monthly
const PROFESSIONAL_TAX = 200; // Fixed monthly
const VARIABLE_CTC = 50000; // Default variable pay
const MONTHS = 12;
const WORKING_HOURS_PER_MONTH = 176; // 8 hours/day * 22 working days

export interface SalaryBreakdown {
  Basic: number;
  HRA: number;
  Conveyance: number;
  BalanceAllowance: number;
  Gross: number;
  PF: number;
  PT: number;
  TotalDeductions: number;
  NetSalary: number;
  AnnualNet: number;
  HourlyRate: number;
}

/**
 * Calculate net salary from Annual CTC
 * @param annualCTC - Annual Cost to Company
 * @param experienceLevel - Experience level (E1, E2, M1, etc.)
 * @param variableCTC - Variable pay component (default: 50000)
 * @returns Salary breakdown including hourly rate
 */
export function calculateNetSalary(
  annualCTC: number,
  experienceLevel: string,
  variableCTC: number = VARIABLE_CTC
): SalaryBreakdown {
  // Get basic salary for the experience level
  const basic = BASIC_SALARY_MAP[experienceLevel.toUpperCase()] || BASIC_SALARY_MAP['E1'];
  
  // Step 1: Derive Fixed Monthly CTC
  const fixedCTC = annualCTC - variableCTC;
  const monthlyFixed = fixedCTC / MONTHS;
  
  // Step 2: Compute HRA
  // If Basic < 13,000 => HRA = 0.2 × Basic; else => HRA = 0.4 × Basic
  const HRA = basic < 13000 ? 0.2 * basic : 0.4 * basic;
  
  // Step 3: Calculate Balance Allowance
  const balanceAllowance = monthlyFixed - (basic + HRA + CONVEYANCE_ALLOWANCE);
  
  // Step 4: Compute Gross Salary
  const gross = basic + HRA + CONVEYANCE_ALLOWANCE + balanceAllowance;
  
  // Step 5: Apply Deductions
  const PF = 0.12 * basic; // Employee contribution (12% of Basic)
  const totalDeductions = PF + PROFESSIONAL_TAX;
  
  // Step 6: Calculate Net Salary
  const netSalary = gross - totalDeductions;
  const annualNet = netSalary * MONTHS;
  
  // Calculate Hourly Rate from Gross Salary
  // Using gross salary divided by monthly working hours
  const hourlyRate = gross / WORKING_HOURS_PER_MONTH;
  
  return {
    Basic: Math.round(basic),
    HRA: Math.round(HRA),
    Conveyance: CONVEYANCE_ALLOWANCE,
    BalanceAllowance: Math.round(balanceAllowance),
    Gross: Math.round(gross),
    PF: Math.round(PF),
    PT: PROFESSIONAL_TAX,
    TotalDeductions: Math.round(totalDeductions),
    NetSalary: Math.round(netSalary),
    AnnualNet: Math.round(annualNet),
    HourlyRate: Math.round(hourlyRate * 100) / 100, // Round to 2 decimal places
  };
}

/**
 * Calculate hourly rate from Annual CTC
 * This is a simplified version that just returns the hourly rate
 * @param annualCTC - Annual Cost to Company
 * @param experienceLevel - Experience level (E1, E2, M1, etc.)
 * @param variableCTC - Variable pay component (default: 50000)
 * @returns Hourly rate in INR
 */
export function calculateHourlyRateFromCTC(
  annualCTC: number,
  experienceLevel: string,
  variableCTC: number = VARIABLE_CTC
): number {
  const breakdown = calculateNetSalary(annualCTC, experienceLevel, variableCTC);
  return breakdown.HourlyRate;
}


