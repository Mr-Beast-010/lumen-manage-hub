import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

const labels: Record<string, string> = {
  "": "Dashboard",
  students: "Students",
  teachers: "Teachers",
  attendance: "Attendance",
  exams: "Exams",
  grades: "Grades",
  fees: "Fees",
  reports: "Reports",
  settings: "Settings",
};

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-sm md:flex">
      <Link
        to="/"
        className="flex items-center gap-1.5 text-muted-foreground transition-smooth hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Home</span>
      </Link>
      {parts.map((p, i) => {
        const href = "/" + parts.slice(0, i + 1).join("/");
        const isLast = i === parts.length - 1;
        return (
          <Fragment key={href}>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden />
            {isLast ? (
              <span className="font-medium text-foreground" aria-current="page">
                {labels[p] ?? p}
              </span>
            ) : (
              <Link to={href} className="text-muted-foreground transition-smooth hover:text-foreground">
                {labels[p] ?? p}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
