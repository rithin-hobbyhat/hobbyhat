# HOBBY HAT — Design System

> **Product:** HOBBY HAT — The Hub of Hobbyists  
> **Design direction:** Minimal, calm, intelligent, playful, trustworthy, parent-friendly  
> **Primary experience:** Age → Developmental Need → Recommended Toy/Hobby → Product → Amazon

---

## 1. Design Principles

### 1.1 Minimal first
The interface should feel clean and spacious rather than like a large toy marketplace.

- Avoid visual clutter.
- Use generous whitespace.
- Keep each section focused on one decision.
- Limit decorative elements.
- Prefer simple cards over complex UI components.
- Avoid excessive gradients, shadows, borders, badges, and animations.

### 1.2 Scientific but approachable
The website should communicate that recommendations are thoughtfully organized around developmental stages and play, without looking like a medical or academic portal.

Visual personality:
- Clean
- Modern
- Warm
- Evidence-oriented
- Friendly
- Calm

### 1.3 Child-friendly without looking childish
Use subtle playful details rather than cartoon-heavy visuals.

Preferred:
- Soft shapes
- Rounded cards
- Small illustrations
- Simple line icons
- Gentle accent colors
- Friendly typography

Avoid:
- Rainbow-heavy palettes
- Excessive emojis
- Toy-store visual clutter
- Overly saturated colors
- Comic/cartoon interfaces

### 1.4 Parent-first usability
The primary user is a parent or caregiver.

Every major section should answer one simple question:

1. What age is my child?
2. What developmental focus is relevant?
3. Which toys or hobbies fit?
4. Why are they suitable?
5. Where can I buy them?

---

# 2. Brand Identity

## Brand Name

**HOBBY HAT**

## Descriptor

**Scientific Play & Hobbies**

## Brand personality

- Curious
- Thoughtful
- Trustworthy
- Modern
- Educational
- Warm
- Minimal
- Practical

## Brand voice

Use language that is:

- Clear
- Short
- Helpful
- Parent-friendly
- Non-judgmental
- Encouraging

Avoid overly technical scientific terminology in primary UI copy.

---

# 3. Color Palette

The palette should remain restrained.

## Primary palette

| Token | Color | Usage |
|---|---|---|
| `--color-ink` | `#17202A` | Main headings and important text |
| `--color-text` | `#3F4852` | Body text |
| `--color-muted` | `#78828C` | Secondary text |
| `--color-background` | `#F8F7F3` | Main page background |
| `--color-surface` | `#FFFFFF` | Cards and elevated sections |
| `--color-border` | `#E6E4DE` | Subtle borders |
| `--color-primary` | `#2E6F68` | Main brand/action color |
| `--color-primary-dark` | `#245953` | Hover/active primary |
| `--color-primary-soft` | `#E4F0ED` | Soft highlighted backgrounds |
| `--color-accent` | `#E7A65A` | Small highlights and attention elements |
| `--color-accent-soft` | `#FBF0DF` | Soft accent background |

### Color rules

- Use `#F8F7F3` as the dominant page background.
- Use white for product/content cards.
- Use dark ink for headings.
- Use teal as the primary action color.
- Use warm amber only as an accent.
- Do not use more than 2 strong colors in the same component.
- Never make the entire interface brightly colored.

### Semantic colors

| Purpose | Color |
|---|---|
| Success | `#3F806A` |
| Warning | `#B77932` |
| Error | `#B9564B` |
| Info | `#477A9B` |

Use semantic colors sparingly.

---

# 4. Typography

Typography should feel modern, highly readable, and slightly editorial.

## Recommended font stack

### Primary

