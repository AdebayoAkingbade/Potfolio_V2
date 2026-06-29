"use client";

import { motion } from "framer-motion";
import { CalendarDays, Github, Linkedin, Mail, Send } from "lucide-react";

import { siteConfig } from "@/data/site";
import { AnimatedHeading } from "@/components/motion/animated-heading";
import { SectionWrapper } from "@/components/motion/section-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function Contact() {
  return (
    <SectionWrapper id="contact" className="pb-20">
      <div className="container">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="mesh-surface p-6 md:p-10">
              <AnimatedHeading
                eyebrow="Contact"
                title="Have a product worth making beautifully reliable?"
                description="I’m interested in senior engineering roles, product architecture work, and focused collaborations where the details matter."
              />
              <div className="mt-8 grid gap-3">
                <Button asChild variant="outline">
                  <a href={`mailto:${siteConfig.email}`}>
                    <Mail className="h-4 w-4" />
                    {siteConfig.email}
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={siteConfig.linkedin} target="_blank" rel="noreferrer">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={siteConfig.github} target="_blank" rel="noreferrer">
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={siteConfig.calendar} target="_blank" rel="noreferrer">
                    <CalendarDays className="h-4 w-4" />
                    Calendar booking
                  </a>
                </Button>
              </div>
            </div>

            <motion.form
              action={`mailto:${siteConfig.email}`}
              method="post"
              encType="text/plain"
              className="space-y-5 p-6 md:p-10"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input id="name" name="name" className="mt-2" autoComplete="name" required />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    className="mt-2"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <Input id="subject" name="subject" className="mt-2" required />
              </div>
              <div>
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <Textarea id="message" name="message" className="mt-2" required />
              </div>
              <Button type="submit" size="lg">
                <Send className="h-4 w-4" />
                Send message
              </Button>
            </motion.form>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
