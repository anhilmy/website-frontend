# Portfolio Website — Final Planning Document

## Tech Stack

- **Framework**: Vue.js 3 (Composition API)
- **Build**: Vite
- **Styling**: TailwindCSS + PrimeVue
- **Routing**: Vue Router
- **CMS**: WordPress (REST API) — for blog posts and project pages
- **Deployment**: Docker on self-hosted RaspberryPi + Cloudflare Tunnel

---

## Design Direction

### Color Palette — "Warm Clay"

| Token         | Hex       | Usage                              |
| ------------- | --------- | ---------------------------------- |
| `sand-50`     | `#fdf8f3` | Page background                    |
| `sand-100`    | `#f5ebe0` | Card / section background          |
| `sand-200`    | `#e6d5c3` | Borders, dividers                  |
| `clay-500`    | `#b07d56` | Primary accent (links, buttons)    |
| `clay-600`    | `#96643e` | Hover states                       |
| `clay-700`    | `#7a4f2b` | Active / pressed                   |
| `bark-800`    | `#4a3728` | Heading text                       |
| `bark-900`    | `#3b2c1e` | Body text                          |
| `cream-white` | `#fffaf5` | Navbar background, highlight areas |

### Typography

- **Headings**: Serif font (e.g., `Georgia`, `Playfair Display`, or `Lora`)
- **Body**: Sans-serif (e.g., `Inter`, `Source Sans 3`, or system default)
- Clean, readable, generous whitespace

### General Principles

- No gradient backgrounds, no dark/black theme
- Soft, warm, paper-like feel
- Minimal animations — subtle hover transitions only
- Mobile-responsive (single column on small screens)
- Max content width ~768px, centered

---

## Hardcoded vs Dynamic Data

| Data                         | Source        | Reason                                                        |
| ---------------------------- | ------------- | ------------------------------------------------------------- |
| Name, tagline, bio story     | Hardcoded     | Rarely changes, core identity — no need for a CMS round-trip  |
| Profile photo                | Hardcoded     | Static asset in `/src/assets/`                                |
| Contact links (email, LinkedIn, GitHub) | Hardcoded | Rarely changes, avoids unnecessary API dependency    |
| Skills / tech stack tags     | Hardcoded     | Simple array in component, easy to update in code             |
| Experience timeline entries  | Hardcoded     | Structured data in component, changes infrequently            |
| Uses page content            | Hardcoded     | Personal list, easier to maintain in code                     |
| Greeting list (Hero)         | Hardcoded     | Static array, randomly selected on page load                  |
| Blog posts                   | WordPress API | Dynamic content, updated frequently                           |
| Project posts                | WordPress API | Dynamic content with featured images                          |
| Navbar / footer links        | Hardcoded     | Static structure                                              |

**Rule of thumb**: If it changes less than once a month, hardcode it. If it's content you'll publish regularly, use WordPress.

---

## Reading Time Calculation

Reading time is calculated **client-side** from the WordPress post HTML content:

```
1. Strip all HTML tags from the post content
2. Count the remaining words (split by whitespace)
3. Divide by 200 (average adult reading speed in WPM)
4. Round up to nearest minute
5. Display as "X min read"
```

Implemented as a composable `useReadingTime.js`. No backend support needed.

---

## Site Structure

### Layout (shared across all pages)

```
┌──────────────────────────────────────┐
│  Navbar                              │
│  [Hilmy] ·  Blog  ·  Projects       │
├──────────────────────────────────────┤
│                                      │
│          <RouterView />              │
│                                      │
├──────────────────────────────────────┤
│  Footer                              │
│  © 2026 · GitHub · LinkedIn · Email  │
└──────────────────────────────────────┘
```

- Navbar: Name/logo on the left, page links on the right. Sticky on scroll.
- Footer: Social links, copyright. Minimal.
- Clicking the name/logo always goes to home (About Me).
- Nav links: Blog, Projects (Uses page linked in footer only to keep nav clean).

---

## Pages

### 1. About Me (Homepage) — `/`

The landing page. Storytelling format, not a bullet-point resume.

#### Sections (in order)

1. **Hero** — Random greeting, name, one-liner tagline, profile photo
2. **Story** — Conversational narrative, first person
3. **Skills / Tech Stack** — Tag cloud / pill badges (hardcoded)
4. **Experience Timeline** — Vertical timeline of career history (hardcoded)
5. **Let's Connect** — Email, LinkedIn, GitHub as simple call-to-action row (hardcoded)

#### Hero — Random Greeting

On each page load (not on route change, only on full refresh), one greeting is randomly selected from this list and displayed with a subtle CSS fade-in transition (e.g., `opacity 0→1` over 0.6s):

