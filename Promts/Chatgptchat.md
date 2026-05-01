# AI Interaction Log — BalanceBite Project (ChatGPT)

## Tool Used
**ChatGPT (OpenAI)** — Used primarily for project planning, feature scoping, and aligning the build with the class rubric before development began.

---

## Overview

ChatGPT was used throughout the planning phase of BalanceBite, a React + Firebase nutrition tracking web app. Its role was to help structure the project, define which features to include, and make sure the plan matched the rubric requirements. The process was iterative — prompts were refined multiple times as time constraints and technical limitations became clearer. Outputs were reviewed, simplified where needed, and adjusted before any code was written.

---

## Initial Prompt

> "I am starting a project for my class, i want build a nutrition app that i can track what i eat and helps me reach my health goals, i want it to be a robust app that functions reliably and has a simple ux. I have the rules/ rubric above in the screenshots, what i want you to do is take your time and look through all of that information and lets start out by building a plan that touches on everything listed in the rubric. But before anything is done yet i want you to ask me questions until you are 95 percent sure you know what i want and not what i think i want."

**What was wanted:** A complete project plan aligned with the class rubric — clear list of features and pages, a realistic approach given limited time, and a beginner-friendly tech stack.

---

## Follow-Up Prompts and What Happened

### 1. Narrowing the Stack and Core Features

**What was asked:**
- "Make sure the plan includes Firebase, user login, and a dashboard."
- "Add features like tracking calories, protein, carbs, fat, water, weight, and exercise."
- "I want a clean and professional UI, not something overly complex."

**What was kept:**
- React + Firebase as the recommended tech stack
- Core tracking features: food (calories, protein, carbs, fat), water, weight, and exercise
- Page structure: Login, Dashboard, Food Log, Goals, Progress, and a profile/settings page
- Firestore as the database for storing per-user data

---

### 2. Scoping Down for Time Constraints

**What was asked:**
- "I only have a few hours to build this, simplify the plan but still meet all rubric requirements."
- "Reduce the scope so it is realistic for a beginner and can be completed quickly."
- "Focus only on essential features that demonstrate functionality and meet the rubric."
- "Make sure the plan includes testing and documentation requirements."

**What was changed:**
- Removed advanced AI integrations — replaced with rule-based logic running entirely in the browser
- Simplified dashboard customization (toggle cards on/off rather than full drag-and-drop layout)
- Reduced complexity of charts and analytics (7-day bar charts instead of rolling averages or trend projections)
- Adjusted overall scope to fit a realistic build window

**What was discarded:** Any feature that required external APIs, complex third-party libraries, or significant extra development time.

---

## Where AI Helped

- Provided a structured plan that clearly mapped to rubric requirements, making it easier to verify nothing was missed
- Broke the project down into manageable steps and a logical build order (auth first, then data, then UI)
- Suggested a practical tech stack (React + Vite + Firebase) that is well-documented and suitable for Cloudflare Pages deployment

---

## Where AI Was Wrong

- **Initially suggested too many features** for the available time — the first plan included more pages and functionality than a beginner could reasonably build in a few hours
- **Did not account for time constraints** until explicitly told to simplify — the AI defaulted to a comprehensive feature set rather than a minimal one
- **Included more advanced functionality than necessary** — early suggestions included things like real AI API integrations and complex analytics that were out of scope for a class project

---

## What Was Overridden

- Removed unnecessary complexity from the feature list based on the student's judgment
- Simplified the implementation plan to focus on what the rubric actually required
- Chose to implement a rule-based "AI Coach" instead of a real AI API integration — this was a deliberate design decision that kept the project self-contained and removed the need for API keys or usage costs

---

## Real Mistakes and Corrections

**Overcomplicated initial plan:** The first response to the planning prompt included features well beyond the scope of the project. The student had to explicitly push back with time and complexity constraints to get a realistic plan. This required several follow-up prompts before the scope was right.

**No consideration of beginner limitations:** Early suggestions assumed a level of familiarity with tooling and concepts (environment variables, Firestore rules, deployment pipelines) that required additional explanation before they were useful.

---

## Final Reflection

### Strengths of Using ChatGPT for This Project
- Quickly generated structured plans and feature lists that would have taken much longer to produce manually
- Helped organize the project in a way that mapped clearly to rubric requirements
- Reduced time spent on planning decisions by providing a starting point to react to rather than starting from a blank page

### Weaknesses and Limitations
- Tended to over-scope and overcomplicate features in early responses
- Did not naturally consider strict time or skill constraints without being explicitly told
- Required manual review at each step to filter out suggestions that weren't feasible

### Tradeoffs Encountered

| Tradeoff | Decision Made |
|---|---|
| Simplicity vs. completeness | Chose simplicity — fewer features done well over many features done poorly |
| Speed of development vs. feature depth | Prioritized speed — core functionality first, no stretch goals |
| AI-generated ideas vs. practical implementation | Kept AI suggestions as a starting point, overrode anything unrealistic |

### Prompting Strategies

**What worked:** Clear, specific prompts that included explicit constraints — "I only have a few hours," "I am a beginner," "it must meet these rubric requirements." The more constraints provided upfront, the more useful the output.

**What failed:** Vague or open-ended prompts like the initial one led to overly ambitious and unrealistic suggestions. Asking ChatGPT to "plan everything" without guardrails produced a plan that had to be significantly cut down.

### What Would Have Been Different Without AI
- More time would have been spent manually researching tools, comparing options, and figuring out build order
- The project structure would likely have been less organized and harder to map to rubric requirements
- Development would have started later, leaving less time for testing and debugging

### What Improved vs. Degraded Because of AI

**Improved:**
- Planning speed — a rough project plan was ready in minutes
- Structure and clarity — the breakdown of pages, features, and build order was clear and logical
- Rubric alignment — it was easier to verify coverage when working from a structured list

**Degraded:**
- Initial over-scoping required multiple correction rounds, which took time that could have been spent building
- Early suggestions created an expectation of a larger feature set that had to be actively walked back
