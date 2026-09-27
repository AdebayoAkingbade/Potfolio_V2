"use client";

import * as React from "react";
import { Check, X, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface AiSuggestionData {
  title: string;
  field: string;
  originalText: string;
  proposedText: string;
  reason: string;
  source?: string;
  onAccept: (newText: string) => void;
  onDiscard: () => void;
}

export function AiSuggestionModal({
  suggestion,
  open,
  onClose,
}: {
  suggestion: AiSuggestionData | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!open || !suggestion) return null;

  const handleAccept = () => {
    suggestion.onAccept(suggestion.proposedText);
    onClose();
  };

  const handleDiscard = () => {
    suggestion.onDiscard();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-suggestion-title"
    >
      <div className="relative w-full max-w-2xl rounded-xl border border-primary/40 bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="ai-suggestion-title" className="font-display text-lg font-semibold">
                  {suggestion.title}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {suggestion.source === "openai" ? "OpenAI Intelligence" : "Career Rules Engine"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review proposed revision before applying. Your original draft remains untouched until explicit acceptance.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDiscard}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Why this suggestion */}
        <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-foreground">Why this was suggested: </span>
            {suggestion.reason}
          </div>
        </div>

        {/* Before / After Comparison */}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {/* Current / Original */}
          <div className="rounded-lg border border-border bg-background/50 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Current Draft
              </span>
              <Badge variant="secondary" className="text-[10px]">
                Original
              </Badge>
            </div>
            <div className="mt-3 text-sm leading-6 text-muted-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
              {suggestion.originalText || "(Empty)"}
            </div>
          </div>

          {/* AI Proposed */}
          <div className="rounded-lg border border-primary/50 bg-primary/[0.03] p-4 ring-1 ring-primary/20">
            <div className="flex items-center justify-between pb-2 border-b border-primary/20">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Proposed Revision
              </span>
              <Badge className="bg-primary text-primary-foreground text-[10px]">
                AI Enhanced
              </Badge>
            </div>
            <div className="mt-3 text-sm leading-6 text-foreground font-medium whitespace-pre-wrap max-h-48 overflow-y-auto">
              {suggestion.proposedText}
            </div>
          </div>
        </div>

        {/* Explicit Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 border-t border-border/80 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleDiscard}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-1.5" />
            Discard Suggestion
          </Button>
          <Button
            type="button"
            onClick={handleAccept}
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Check className="h-4 w-4 mr-1.5" />
            Accept & Apply to Draft
          </Button>
        </div>
      </div>
    </div>
  );
}
