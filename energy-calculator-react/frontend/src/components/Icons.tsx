export function Icon({
  name,
}: {
  name: "feed" | "add" | "grid" | "login" | "heart" | "next";
}) {
  const paths = {
    feed: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
    add: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    grid: "M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z",
    login:
      "M10 17l5-5-5-5v3H2v4h8v3zM20 3h-8v2h8v14h-8v2h8a2 2 0 002-2V5a2 2 0 00-2-2z",
    heart:
      "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
    next: "M8 5v14l11-7z",
  };
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