```js
const greetings = [
  "Hi, I'm Hilmy.",
  "Halo, saya Hilmy.",        // Indonesian
  "Hey there, I'm Hilmy.",
  "Yo! I'm Hilmy.",
  "Welcome — I'm Hilmy.",
  "Salam, saya Hilmy.",       // Indonesian formal
  "G'day, I'm Hilmy.",
  "Howdy, I'm Hilmy.",
  "Bonjour, je suis Hilmy.",  // French
  "こんにちは、Hilmy です。",    // Japanese
]
```

The greeting is selected once in `setup()` and stays stable for the session. The fade-in plays on component mount.

#### About Me — Content (All Hardcoded)

---

**Hero Section**

# [random greeting]

*A software engineer who builds things that work — from microservices to the teams behind them.*

[profile photo]

---

**Story Section**

I'm Ahmad Naufal Hilmy, a software engineer based in Depok, Indonesia. I graduated from Universitas Indonesia with a degree in Computer Science, and since then I've been drawn to the kind of work that sits at the intersection of systems and people.

Most of my days revolve around designing and building backend systems — architecting APIs, wiring up microservices, and making sure things hold up when real users start depending on them. I've worked with Go, Python, and JavaScript across projects ranging from mobile banking platforms to hospital information systems and ERP customizations.

But engineering, for me, isn't just about writing code. At Core Initiative Studio, I've had the chance to lead a small team through full project lifecycles — from sitting down with stakeholders to understand what they actually need, all the way to deploying services into Kubernetes clusters and running workshops to hand things over. I've also mentored vocational interns, guiding them through their first real experience with version control, deployment, and shipping something that matters.

What keeps me going is the process of figuring things out: untangling a messy domain, finding the simplest design that works, and then building it solidly. I care about clean architecture, useful logging, and systems that teams can actually maintain long after the initial build.

When I'm not coding, I'm probably tinkering with my self-hosted RaspberryPi setup (yes, this website runs on one) or exploring whatever catches my curiosity next.

---

**Skills / Tech Stack** (tag pills, hardcoded array)

`Go` `Python` `JavaScript` `Vue.js` `SQL` `ERPNext` `Kafka` `gRPC` `Docker` `Kubernetes` `Nginx` `Redis` `Git`

---

**Experience Timeline** (vertical line with dots, hardcoded)

```
● Oct 2023 – Present
  Software Engineer — Core Initiative Studio
  Building microservices, leading teams, and shipping products for fintech and healthtech clients.

● Jan – Jul 2023
  Internal Auditor — PT. Pupuk Indonesia (Persero)
  Data analysis, fraud detection, and built an audit monitoring MVP.

● Jul – Dec 2022
  Software Engineer — PT. Ecomindo Saranacipta
  Archive management system for KSEI using .NET and Blazor.

● Jun 2017 – Feb 2022
  B.S. Computer Science — Universitas Indonesia
```

---

**Let's Connect**

Feel free to reach out — whether it's a project idea, a collaboration, or just to say hi.

- Email: hilmyahmadnaufal@gmail.com
- LinkedIn: linkedin.com/in/anhilmy
- GitHub: github.com/anhilmy

---

### 2. Blog — `/blog`

Displays blog posts fetched from WordPress via WP REST API.

#### Views

| Route              | View            | Description                                      |
| ------------------ | --------------- | ------------------------------------------------ |
| `/blog`            | `BlogList.vue`  | Paginated list of posts (title, date, excerpt)   |
| `/blog/:slug`      | `BlogPost.vue`  | Full post content rendered from WP API response  |

#### Blog List Card Layout

```
┌─────────────────────────────────┐
│  Post Title                     │
│  Jan 15, 2026 · 5 min read     │
│                                 │
│  Excerpt text goes here...      │
│  [Read more →]                  │
└─────────────────────────────────┘
```

- Text-only card (no thumbnail on list view)
- Sand-100 background, clay-500 link color
- Pagination at bottom (Previous / Next)

#### Blog Post Layout

- Title (heading)
- Date + reading time (subtitle)
- Featured image (if available from WP)
- HTML content from WP API (sanitized with DOMPurify)
- ← Back to blog link

---

### 3. Projects — `/projects`

Displays project showcase. List view and detail view both fetched from a WordPress Custom Post Type `project`.

#### Views

| Route                | View               | Description                                      |
| -------------------- | ------------------ | ------------------------------------------------ |
| `/projects`          | `ProjectList.vue`  | Stacked list of project cards                    |
| `/projects/:slug`    | `ProjectPost.vue`  | Full project write-up from WP                    |

