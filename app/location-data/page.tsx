import type { Metadata } from "next";
import LocationSearch from "@/components/LocationSearch";

export const metadata: Metadata = {
  title: "Location data — Elrond Intelligence",
  description:
    "Search live and catalogued climate and environmental data for a place: OpenAQ air quality stations and the EU JRC Data Catalogue.",
};

export default function LocationDataPage() {
  return (
    <div className="page">
      <header className="masthead">
        <p className="eyebrow">Elrond Intelligence</p>
        <h1>Location data</h1>
        <p className="dek">
          Pick a data source, enter a place or a topic, and see what&apos;s
          available — with a link to the original source for everything
          we show.
        </p>
      </header>

      <LocationSearch />

      <p className="note">
        Results are fetched live from the sources named next to them and are
        not stored or modified by us. Always check the original source and its
        licence before reusing data.
      </p>
    </div>
  );
}
