// Settings Rhys can change without touching the rest of the code.
export const CONFIG = {
  // true while reviewing: draft questions appear (marked "Draft").
  // Set to false before giving the link to students: only "approved" rows appear.
  reviewMode: true,

  // Link to the Microsoft Form for student feedback. Leave empty to hide the link.
  feedbackUrl: "",

  // Shown in the footer of every page. Change it whenever you publish new or corrected content.
  lastUpdated: "November 2026",

  // Link to Bangor University's privacy notice covering the feedback Form and error-report emails (ask the university's
  // information governance team which one). Shown on the Privacy page; leave empty until you have it.
  privacyNoticeUrl: "",

  // Where "Report an error" goes: an email address. Leave empty to use the feedback Form link instead;
  // with both empty, the link is hidden.
  contactEmail: "",

  // Questions per practice set, and the most self-marked written questions in one set.
  setSize: 10,
  maxWrittenPerSet: 2,
};
