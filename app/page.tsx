import { About } from "@/components/sections/about";
import { Achievements } from "@/components/sections/achievements";
import { Blog } from "@/components/sections/blog";
import { Contact } from "@/components/sections/contact";
import { Hero } from "@/components/sections/hero";
import { Projects } from "@/components/sections/projects";
import { Skills } from "@/components/sections/skills";
import { Testimonials } from "@/components/sections/testimonials";
import { Timeline } from "@/components/sections/timeline";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <About />
      <Skills />
      <Timeline />
      <Projects />
      <Achievements />
      <Testimonials />
      <Blog />
      <Contact />
    </main>
  );
}
