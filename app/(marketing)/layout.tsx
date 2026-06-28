import { getLang } from "@/lib/i18n-server";
import { LangProvider } from "@/components/lang-provider";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getLang();
  return (
    <LangProvider lang={lang}>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </LangProvider>
  );
}
