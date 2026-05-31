import { describe, expect, it } from "vitest";

import {
  expandRecurringSlotTemplate,
  generateQuarterHourTimeRange,
  getWeekdayFromDate,
  mergeSlotTemplatesAndOverrides,
} from "../modules/appointments/appointment-slot.service.js";

describe("appointment slot service", () => {
  it("derives the weekday from a YYYY-MM-DD date", () => {
    expect(getWeekdayFromDate("2026-06-15")).toBe(1);
  });

  it("generates time values from a recurring range and interval", () => {
    expect(generateQuarterHourTimeRange("08:00", "09:00", 15)).toEqual([
      "08:00",
      "08:15",
      "08:30",
      "08:45",
    ]);
  });

  it("expands a recurring weekly template into concrete slots for a weekday", () => {
    expect(
      expandRecurringSlotTemplate({
        daysOfWeek: [1, 2, 3],
        startTime: "08:00",
        endTime: "08:45",
        intervalMinutes: 15,
        capacity: 3,
        isActive: true,
      }),
    ).toEqual([
      {
        value: "08:00",
        label: "08:00",
        capacity: 3,
        status: "open",
        source: "template",
      },
      {
        value: "08:15",
        label: "08:15",
        capacity: 3,
        status: "open",
        source: "template",
      },
      {
        value: "08:30",
        label: "08:30",
        capacity: 3,
        status: "open",
        source: "template",
      },
    ]);
  });

  it("does not expose an inactive recurring rule", () => {
    expect(
      expandRecurringSlotTemplate({
        daysOfWeek: [0, 6],
        startTime: "08:00",
        endTime: "09:00",
        intervalMinutes: 15,
        capacity: 2,
        isActive: false,
      }),
    ).toEqual([]);
  });

  it("merges weekly templates and date overrides", () => {
    const slots = mergeSlotTemplatesAndOverrides(
      [
        {
          value: "08:00",
          label: "08:00",
          capacity: 3,
          status: "open",
          source: "template",
        },
        {
          value: "09:00",
          label: "09:00",
          capacity: 2,
          status: "open",
          source: "template",
        },
      ],
      [
        {
          date: "2026-06-15",
          time: "09:00",
          capacity: 1,
          status: "blocked",
          reason: "Pause equipe",
        },
        {
          date: "2026-06-15",
          time: "14:00",
          capacity: 2,
          status: "open",
          reason: "Ouverture speciale",
        },
      ],
    );

    expect(slots).toEqual([
      {
        value: "08:00",
        label: "08:00",
        capacity: 3,
        status: "open",
        source: "template",
      },
      {
        value: "09:00",
        label: "09:00",
        capacity: 1,
        status: "blocked",
        source: "override",
        overrideId: undefined,
        reason: "Pause equipe",
      },
      {
        value: "14:00",
        label: "14:00",
        capacity: 2,
        status: "open",
        source: "override",
        overrideId: undefined,
        reason: "Ouverture speciale",
      },
    ]);
  });

  it("gives precedence to a date override over the recurring rule for the same time", () => {
    const slots = mergeSlotTemplatesAndOverrides(
      [
        {
          value: "08:00",
          label: "08:00",
          capacity: 3,
          status: "open",
          source: "template",
        },
      ],
      [
        {
          date: "2026-11-01",
          time: "08:00",
          capacity: 0,
          status: "closed",
          reason: "Jour férié",
          closureType: "holiday",
        },
      ],
    );

    expect(slots).toEqual([
      {
        value: "08:00",
        label: "08:00",
        capacity: 0,
        status: "closed",
        source: "override",
        overrideId: undefined,
        reason: "Jour férié",
        closureType: "holiday",
      },
    ]);
  });
});
