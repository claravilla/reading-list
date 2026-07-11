"use-client";
import Link from "next/link";

export default function CTALink({
  text,
  link,
}: {
  text: string;
  link: string;
}) {
  return (
    <Link className="cta-link-button" href={link}>
      {text}
    </Link>
  );
}
