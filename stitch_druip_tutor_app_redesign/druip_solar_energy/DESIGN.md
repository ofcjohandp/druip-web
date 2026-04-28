# Design System Specification: The Kinetic Academic

## 1. Overview & Creative North Star
**Creative North Star: "The Academic Catalyst"**

This design system rejects the "stiff institution" archetype in favor of a high-energy, editorial experience tailored for the South African student landscape. It is designed to feel like a conversation with a mentor—supportive, vibrant, and momentum-driven. 

To move beyond the "template" look, we utilize **Asymmetric Momentum**. This means breaking the rigid 12-column grid with overlapping elements, oversized typography that bleeds toward edges, and "floating" containers that prioritize tonal depth over structural lines. The goal is a digital space that feels as alive and diverse as a Braamfontein coffee shop.

---

## 2. Color & Surface Strategy
Our palette is rooted in a high-contrast relationship between a deep, electric `primary` and high-energy `secondary` accents.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. Use `surface-container-low` sections against a `surface` background to create natural separation.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical, layered sheets. 
- **Base:** `surface` (#f5f6f7)
- **Secondary Level:** `surface-container-low` (#eff1f2) for grouping content.
- **Top Level:** `surface-container-lowest` (#ffffff) for primary interactive cards.
By nesting a "Lowest" (white) card inside a "Low" (light grey) section, we achieve a premium, soft lift that feels integrated, not "pasted on."

### The Glass & Gradient Rule
To inject "soul" into the UI:
- **Hero CTAs:** Use a linear gradient from `primary` (#0058bb) to `primary_container` (#6c9fff) at a 135° angle.
- **Floating Elements:** Use `surface_container_lowest` with 80% opacity and a `24px` backdrop blur to create a "Frosted Glass" effect for navigation bars or floating action buttons.

---

## 3. Typography: Editorial Authority
We use two distinct typefaces to balance personality and readability.

| Category | Token | Font | Size | Character |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Plus Jakarta Sans | 3.5rem | Bold, expressive, tight tracking. |
| **Headline** | `headline-md` | Plus Jakarta Sans | 1.75rem | Energetic, used for motivation. |
| **Title** | `title-lg` | Be Vietnam Pro | 1.375rem | Clear, friendly, authoritative. |
| **Body** | `body-lg` | Be Vietnam Pro | 1rem | Highly legible for study content. |
| **Label** | `label-md` | Be Vietnam Pro | 0.75rem | All-caps for metadata/tags. |

**The Hierarchy Strategy:** Large `display` type should be used for student "Wins" (e.g., "Ace your Finals"). Contrast these massive headings with generous `body-lg` white space to ensure the UI feels breathable and premium.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering**, not shadows.

- **The Layering Principle:** Avoid `outline`. Instead, place a `surface_container_lowest` card on a `surface_container_high` background. The subtle shift in hex code provides enough contrast for the eye without the "cheapness" of a stroke.
- **Ambient Shadows:** Only used for "Priority 1" floating elements (e.g., a Tutor Booking Card). 
  - **Specs:** `Y: 20px, Blur: 40px, Color: on_surface (8% opacity)`.
- **The Ghost Border Fallback:** If accessibility requires a border (e.g., input fields), use `outline_variant` at **20% opacity**. Never use 100% opaque borders.

---

## 5. Components

### Buttons: The Kinetic Pill
- **Primary:** Gradient (`primary` to `primary_container`). Shape: `full` (9999px). No border.
- **Secondary:** `secondary_container` (#ffca4d) with `on_secondary_container` text. High energy, used for "Book Now."
- **Tertiary:** No background. Bold `primary` text with a `sm` (0.5rem) rounded hover state in `surface_container_high`.

### Cards & Lists: The Separation Rule
- **Forbid Dividers:** Horizontal lines are banned. 
- **Separation Technique:** Use a `1.5rem` (md) or `2rem` (lg) vertical gap between list items. For complex lists, use alternating background tones (`surface` to `surface-container-low`).
- **Corner Radius:** All cards must use `lg` (2rem) or `xl` (3rem) corner radius to reinforce the "Supportive Friend" personality.

### Input Fields: Soft Focus
- **Base:** `surface_container_high` background.
- **Shape:** `md` (1.5rem) radius.
- **Focus State:** Transition background to `surface_container_lowest` and add a `2px` ghost border using `primary_fixed_dim` at 40% opacity.

### Featured Tutor Chips
- Use `tertiary_container` (#ff9475) for high-energy tags like "Pro" or "Top Rated." These should be small, high-contrast pops of color that break the blue/white dominance.

---

## 6. Do’s and Don’ts

### Do
- **Use Intentional Asymmetry:** Align headings to the left but allow images or decorative elements to bleed off the right edge of the screen.
- **Embrace "Mzansi" Vibrance:** Use `secondary` (Yellow/Orange) as a highlight color for success states or notification pings—a nod to the energy of South African youth culture.
- **Prioritize Breathing Room:** Use the `xl` (3rem) spacing token between major sections. If it feels like too much white space, it’s probably just right.

### Don’t
- **Don’t use "Boring" Neutrals:** Avoid mid-tone greys. Stick to the extremes: very light `surface` or very dark `on_surface`.
- **Don’t use Standard Grids:** Avoid the "three-card row" look. Try an overlapping stack or a horizontal scroll with partial visibility of the next card to encourage discovery.
- **No Sharp Corners:** Every interactive element must have a minimum of `sm` (0.5rem) rounding. Sharp corners feel corporate; we are communal.