#### Project Card Layout — Desktop (≥768px)

Horizontal card. Image on the left, text on the right. Single column, stacked top-to-bottom.

```
┌──────────────────────────────────────────────────────┐
│  ┌──────────┐                                        │
│  │          │  Project Name                          │
│  │ Thumbnail│  Teaser text (1-2 lines)...            │
│  │          │  [View Project →]                      │
│  └──────────┘                                        │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  ┌──────────┐                                        │
│  │          │  Another Project                       │
│  │ Thumbnail│  Another teaser...                     │
│  │          │  [View Project →]                      │
│  └──────────┘                                        │
└──────────────────────────────────────────────────────┘
```

#### Project Card Layout — Mobile (<768px)

Vertical card. Image on top, text below.

```
┌──────────────────────────────────┐
│  ┌────────────────────────────┐  │
│  │       Thumbnail            │  │
│  └────────────────────────────┘  │
│  Project Name                    │
│  Teaser text (1-2 lines)...     │
│  [View Project →]               │
└──────────────────────────────────┘
```

- Thumbnail: WP featured image (`_embedded["wp:featuredmedia"]`)
- Project Name: post title
- Teaser: post excerpt

#### WordPress: Custom Post Type `project`

**API endpoint**: `/wp-json/wp/v2/projects`

Config:
```js
// src/config/wordpress.js
export default {
  baseUrl: import.meta.env.VITE_WP_API_URL || 'https://blog.anhilmy.com/wp-json/wp/v2',
  endpoints: {
    posts: '/posts',
    projects: '/projects',    // CPT: project
    categories: '/categories',
    tags: '/tags',
    media: '/media',
  },
  postsPerPage: 10,
}
```

Environment variable in `.env`:
```
VITE_WP_API_URL=https://blog.anhilmy.com/wp-json/wp/v2
```

---

### 4. Uses — `/uses`

A page listing dev setup, tools, and hardware. All content hardcoded.

#### Sections (suggested, adjust to your actual setup)

**Editor & Terminal**
- VS Code with [list extensions]
- Terminal: [your terminal]
- Font: [your coding font]

**Languages & Frameworks**
- Go, Python, JavaScript/Vue.js
- ERPNext, gRPC, Kafka

**DevOps & Infrastructure**
- Docker, Kubernetes, Nginx
- Cloudflare Tunnel
- Self-hosted RaspberryPi

**Hardware**
- Laptop: [your laptop]
- Server: RaspberryPi [model]
- Peripherals: [keyboard, monitor, etc.]

Styled as simple sections with headers and bulleted lists. Sand-100 section backgrounds.

---

## File Structure (Final)

```
src/
├── App.vue
├── main.js
├── config/
│   └── wordpress.js              # WP API base URL + endpoints
├── composables/
│   ├── useWordPress.js           # Fetch helper for WP REST API
│   └── useReadingTime.js         # Estimate reading time from HTML content
├── assets/
│   ├── base.css
│   ├── main.css
│   └── profile_image.jpg
├── components/
│   ├── layout/
│   │   ├── MainLayout.vue        # Navbar + RouterView + Footer wrapper
│   │   ├── NavBar.vue            # Shared top navbar
│   │   └── FooterBar.vue         # Shared footer
│   ├── about/
│   │   ├── HeroSection.vue       # Greeting + tagline + photo
│   │   ├── StorySection.vue      # Bio narrative
│   │   ├── SkillTags.vue         # Tech stack pill badges
│   │   ├── TimelineSection.vue   # Experience timeline
│   │   └── ContactSection.vue    # Let's Connect links
│   ├── blog/
│   │   └── BlogCard.vue          # Blog list item card
│   └── projects/
│       └── ProjectCard.vue       # Project list item card (horizontal/vertical)
├── router/
│   └── index.js                  # Updated routes
└── views/
    ├── AboutView.vue             # Homepage — assembles about sections
    ├── UsesView.vue              # /uses — dev setup page
    ├── blog/
    │   ├── BlogList.vue          # /blog
    │   └── BlogPost.vue          # /blog/:slug
    ├── projects/
    │   ├── ProjectList.vue       # /projects
    │   └── ProjectPost.vue       # /projects/:slug
    └── ludo/
        └── Ludo.vue              # Hidden easter egg (kept, not linked)
```

**Files to remove**:
- `src/views/home/Home.vue` → replaced by `MainLayout.vue`
- `src/views/HomeView.vue` → replaced by new `AboutView.vue`
- `src/views/main/Test.vue` → dev scratch file
- `src/views/NotImplemented.vue` → all pages will be implemented
- `src/components/HelloWorld.vue`, `TheWelcome.vue`, `WelcomeItem.vue` → Vue boilerplate
- `src/components/icons/*` → Vue boilerplate icons