```css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

### Optional display font

If a distinctive heading font is desired, use a restrained modern sans-serif such as:

- Plus Jakarta Sans
- Manrope
- DM Sans

Do not combine more than two font families.

## Type scale

### Desktop

| Element | Size | Weight |
|---|---:|---:|
| Hero H1 | 56–64px | 700 |
| Section H2 | 36–44px | 700 |
| Section H3 | 22–28px | 650 |
| Card title | 18–21px | 650 |
| Body | 16–18px | 400 |
| Small body | 14–15px | 400 |
| Caption | 12–13px | 500 |

### Mobile

| Element | Size |
|---|---:|
| Hero H1 | 38–44px |
| Section H2 | 30–34px |
| H3 | 20–24px |
| Body | 15–17px |
| Caption | 12–13px |

### Typography rules

- Keep paragraphs short.
- Use `line-height: 1.6` for body text.
- Use tighter line-height for large headings.
- Avoid all-caps except for very small labels.
- Avoid long blocks of text above the fold.

---

# 5. Layout System

## Page width

Use a centered content container.

```css
--container-width: 1180px;
```

Recommended horizontal padding:

```css
padding-inline: 24px;
```

Mobile:

```css
padding-inline: 18px;
```

## Grid

Use a simple responsive grid.

### Product cards

Desktop:
- 3 columns

Tablet:
- 2 columns

Mobile:
- 1 column

### Age cards

Desktop:
- 3–4 columns depending on content

Mobile:
- horizontal scroll or 1-column stack

## Spacing scale

Use a consistent spacing system:

```text
4px
8px
12px
16px
24px
32px
48px
64px
80px
96px
120px
```

Prefer larger vertical spacing between major sections.

---

# 6. Border Radius

Use soft but controlled rounding.

```css
--radius-sm: 8px;
--radius-md: 14px;
--radius-lg: 20px;
--radius-xl: 28px;
```

Recommended:

- Buttons: 10–12px
- Cards: 16–20px
- Hero visual blocks: 24–28px
- Pills: 999px

Avoid making every element extremely rounded.

---

# 7. Shadows

The website should not look heavily elevated.

Use subtle shadows only where useful.

```css
box-shadow:
  0 8px 30px rgba(23, 32, 42, 0.06);
```

Preferred visual hierarchy:

1. Flat background
2. Border
3. Very subtle shadow
4. Strong shadow only for important floating UI

Product cards should normally use a subtle border instead of a strong shadow.

---

# 8. Header

## Structure

Left:
- HOBBY HAT logo/name

Center/right:
- Age Stages
- Hobbies
- Science of Play
- Smart Quiz

Right CTA:
- Explore by Age

## Header style

- White or `#F8F7F3` background
- Height: approximately 68–76px
- Sticky on desktop if useful
- Very subtle bottom border
- No heavy shadow

## Mobile

Use:

- Logo
- Menu button
- Slide/dropdown navigation

Do not crowd the mobile header.

---

# 9. Hero Section

The hero is the first major visual statement.

## Layout

Desktop:

```text
LEFT
Small credibility badge
Large headline
Short description
Primary CTA
Secondary CTA

RIGHT
Minimal abstract/play/development visual
```

## Recommended visual style

The hero visual should communicate:

- Child development
- Curiosity
- Toys
- Making
- Science
- Hobbies

It should remain abstract and elegant.

Avoid:
- Busy toy collages
- Huge product grids
- Excessive cartoon characters

## Hero background

Use the primary background:

`#F8F7F3`

Add only a very subtle decorative shape or soft accent area.

---

# 10. Main User Journey

The website should visually prioritize this sequence:

```text
Choose Age
     ↓
Understand Developmental Focus
     ↓
See Recommended Toys
     ↓
Understand Why
     ↓
View Product
     ↓
Amazon
```

For older children:

```text
Choose Age
     ↓
Choose Hobby
     ↓
Explore Skill / Interest
     ↓
Recommended Products
     ↓
Amazon
```

This is the most important information architecture on the site.

---

# 11. Age Selection Section

## Heading

Suggested style:

**What is your child's age?**

Supporting copy:

Keep it short and reassuring.

## Age cards

Seven age groups:

- 0–1 years
- 1–3 years
- 3–5 years
- 6–8 years
- 9–12 years
- 13–15 years
- 15+ years

