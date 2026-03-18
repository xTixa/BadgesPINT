import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-[#2AA4BF]/20 bg-white text-slate-800">
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        <div className="grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-slate-800">About Badges PINT</h3>
            <p className="text-sm text-slate-800">
              Empowering professionals through recognized achievements and skill certifications.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-slate-800">Quick Links</h3>
            <ul className="m-0 list-none p-0">
              <li className="mb-2">
                <Link className="text-sm text-slate-800 hover:text-[#04C4D9]" to="/learning-paths">
                  Learning Paths
                </Link>
              </li>
              <li className="mb-2">
                <Link className="text-sm text-slate-800 hover:text-[#04C4D9]" to="/badges">
                  All Badges
                </Link>
              </li>
              <li className="mb-2">
                <Link className="text-sm text-slate-800 hover:text-[#04C4D9]" to="/areas">
                  Areas
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-slate-800">Contact</h3>
            <p className="text-sm text-slate-800">
              Have questions? Reach out to us at support@badgespint.com
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-[#2AA4BF] pt-8 text-center text-sm text-slate-800">
          © {new Date().getFullYear()} Badges PINT. All rights reserved.
        </div>
      </div>
    </footer>
  );
}