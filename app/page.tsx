import EventHero from "@/components/EventHero";
import EventDetails from "@/components/EventDetails";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <EventHero />
      <EventDetails />
    </div>
  );
}
