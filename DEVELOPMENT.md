# Development log

No screen recording was started. This session did not have a trustworthy full-screen recorder, and a fabricated video would be worse than none. The timestamps below are from the working session on 17 November 2026. Git history is the durable record.

## 17 November 2026, about 18:04–18:15 ET

The repository contained only a one-line README. The governing document is Yale College Programs of Study 2026–2027, not an older three-digit course numbering. Course lists were downloaded from `catalog.yale.edu/ycps/courses/` for the departments the five career paths actually use.

Parsing decisions that mattered:

- A star is kept as a limited-enrollment marker. It is not treated as "not offered," because the YCPS key defines it as a seminar and the 2026–2027 pages also star ordinary lectures such as MATH 1120.
- Brackets mean not offered in the catalog year.
- Printed 1/2 and 1 1/2 credits are kept. A printed "0 Course cr" or a missing credit becomes 1.0, which is Yale's default, and is labeled. BIOL 1010–1040 are 0.5 because the descriptions say they meet for half a term.
- Cross-listed titles are stored once. S&DS 2410 is MATH 2410 in the file; the interface shows both codes.

## 17 November 2026, about 18:15–18:25 ET

The scheduler and the major checklists were written against those records. Prerequisite edges were copied from catalog sentences, including "concurrently" and "to accompany." The engine refuses a plan that misses a hard major rule, a distributional credit, a prerequisite, the 36-credit degree, a 4-to-5.5-credit term, or the first-year four-credit subject cap.

`npm test` covers Economics, Statistics and Data Science, MCDB, MB&B, Mathematics, Applied Mathematics, Computer Science (B.S. and B.A.), and Global Affairs, plus the five sample goals.

## 17 November 2026, about 18:25–18:30 ET

The Next.js app, SQLite storage, PDF export, and the timeline were added. The API was exercised for all five goals, a move, a swap, completion, course search, and PDF. The browser was used to open the quantitative-finance plan, the requirements tracker, a course description, and the completed-course control. Screenshots in `docs/screenshots/` are from that local dev server.

Deployment was not attempted. There is no hosting credential in the environment.