Each card should contain:

- Age
- Short stage name
- One-line developmental focus
- Small icon or simple illustration

## Interaction

On hover:

- Slight upward movement: 2–4px
- Border becomes primary teal
- Background may become slightly tinted

On click:

- Smooth scroll to relevant section

Avoid dramatic animations.

---

# 12. Developmental Stage Sections

Each age section should follow the same structure.

```text
AGE LABEL
Stage title
Short description

Developmental focus
[Focus] [Focus] [Focus]

Recommended toys
[Product Card]
[Product Card]
[Product Card]
```

Consistency is more important than decoration.

---

# 13. Product Card Design

Product cards are one of the most important components.

## Card structure

```text
Product image

Age / Category badge

Product name

Why we recommend it
1–2 short lines

Developmental benefits
Small tags

Amazon CTA
```

## Card rules

- White surface
- 16–20px radius
- 1px subtle border
- Minimal shadow
- Image area with generous whitespace
- Product title limited to approximately 2–3 lines
- Scientific explanation kept concise
- CTA always visually clear

## Product CTA

Preferred:

**View on Amazon →**

Do not use aggressive sales language such as:

- BUY NOW!!!
- LIMITED OFFER
- BEST DEAL

The site should feel like a recommendation guide, not an aggressive sales page.

---

# 14. Product Images

Product images should be:

- Clean
- High-resolution
- Consistent aspect ratio
- Centered
- Preferably on light/white backgrounds

Recommended image ratio:

```text
4:3
```

or

```text
1:1
```

Keep all product image containers the same height.

Avoid inconsistent image sizes.

---

# 15. Developmental Benefit Tags

Use small pill tags.

Examples:

```text
Fine Motor
Problem Solving
Sensory
Creativity
Spatial Skills
STEM
Social Play
Coordination
Logic
```

Style:

- Soft tinted background
- Dark readable text
- 12–13px font
- Small padding
- Pill radius

Do not use too many tags.

Maximum recommended:

**3–4 tags per product.**

---

# 16. Scientific Explanation

Scientific content should be visually secondary to the product.

Use a small expandable or compact explanation:

**Why this toy?**

Then:

- 1 short paragraph
- 2–3 bullet benefits
- Safety note when relevant

Avoid displaying long research-style paragraphs inside product cards.

---

# 17. 15+ Hobby Section

This section represents the transition from toys to hobbies.

Use a visually distinct but still minimal section.

Suggested heading:

**Beyond Toys: Find a Hobby**

Supporting message:

As children grow, play can become deeper exploration, making, building and skill development.

## Hobby categories

Examples from the source:

- STEM, Coding & Robotics
- Arts, Crafts & Design
- Music & Audio
- Astronomy, Nature & Biology
- Board Games, Puzzles & Logic
- Model Making, RC & Drones
- Sports & Outdoor
- DIY, Maker Tools & CNC
- Social Roleplay & Speech

The source also includes Sensory & Tummy Time and Fine & Gross Motor as hobby tracks.

## Hobby cards

Each card:

- Small icon
- Hobby name
- One-line description
- `Explore Hobby →`

Avoid giant illustrations.

---

# 18. Hobby Product Flow

For 15+ users:

```text
Hobby
↓
Skill / Interest
↓
Recommended Product
↓
Why it fits
↓
Amazon
```

Example:

```text
Robotics
→ Beginner robotics
→ Programmable rover
→ Builds coding + engineering practice
→ View on Amazon
```

---

# 19. Science of Play Section

Keep this section editorial and calm.

Use 3 article cards.

Source topics:

1. The Neuroscience of Toy Selection: Why Age Precision Matters
2. Montessori vs Open-Ended vs STEM: Choosing the Right Play Framework
3. Screen-Free Play and the Prefrontal Cortex

Card structure:

```text
Small category
Article title
Short summary
Read article →
```

Avoid making this look like a news website.

---

# 20. Smart Quiz

