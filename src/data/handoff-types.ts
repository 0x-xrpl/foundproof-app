import { HandoffType } from "@/types/found-record";

export const handoffOptions: { label: string; value: HandoffType }[] = [
  { label: "Police box", value: "police_box" },
  { label: "Station counter", value: "station_counter" },
  { label: "Airport counter", value: "airport_counter" },
  { label: "Hotel front", value: "hotel_front" },
  { label: "Facility desk", value: "facility_desk" },
  { label: "Event staff", value: "event_staff" },
  { label: "School office", value: "school_office" },
  { label: "Office reception", value: "office_reception" },
  { label: "Other authorized desk", value: "other_authorized_desk" }
];
