import { Link } from "react-router";
import { MoonDisk } from "@/ui/MoonDisk";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <MoonDisk illumination={0.04} brightLimbAngle={270} size={96} />
      <h1 className="mt-6 text-3xl">Nothing in this part of the sky</h1>
      <p className="mt-2 text-muted">The page you were looking for doesn't exist.</p>
      <Link to="/" className="btn-outline mt-6">
        Back to today
      </Link>
    </div>
  );
}
