---
name: Frontend & Code Style Guide
---

# Claude Project Configuration

## Frontend Design Standards

Your default behavior for web UI work:
- Use `/frontend-design` skill for any interface building
- Prioritize minimalist design with strategic 3D effects
- Implement shadcn/ui components as default choice
- Always include dark mode support
- Ensure responsive mobile-first design
- Test accessibility (keyboard nav, contrast, semantic HTML)

## Tech Stack Preferences

### Primary
- React 18+ / Next.js 13+
- Vue 3 (secondary)
- TypeScript (strongly preferred)

### Styling
- Tailwind CSS (utility-first)
- shadcn/ui (component library)
- Chakra UI (when theme flexibility needed)

### Tools & Libraries
- framer-motion (animations)
- Zod or Yup (validation)
- Zustand or Pinia (state management)
- Vitest/Playwright (testing)

## Code Style Guidelines

### General Principles
- Clean, self-documenting code
- DRY (Don't Repeat Yourself)
- SOLID principles where applicable
- Meaningful variable and function names
- Comments for "why", not "what"

### JavaScript/TypeScript
- Use modern ES6+ syntax
- Async/await over .then() chains
- Const by default, let when needed, never var
- Arrow functions for callbacks
- Proper error handling with try-catch

### React/Vue Components
- Functional components + hooks (React)
- Use Composition API (Vue)
- Props validation (TypeScript types)
- Custom hooks for reusable logic
- Memoization for expensive computations

### File Organization
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui customizations
│   └── [FeatureName]/
├── hooks/              # Custom hooks
├── utils/              # Helper functions
├── types/              # TypeScript interfaces
├── constants/          # App constants
└── pages/ or routes/   # Page components
```

## Performance Checklist

- [ ] Images lazy-loaded (`loading="lazy"`)
- [ ] No unnecessary re-renders
- [ ] Bundle size optimized
- [ ] Third-party scripts defer-loaded
- [ ] Proper caching headers
- [ ] CSS optimized for production

## Accessibility Requirements

- [ ] Semantic HTML used throughout
- [ ] ARIA labels where needed
- [ ] Color contrast ≥ 4.5:1 (WCAG AA)
- [ ] Keyboard navigation functional
- [ ] Focus indicators visible
- [ ] Form labels connected to inputs

## When Creating Code

1. **Ask clarifying questions** if requirements aren't clear
2. **Provide context** about why certain choices were made
3. **Include examples** for how to use/extend the code
4. **Document edge cases** and assumptions
5. **Test before delivery** (at least mentally walkthrough)
6. **Consider scalability** for future maintenance

## Design File References (if available)

Add your design references, Figma links, or screenshot samples here:
- [Add Figma link or reference path]
- [Add screenshot or design sample path]

## Quick Commands

```bash
# Development
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Check code quality
npm run type-check # TypeScript check

# Testing
npm run test       # Run tests
npm run test:coverage # Coverage report
```

---

**Last Updated**: March 14, 2026  
**Maintainer**: Your Team  
**Version**: 1.0