**Files to keep**:
- `src/views/ludo/Ludo.vue` → hidden easter egg

---

## Router (Final)

```js
const routes = [
  {
    path: '/',
    component: () => import('@/components/layout/MainLayout.vue'),
    children: [
      { path: '', name: 'about', component: () => import('@/views/AboutView.vue') },
      { path: 'blog', name: 'blog-list', component: () => import('@/views/blog/BlogList.vue') },
      { path: 'blog/:slug', name: 'blog-post', component: () => import('@/views/blog/BlogPost.vue') },
      { path: 'projects', name: 'project-list', component: () => import('@/views/projects/ProjectList.vue') },
      { path: 'projects/:slug', name: 'project-post', component: () => import('@/views/projects/ProjectPost.vue') },
      { path: 'uses', name: 'uses', component: () => import('@/views/UsesView.vue') },
    ]
  },
  // Hidden easter egg — not linked in nav
  { path: '/ludo', name: 'ludo', component: () => import('@/views/ludo/Ludo.vue') },
]
```

---

## Tailwind Config (Final)

```js
// tailwind.config.js — extend theme
theme: {
  extend: {
    colors: {
      sand: {
        50: '#fdf8f3',
        100: '#f5ebe0',
        200: '#e6d5c3',
      },
      clay: {
        500: '#b07d56',
        600: '#96643e',
        700: '#7a4f2b',
      },
      bark: {
        800: '#4a3728',
        900: '#3b2c1e',
      },
    },
    fontFamily: {
      heading: ['Georgia', 'Playfair Display', 'serif'],
      body: ['Inter', 'system-ui', 'sans-serif'],
    },
    maxWidth: {
      content: '768px',
    },
  },
},
```

---

## WordPress Backend Requirements

Things to set up on the WordPress side so the frontend works:

### 1. Enable CORS
Add to WordPress (via plugin or `functions.php`):
```php
header("Access-Control-Allow-Origin: https://anhilmy.com");
```

### 2. Register Custom Post Type: `project`
```php
register_post_type('project', [
    'public'       => true,
    'show_in_rest' => true,       // Required for REST API
    'rest_base'    => 'projects', // → /wp-json/wp/v2/projects
    'supports'     => ['title', 'editor', 'excerpt', 'thumbnail'],
    'has_archive'  => true,
    'labels'       => ['name' => 'Projects', 'singular_name' => 'Project'],
]);
```

### 3. Required Data from WordPress APIs

**Blog posts** — `GET /wp-json/wp/v2/posts?_embed&per_page=10&page=1`

| Field                                    | Used for                |
| ---------------------------------------- | ----------------------- |
| `title.rendered`                         | Post title              |
| `excerpt.rendered`                       | Teaser in list view     |
| `content.rendered`                       | Full post body          |
| `slug`                                   | URL routing             |
| `date`                                   | Display date            |
| `_embedded["wp:featuredmedia"][0].source_url` | Featured image (detail view) |

**Projects** — `GET /wp-json/wp/v2/projects?_embed`

| Field                                    | Used for                |
| ---------------------------------------- | ----------------------- |
| `title.rendered`                         | Project name            |
| `excerpt.rendered`                       | Teaser text on card     |
| `content.rendered`                       | Full project write-up   |
| `slug`                                   | URL routing             |
| `_embedded["wp:featuredmedia"][0].source_url` | Thumbnail on card  |

### 4. Pagination Headers

The WP REST API returns these headers which the frontend will use:
- `X-WP-Total` — total number of posts
- `X-WP-TotalPages` — total number of pages

No custom fields or plugins needed beyond the CPT registration and CORS.

---

## Implementation Order

1. Set up Tailwind color palette & typography in `tailwind.config.js`
2. Build shared layout (`MainLayout.vue`, `NavBar.vue`, `FooterBar.vue`)
3. Build About Me page with all sections (Hero with random greeting, Story, Skills, Timeline, Contact)
4. Build Uses page
5. Create WordPress config & `useWordPress` composable + `useReadingTime`
6. Build Blog list + detail pages
7. Build Projects list + detail pages
8. Update router with final routes
9. Clean up old files

---

## Notes

- Blog post HTML from WP is rendered via `v-html` — sanitize with **DOMPurify** before rendering
- All WP API calls include `?_embed` to get featured images in a single request
- Reading time is calculated client-side (strip HTML → count words → divide by 200 WPM → round up)
- `/ludo` route is kept but never linked — easter egg for the curious
- The Uses page content is placeholder — fill in your actual setup when implementing
