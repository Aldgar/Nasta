import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export interface TimelineStep {
  key: string;
  label: string;
  description: string;
  timestamp?: string | null;
  state: "complete" | "current" | "pending" | "failed";
}

interface TrackingTimelineProps {
  steps: TimelineStep[];
  isDark: boolean;
  colors: {
    text: string;
    tint: string;
    textMuted: string;
    border: string;
    surfaceAlt: string;
    ledGreen: string;
  };
}

function formatTimestamp(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} at ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

export function TrackingTimeline({ steps, isDark, colors }: TrackingTimelineProps) {
  return (
    <View style={styles.container}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;

        const dotBg =
          step.state === "complete"
            ? colors.ledGreen
            : step.state === "current"
            ? colors.tint
            : step.state === "failed"
            ? "#ef4444"
            : isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.08)";

        const dotBorder =
          step.state === "complete"
            ? colors.ledGreen
            : step.state === "current"
            ? colors.tint
            : step.state === "failed"
            ? "#ef4444"
            : isDark
            ? "rgba(255,255,255,0.15)"
            : "rgba(0,0,0,0.12)";

        const lineBg =
          step.state === "complete"
            ? `${colors.ledGreen}50`
            : step.state === "failed"
            ? "#ef444450"
            : isDark
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.06)";

        const labelColor =
          step.state === "complete"
            ? colors.ledGreen
            : step.state === "current"
            ? colors.tint
            : step.state === "failed"
            ? "#ef4444"
            : colors.textMuted;

        const descColor =
          step.state === "pending"
            ? isDark
              ? "rgba(255,255,255,0.2)"
              : "rgba(0,0,0,0.2)"
            : colors.textMuted;

        return (
          <View key={step.key} style={styles.stepRow}>
            {/* Dot column */}
            <View style={styles.dotColumn}>
              <View
                style={[
                  styles.dot,
                  step.state === "current" && styles.dotCurrent,
                  {
                    backgroundColor: dotBg,
                    borderColor: dotBorder,
                  },
                  step.state === "current" && {
                    shadowColor: colors.tint,
                    shadowOpacity: 0.4,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 0 },
                    elevation: 4,
                  },
                ]}
              >
                {step.state === "complete" && (
                  <Feather name="check" size={10} color="#fff" />
                )}
                {step.state === "failed" && (
                  <Feather name="x" size={10} color="#fff" />
                )}
                {step.state === "current" && (
                  <View style={styles.pulseDot} />
                )}
              </View>

              {/* Connecting line */}
              {!isLast && (
                <View style={[styles.line, { backgroundColor: lineBg }]} />
              )}
            </View>

            {/* Content column */}
            <View style={[styles.content, !isLast && { paddingBottom: 20 }]}>
              <Text style={[styles.label, { color: labelColor }]}>
                {step.label}
              </Text>
              <Text style={[styles.description, { color: descColor }]}>
                {step.description}
              </Text>
              {step.timestamp && (
                <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                  {formatTimestamp(step.timestamp)}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export interface TimelineAppData {
  status: string;
  appliedAt: string;
  verificationCodeVerifiedAt?: string | null;
  serviceProviderMarkedDoneAt?: string | null;
  completedAt?: string | null;
  paymentStatus?: { completed?: boolean; required?: boolean } | null;
  negotiationRequests?: Array<{ status?: string; [key: string]: unknown }> | null;
  additionalRateRequests?: Array<{ status?: string; [key: string]: unknown }> | null;
}

export function buildServiceProviderTimeline(
  app: TimelineAppData,
  t: (key: string) => string
): TimelineStep[] {
  const status = app.status.toUpperCase();
  const isRejected = status === "REJECTED";
  const isWithdrawn = status === "WITHDRAWN";
  const isAccepted = status === "ACCEPTED";

  const negoList = Array.isArray(app.negotiationRequests) ? app.negotiationRequests : [];
  const hasNegotiation = negoList.length > 0;
  const negotiationAccepted = negoList.some((r) => r.status === "ACCEPTED");
  const negotiationPending = hasNegotiation && !negotiationAccepted && negoList.some((r) => r.status === "PENDING");
  const hasAdditionalNego = Array.isArray(app.additionalRateRequests) && app.additionalRateRequests.length > 0;
  const paymentMade = app.paymentStatus?.completed === true;
  const serviceStarted = !!app.verificationCodeVerifiedAt;
  const markedDone = !!app.serviceProviderMarkedDoneAt;
  const completed = !!app.completedAt;

  const steps: TimelineStep[] = [];

  // 1. Applied
  steps.push({
    key: "applied",
    label: t("tracking.applied"),
    description: t("tracking.appliedDesc"),
    timestamp: app.appliedAt,
    state: "complete",
  });

  // 2. Under Review
  const reviewPassed = ["REVIEWING", "ACCEPTED"].includes(status) || isRejected || isWithdrawn;
  steps.push({
    key: "review",
    label: t("tracking.underReview"),
    description: t("tracking.underReviewDesc"),
    state: isRejected || isWithdrawn ? "complete" : reviewPassed ? "complete" : status === "PENDING" ? "current" : "pending",
  });

  // Terminal: Rejected / Withdrawn
  if (isRejected) {
    steps.push({ key: "rejected", label: t("tracking.rejected"), description: t("tracking.rejectedDesc"), state: "failed" });
    return steps;
  }
  if (isWithdrawn) {
    steps.push({ key: "withdrawn", label: t("tracking.withdrawn"), description: t("tracking.withdrawnDesc"), state: "failed" });
    return steps;
  }

  // 3. Negotiation (pre-acceptance)
  const negoDesc = negotiationAccepted
    ? t("tracking.negotiationDescAccepted") || "Negotiation accepted"
    : negotiationPending
    ? t("tracking.negotiationDesc")
    : hasNegotiation
    ? t("tracking.negotiationDesc")
    : t("tracking.negotiationDescNone");
  steps.push({
    key: "negotiation",
    label: t("tracking.negotiation"),
    description: negoDesc,
    state: isAccepted || negotiationAccepted
      ? "complete"
      : negotiationPending
      ? "current"
      : "pending",
  });

  // 4. Payment Made
  steps.push({
    key: "payment",
    label: t("tracking.paymentMade"),
    description: isAccepted || paymentMade ? t("tracking.paymentMadeDesc") : t("tracking.paymentMadeDescPending"),
    state: isAccepted || paymentMade
      ? "complete"
      : negotiationAccepted
      ? "current"
      : "pending",
  });

  // 5. Accepted
  steps.push({
    key: "accepted",
    label: t("tracking.accepted"),
    description: t("tracking.acceptedDesc"),
    state: isAccepted ? "complete" : "pending",
  });

  // 6. Service Started
  steps.push({
    key: "started",
    label: t("tracking.serviceStarted"),
    description: t("tracking.serviceStartedDesc"),
    timestamp: app.verificationCodeVerifiedAt,
    state: isAccepted ? (serviceStarted ? "complete" : "current") : "pending",
  });

  // 7. Additional Negotiation (conditional, only if additional rate requests exist)
  if (hasAdditionalNego) {
    steps.push({
      key: "additionalNego",
      label: t("tracking.additionalNegotiation"),
      description: t("tracking.additionalNegotiationDesc"),
      state: isAccepted && serviceStarted ? "complete" : "pending",
    });
  }

  // 8. Marked as Done (by the service provider)
  steps.push({
    key: "done",
    label: t("tracking.markedDone"),
    description: t("tracking.markedDoneDesc"),
    timestamp: app.serviceProviderMarkedDoneAt,
    state: isAccepted ? (markedDone ? "complete" : serviceStarted ? "current" : "pending") : "pending",
  });

  // 9. Completed
  steps.push({
    key: "completed",
    label: t("tracking.completed"),
    description: t("tracking.completedDesc"),
    timestamp: app.completedAt,
    state: isAccepted ? (completed ? "complete" : markedDone ? "current" : "pending") : "pending",
  });

  return steps;
}

export function buildEmployerTimeline(
  app: TimelineAppData,
  t: (key: string) => string
): TimelineStep[] {
  const status = app.status.toUpperCase();
  const isRejected = status === "REJECTED";
  const isWithdrawn = status === "WITHDRAWN";
  const isAccepted = status === "ACCEPTED";

  const negoList = Array.isArray(app.negotiationRequests) ? app.negotiationRequests : [];
  const hasNegotiation = negoList.length > 0;
  const negotiationAccepted = negoList.some((r) => r.status === "ACCEPTED");
  const negotiationPending = hasNegotiation && !negotiationAccepted && negoList.some((r) => r.status === "PENDING");
  const hasAdditionalNego = Array.isArray(app.additionalRateRequests) && app.additionalRateRequests.length > 0;
  const paymentMade = app.paymentStatus?.completed === true;
  const serviceStarted = !!app.verificationCodeVerifiedAt;
  const markedDone = !!app.serviceProviderMarkedDoneAt;
  const completed = !!app.completedAt;

  const steps: TimelineStep[] = [];

  // 1. Application Received
  steps.push({
    key: "received",
    label: t("tracking.received"),
    description: t("tracking.receivedDesc"),
    timestamp: app.appliedAt,
    state: "complete",
  });

  // 2. Under Review
  const reviewPassed = ["REVIEWING", "ACCEPTED"].includes(status) || isRejected || isWithdrawn;
  steps.push({
    key: "review",
    label: t("tracking.underReview"),
    description: t("tracking.reviewingDesc"),
    state: isRejected || isWithdrawn ? "complete" : reviewPassed ? "complete" : status === "PENDING" ? "current" : "pending",
  });

  // Terminal states
  if (isRejected) {
    steps.push({ key: "rejected", label: t("tracking.rejected"), description: t("tracking.rejectedEmpDesc"), state: "failed" });
    return steps;
  }
  if (isWithdrawn) {
    steps.push({ key: "withdrawn", label: t("tracking.withdrawn"), description: t("tracking.withdrawnEmpDesc"), state: "failed" });
    return steps;
  }

  // 3. Negotiation
  const negoEmpDesc = negotiationAccepted
    ? t("tracking.negotiationDescAccepted") || "Negotiation accepted"
    : negotiationPending
    ? t("tracking.negotiationEmpDesc")
    : hasNegotiation
    ? t("tracking.negotiationEmpDesc")
    : t("tracking.negotiationDescNone");
  steps.push({
    key: "negotiation",
    label: t("tracking.negotiation"),
    description: negoEmpDesc,
    state: isAccepted || negotiationAccepted
      ? "complete"
      : negotiationPending
      ? "current"
      : "pending",
  });

  // 4. Payment Made
  steps.push({
    key: "payment",
    label: t("tracking.paymentMade"),
    description: isAccepted || paymentMade ? t("tracking.paymentMadeEmpDesc") : t("tracking.paymentMadeEmpDescPending"),
    state: isAccepted || paymentMade
      ? "complete"
      : negotiationAccepted
      ? "current"
      : "pending",
  });

  // 5. Hired
  steps.push({
    key: "accepted",
    label: t("tracking.hired"),
    description: t("tracking.hiredDesc"),
    state: isAccepted ? "complete" : "pending",
  });

  // 6. Service Started
  steps.push({
    key: "started",
    label: t("tracking.serviceStarted"),
    description: t("tracking.serviceStartedEmpDesc"),
    timestamp: app.verificationCodeVerifiedAt,
    state: isAccepted ? (serviceStarted ? "complete" : "current") : "pending",
  });

  // 7. Additional Negotiation (conditional)
  if (hasAdditionalNego) {
    steps.push({
      key: "additionalNego",
      label: t("tracking.additionalNegotiation"),
      description: t("tracking.additionalNegotiationEmpDesc"),
      state: isAccepted && serviceStarted ? "complete" : "pending",
    });
  }

  // 8. Provider Marked Done
  steps.push({
    key: "done",
    label: t("tracking.providerDone"),
    description: t("tracking.providerDoneDesc"),
    timestamp: app.serviceProviderMarkedDoneAt,
    state: isAccepted ? (markedDone ? "complete" : serviceStarted ? "current" : "pending") : "pending",
  });

  // 9. Completed
  steps.push({
    key: "completed",
    label: t("tracking.completed"),
    description: t("tracking.completedEmpDesc"),
    timestamp: app.completedAt,
    state: isAccepted ? (completed ? "complete" : markedDone ? "current" : "pending") : "pending",
  });

  return steps;
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 4,
  },
  stepRow: {
    flexDirection: "row",
  },
  dotColumn: {
    width: 28,
    alignItems: "center",
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  dotCurrent: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  content: {
    flex: 1,
    paddingLeft: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
  },
  description: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: "500",
  },
});

export default TrackingTimeline;