The quiz should be simple and lightweight.

### Step 1
Child age

### Step 2
Primary interest/focus

### Step 3
Play setting and budget

### Result

Show:

- Recommended developmental area
- 3–5 suitable products
- Relevant hobby for older users
- Amazon CTA

The quiz should feel like a friendly guide, not a complex form.

---

# 21. Buttons

## Primary button

Background:

`#2E6F68`

Text:

`#FFFFFF`

Shape:

10–12px radius

Example:

**Explore by Age**

## Secondary button

Transparent background.

Border:

`#D7D9D6`

Text:

`#17202A`

Example:

**How It Works**

## Text link

Use for low-priority navigation:

**Learn more →**

Keep arrow usage consistent.

---

# 22. Icons

Use a single icon family throughout the website.

Recommended:

- Lucide
- Phosphor
- Heroicons

Style:

- Thin/medium stroke
- Simple geometry
- No mixed icon styles

Do not use different emoji styles as the primary icon system.

Emoji may appear in small educational contexts if desired, but should not dominate the interface.

---

# 23. Illustrations

Illustrations should be:

- Minimal
- Flat
- Soft
- Geometric
- Educational
- Warm

Preferred subjects:

- Building blocks
- Simple circuits
- Puzzle pieces
- Telescope
- Robot
- Paintbrush
- Musical notes
- Magnifying glass

Keep illustrations secondary to the content.

---

# 24. Photography

When real product/child photography is used:

- Use natural lighting.
- Prefer uncluttered backgrounds.
- Show products in realistic use.
- Avoid overly staged stock-photo aesthetics.
- Maintain consistent cropping.

For product cards, clean product photography is preferred.

---

# 25. Motion & Animation

Animation should communicate interaction, not decoration.

## Allowed

- Smooth scrolling
- Button hover
- Card hover
- Fade/slide-in on section entry
- FAQ accordion
- Mobile menu animation
- Quiz transitions

## Timing

```text
Fast interaction: 150–200ms
Normal transition: 250–350ms
Large section reveal: 400–500ms
```

Use:

```css
transition: all 180ms ease;
```

where appropriate.

## Avoid

- Constant floating objects
- Parallax everywhere
- Large bouncing elements
- Excessive spinning
- Auto-playing distracting animations

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

---

# 26. Responsive Design

The site must work well on:

- Desktop
- Laptop
- Tablet
- Mobile

## Breakpoints

Suggested:

```text
Mobile: < 640px
Tablet: 640–1024px
Desktop: > 1024px
Large desktop: > 1280px
```

Do not design desktop first and simply shrink everything.

Mobile should be deliberately designed.

---

# 27. Mobile UX

On mobile:

- One-column product cards
- Large tap targets
- Sticky/simple header
- Comfortable spacing
- Age selector should be easy to swipe or tap
- Avoid tiny text
- Avoid dense comparison tables
- Keep CTA buttons easy to reach

Minimum recommended touch target:

**44 × 44px**

---

# 28. Accessibility

Target WCAG-friendly contrast and interaction.

Requirements:

- Semantic HTML
- Proper heading hierarchy
- Alt text for meaningful images
- Keyboard-accessible controls
- Visible focus states
- Accessible button labels
- Form labels
- Avoid color-only communication
- Respect reduced-motion preferences

Never hide essential information only behind hover.

---

# 29. Amazon Affiliate UI

Amazon links should be clear but not aggressive.

Preferred CTA:

**View on Amazon →**

Use the affiliate disclosure in the footer and/or near relevant affiliate content.

Source disclosure:

> HOBBY HAT is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide means for sites to earn advertising fees by advertising and linking to Amazon.com and affiliated international marketplaces. All product recommendations are curated strictly for pediatric developmental value.

Do not make unsupported claims such as:

- Cheapest
- Guaranteed best
- #1 product
- Scientifically proven

unless the specific claim is appropriately supported.

---

# 30. Footer

Footer should remain simple.

