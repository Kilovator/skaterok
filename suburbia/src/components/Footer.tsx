import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Bounded } from "./Bounded";
import { FooterPhysics } from "./FooterPhysics";
import { siteSettings } from "@/data/settings";

export function Footer() {
  return (
    <footer className="bg-texture bg-zinc-900 text-white overflow-hidden">
      <div className="relative h-[75vh] ~p-10/16 md:aspect-auto">
        <FooterPhysics
          boardTextureURLs={siteSettings.footerSkateboardTextures}
          className="absolute inset-0 overflow-hidden"
        />
        <Logo className="pointer-events-none relative h-20 mix-blend-exclusion md:h-28" />
      </div>
      <Bounded as="nav">
        <ul className="flex flex-wrap justify-center gap-8 ~text-lg/xl">
          {siteSettings.navigation.map((item) => (
            <li key={item.label} className="hover:underline">
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </Bounded>
    </footer>
  );
}
