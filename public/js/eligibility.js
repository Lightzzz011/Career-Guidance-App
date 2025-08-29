// public/js/eligibility.js
/**
 * Eligibility helpers: compare student profile to college eligibility.
 * Pure functions (no Firebase dependency).
 *
 * Example usage:
 *  import { isEligible, filterColleges } from "./eligibility.js";
 */

export function isEligible(student = {}, college = {}) {
  // student: { cgpa: number, career: string, ... }
  // college: { eligibility: { cgpa: number, exam: string|null }, location: 'India'|'Abroad', fees }
  if (!student || !college) return false;

  const minCgpa = Number(college?.eligibility?.cgpa ?? 0);
  if (Number.isFinite(student.cgpa)) {
    if (student.cgpa < minCgpa) return false;
  } else {
    // If student hasn't provided CGPA, treat as not eligible (you can change this)
    return false;
  }

  // If college requires a particular exam, we cannot check unless student provides 'examsTaken' array.
  if (college?.eligibility?.exam) {
    const required = String(college.eligibility.exam).trim();
    if (required) {
      const taken = student.examsTaken || []; // e.g. ['JEE Advanced','SAT']
      if (!taken.map(x => String(x).toLowerCase()).includes(required.toLowerCase())) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Filter an array of colleges by student's profile and additional options
 * @param {object} student
 * @param {Array<object>} colleges
 * @param {object} options - { maxFees, location, career }
 * @returns {Array<object>}
 */
export function filterColleges(student = {}, colleges = [], options = {}) {
  const maxFees = options.maxFees != null ? Number(options.maxFees) : null;
  const location = options.location || null;
  const career = options.career || null;

  return (colleges || []).filter(c => {
    if (location && c.location !== location) return false;
    if (maxFees != null && Number(c.fees) > maxFees) return false;
    // optional: filter by career if college has career tags
    if (career && c.careers && Array.isArray(c.careers)) {
      if (!c.careers.includes(career)) return false;
    }
    // finally apply eligibility check
    return isEligible(student, c);
  });
}