Include:

```text
HOBBY HAT
Scientific Play & Hobbies

Age Stages
Hobbies
Science of Play
Smart Quiz

Affiliate Disclosure
Privacy
Terms
Contact
```

Use a muted background.

Avoid a huge multi-column corporate footer.

---

# 31. Page Section Rhythm

Recommended sequence:

```text
Header
↓
Hero
↓
Choose Your Child's Age
↓
How It Works
↓
Age Recommendations
↓
15+ Hobby Discovery
↓
Science of Play
↓
Smart Quiz
↓
Amazon Disclosure
↓
Footer
```

Major sections should have approximately:

```text
80–120px vertical spacing
```

Desktop.

Mobile:

```text
56–80px
```

---

# 32. Visual Hierarchy

Every screen should have one dominant action.

Priority order:

1. Choose age
2. Understand recommendation
3. Explore product/hobby
4. View Amazon product
5. Read supporting science

Do not let secondary content compete with the age selector.

---

# 33. UI Density

Target a low-density interface.

A useful rule:

> If a section feels crowded, remove information before adding another visual component.

Prefer:

- 3 product cards over 8 crowded cards
- 3 benefits over 10 benefits
- 1 clear CTA over 4 competing CTAs

---

# 34. Design Tokens

Recommended CSS variables:

```css
:root {
  --color-ink: #17202A;
  --color-text: #3F4852;
  --color-muted: #78828C;

  --color-background: #F8F7F3;
  --color-surface: #FFFFFF;
  --color-border: #E6E4DE;

  --color-primary: #2E6F68;
  --color-primary-dark: #245953;
  --color-primary-soft: #E4F0ED;

  --color-accent: #E7A65A;
  --color-accent-soft: #FBF0DF;

  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-xl: 28px;

  --container-width: 1180px;

  --shadow-soft:
    0 8px 30px rgba(23, 32, 42, 0.06);
}
```

---

# 35. Component Checklist

Build only the components needed for the MVP.

### Core

- Header
- Mobile menu
- Hero
- Age selector
- Development stage section
- Product card
- Benefit tag
- Hobby card
- Article card
- Quiz
- FAQ
- Footer

### Avoid for v1

- Login
- User accounts
- Shopping cart
- Payment system
- Backend database
- Product management dashboard
- Complex recommendation engine
- Notifications
- Chatbot
- Social feed

---

# 36. Image & Asset Rules

Organize assets:

```text
/images
  /logo
  /hero
  /ages
  /products
  /hobbies
  /articles
  /icons
```

Use descriptive filenames.

Example:

```text
baby-play-gym.webp
wooden-rattle.webp
robotics-kit.webp
astronomy-telescope.webp
```

Prefer WebP or AVIF where supported.

Optimize images before deployment.

---

# 37. Design Quality Checklist

Before launch, verify:

- [ ] Page feels minimal at first glance
- [ ] Age selection is immediately understandable
- [ ] Hero has one clear primary CTA
- [ ] Typography is consistent
- [ ] Colors are restrained
- [ ] Product cards are visually consistent
- [ ] Amazon CTA is obvious but not aggressive
- [ ] Mobile layout is comfortable
- [ ] Buttons have adequate touch size
- [ ] Focus states are visible
- [ ] Images have alt text
- [ ] Animations are subtle
- [ ] Reduced-motion preference is supported
- [ ] No unnecessary UI components
- [ ] Footer is compact
- [ ] Affiliate disclosure is visible
- [ ] Overall page feels like a trusted recommendation guide rather than a crowded marketplace

---

# 38. Final Design Direction

The visual target is:

**“A calm, modern scientific guide for parents discovering meaningful play and hobbies.”**

The website should feel closer to a premium educational product than a conventional toy store.

### Core aesthetic keywords

**Minimal · Warm · Scientific · Playful · Calm · Modern · Trustworthy · Spacious**

### One-line design rule

> **Keep the interface quiet so the recommendations can speak clearly.**
