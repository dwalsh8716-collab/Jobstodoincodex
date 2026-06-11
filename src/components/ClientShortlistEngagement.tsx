"use client";

import { useEffect, useRef } from "react";
import {
  recruiterLabsPortalEngagementEvents,
  type RecruiterLabsPortalEngagementEvent,
} from "@/lib/recruiter-labs-engagement-shared";

type ClientShortlistEngagementProps = {
  enabled: boolean;
};

type PrivateEngagementPayload = {
  eventType: RecruiterLabsPortalEngagementEvent;
  shortlistCandidateId?: string;
  dwellMilliseconds?: number;
  location?: string;
};

type PrivateEngagementDetail = PrivateEngagementPayload;

const engagementEventNames = new Set<string>(recruiterLabsPortalEngagementEvents);
const minimumDwellMs = 5000;
const regularFlushMs = 30000;
const profileVisibilityThreshold = 0.6;

function tokenFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const token = parts[0] === "client" && parts[1] === "shortlist" ? parts[2] : "";
  return token || "";
}

function isEngagementEvent(
  eventType: string | undefined,
): eventType is RecruiterLabsPortalEngagementEvent {
  return Boolean(eventType && engagementEventNames.has(eventType));
}

function isPrivateEngagementDetail(
  detail: unknown,
): detail is PrivateEngagementDetail {
  if (!detail || typeof detail !== "object") return false;
  const eventType = (detail as { eventType?: string }).eventType;
  return isEngagementEvent(eventType);
}

function sendPrivateEngagementEvent(
  token: string,
  payload: PrivateEngagementPayload,
  keepalive = false,
) {
  if (!token) return;

  const body = JSON.stringify({
    token,
    location: "client_shortlist_portal",
    ...payload,
  });

  if (keepalive && "sendBeacon" in navigator) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/client-shortlist-engagement", blob);
    return;
  }

  void fetch("/api/client-shortlist-engagement", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive,
  }).catch(() => undefined);
}

export function ClientShortlistEngagement({
  enabled,
}: ClientShortlistEngagementProps) {
  const tokenRef = useRef("");
  const sentProfileEventsRef = useRef(new Set<string>());
  const visibleProfilesRef = useRef(new Map<string, number>());
  const recentEventsRef = useRef(new Map<string, number>());

  useEffect(() => {
    if (!enabled) return;

    tokenRef.current = tokenFromPath();
    if (!tokenRef.current) return;

    const token = tokenRef.current;

    function send(
      payload: PrivateEngagementPayload,
      options: { keepalive?: boolean; dedupeMs?: number } = {},
    ) {
      const key = `${payload.eventType}:${payload.shortlistCandidateId || "shortlist"}`;
      const now = Date.now();
      const dedupeMs = options.dedupeMs ?? 15000;
      const lastSentAt = recentEventsRef.current.get(key);

      if (lastSentAt && now - lastSentAt < dedupeMs) return;

      recentEventsRef.current.set(key, now);
      sendPrivateEngagementEvent(token, payload, Boolean(options.keepalive));
    }

    function flushVisibleDwell(keepalive = false) {
      const now = Date.now();

      visibleProfilesRef.current.forEach((startedAt, candidateId) => {
        const dwellMilliseconds = now - startedAt;
        if (dwellMilliseconds < minimumDwellMs) return;

        send(
          {
            eventType: "candidate_profile_dwell_time",
            shortlistCandidateId: candidateId,
            dwellMilliseconds: Math.round(dwellMilliseconds),
          },
          { keepalive, dedupeMs: keepalive ? 0 : 20000 },
        );
        visibleProfilesRef.current.set(candidateId, now);
      });
    }

    send({ eventType: "shortlist_opened" }, { dedupeMs: 60000 });
    send({ eventType: "shortlist_viewed" }, { dedupeMs: 60000 });

    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                const candidateId = (entry.target as HTMLElement).dataset
                  .clientShortlistCandidateId;
                if (!candidateId) return;

                if (entry.isIntersecting) {
                  visibleProfilesRef.current.set(candidateId, Date.now());

                  if (!sentProfileEventsRef.current.has(candidateId)) {
                    sentProfileEventsRef.current.add(candidateId);
                    send({
                      eventType: "candidate_card_viewed",
                      shortlistCandidateId: candidateId,
                    });
                  }
                  return;
                }

                flushVisibleDwell(true);
                visibleProfilesRef.current.delete(candidateId);
              });
            },
            { threshold: profileVisibilityThreshold },
          )
        : null;

    document
      .querySelectorAll<HTMLElement>("[data-client-shortlist-candidate-id]")
      .forEach((element) => observer?.observe(element));

    function handlePrivateTrigger(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const trigger = target.closest<HTMLElement>(
        "[data-client-shortlist-engagement]",
      );
      if (!trigger) return;

      const eventType = trigger.dataset.clientShortlistEngagement;
      if (!isEngagementEvent(eventType)) return;

      const candidateId =
        trigger.dataset.clientShortlistCandidateId ||
        trigger.closest<HTMLElement>("[data-client-shortlist-candidate-id]")
          ?.dataset.clientShortlistCandidateId;

      send({ eventType, shortlistCandidateId: candidateId });
    }

    function handlePrivateCustomEvent(event: Event) {
      if (!("detail" in event) || !isPrivateEngagementDetail(event.detail)) {
        return;
      }

      send(event.detail);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        flushVisibleDwell(true);
      }
    }

    function handlePageHide() {
      flushVisibleDwell(true);
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") flushVisibleDwell();
    }, regularFlushMs);

    document.addEventListener("click", handlePrivateTrigger);
    window.addEventListener(
      "client-shortlist-engagement",
      handlePrivateCustomEvent,
    );
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      observer?.disconnect();
      flushVisibleDwell(true);
      window.clearInterval(interval);
      document.removeEventListener("click", handlePrivateTrigger);
      window.removeEventListener(
        "client-shortlist-engagement",
        handlePrivateCustomEvent,
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [enabled]);

  return null;
}
