import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { careerOpenings } from "@/lib/schema";

export const dynamic = "force-dynamic";

type CareerRolePageProps = {
  params: Promise<{ id: string }>;
};

const ensureStringList = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0
  );
};

const ensureCustomFields = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (
      item
    ): item is {
      label: string;
      value: string;
    } =>
      Boolean(
        item &&
          typeof item === "object" &&
          typeof (item as { label?: unknown }).label === "string" &&
          typeof (item as { value?: unknown }).value === "string"
      )
  );
};

const truncateWords = (text: unknown, limit = 50) => {
  if (typeof text !== "string") return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(" ") + "...";
};

export default async function CareerRolePage({
  params,
}: CareerRolePageProps) {
  const { id } = await params;

  const [opening] = await db
    .select()
    .from(careerOpenings)
    .where(eq(careerOpenings.id, id))
    .limit(1);

  if (!opening || !opening.isActive) {
    notFound();
  }

  const responsibilities = ensureStringList(opening.responsibilities);
  const requirements = ensureStringList(opening.requirements);
  const customFields = ensureCustomFields(opening.customFields);
  const applyHref = opening.applyUrl || "mailto:careers@chainfundit.com";
  const roleFacts = [
    opening.department
      ? {
          label: opening.department,
          icon: Briefcase,
        }
      : null,
    opening.location
      ? {
          label: opening.location,
          icon: MapPin,
        }
      : null,
    opening.employmentType
      ? {
          label: opening.employmentType,
          icon: Clock,
        }
      : null,
  ].filter(Boolean) as Array<{
    label: string;
    icon: typeof Briefcase;
  }>;

  return (
    <>
      <Navbar />
      <div className="bg-[#FDFBF7]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 pb-12 pt-16 md:px-8">
          <Link
            href="/careers#open-roles"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#104109]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to roles
          </Link>

          <div className="rounded-[40px] border border-[#f5f5f4] bg-white p-8 md:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-[760px] space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-xs font-bold text-[#A16207]">
                  OPEN ROLE
                </div>
                <div className="font-jakarta text-[36px] font-extrabold leading-[40px] text-[#1C1917] md:text-[54px] md:leading-[60px]">
                  {opening.title}
                </div>
                {/* {opening.summary && (
                  <p className="font-jakarta text-[18px] leading-[30px] text-[#78716c] md:text-[20px] md:leading-8">
                    {opening.summary}
                  </p>
                )} */}

                {roleFacts.length > 0 && (
                  <div className="flex flex-wrap gap-3 text-sm text-[#78716c]">
                    {roleFacts.map((fact) => {
                      const Icon = fact.icon;

                      return (
                        <div
                          key={fact.label}
                          className="inline-flex items-center gap-2 rounded-full bg-[#F5F5F4] px-4 py-2"
                        >
                          <Icon className="h-4 w-4 text-[#104109]" />
                          <span>{fact.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex w-full max-w-[280px] flex-col gap-4">
                <Button asChild className="h-auto rounded-full bg-[#104109] px-8 py-4">
                  <a href={applyHref} target="_blank" rel="noreferrer">
                    Apply Now
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-auto rounded-full border-[#104109] px-8 py-4 text-[#104109]"
                >
                  <a href="mailto:careers@chainfundit.com">Ask a Question</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white px-4 py-16 md:px-8">
        <div className="mx-auto flex flex-col max-w-[1200px] gap-8">
          <div className="grid md:grid-cols-2 grid-cols-1 gap-5">
            {opening.summary && (
              <section className="rounded-[32px] border border-[#f5f5f4] bg-[#FDFBF7] p-8">
                <div className="mb-3 font-jakarta text-[14px] font-bold leading-5 text-[#A8A29E]">
                  ROLE OVERVIEW
                </div>
                <div className="font-jakarta text-[16px] leading-[30px] text-[#57534E] md:text-[18px]">
                  {truncateWords(opening.summary, 50)}
                </div>
              </section>
            )}

            {responsibilities.length > 0 && (
              <section className="rounded-[32px] border border-[#f5f5f4] bg-white p-8">
                <div className="mb-5 font-jakarta text-[28px] font-bold text-[#1C1917]">
                  What you will do
                </div>
                <div className="space-y-4">
                  {responsibilities.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-[#104109]" />
                      <div className="font-jakarta text-[16px] leading-[28px] text-[#57534E]">
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {requirements.length > 0 && (
              <section className="rounded-[32px] border border-[#f5f5f4] bg-white p-8">
                <div className="mb-5 font-jakarta text-[28px] font-bold text-[#1C1917]">
                  Who we are looking for
                </div>
                <div className="space-y-4">
                  {requirements.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Users className="mt-1 h-5 w-5 shrink-0 text-[#104109]" />
                      <div className="font-jakarta text-[16px] leading-[28px] text-[#57534E]">
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-8">
            {customFields.length > 0 && (
              <section className="rounded-[32px] border border-[#f5f5f4] bg-[#FDFBF7] p-8">
                <div className="mb-5 font-jakarta text-[14px] font-bold leading-5 text-[#A8A29E]">
                  ROLE DETAILS
                </div>
                <div className="space-y-5">
                  {customFields.map((field) => (
                    <div
                      key={`${field.label}-${field.value}`}
                      className="border-b border-[#E7E5E4] pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="font-jakarta text-[14px] font-bold uppercase tracking-[0.08em] text-[#A8A29E]">
                        {field.label}
                      </div>
                      <div className="mt-2 font-jakarta text-[16px] leading-[28px] text-[#1C1917]">
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-[32px] bg-[#104109] p-8 text-white">
              <div className="space-y-3">
                <div className="font-jakarta text-[14px] font-bold leading-5 text-white/70">
                  APPLICATION
                </div>
                <div className="font-jakarta text-[28px] font-bold leading-[34px]">
                  Ready to apply?
                </div>
                <div className="font-jakarta text-[16px] leading-[28px] text-white/80">
                  Submit your application for this role, or contact the team if
                  you need more details before applying.
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Button
                  asChild
                  className="h-auto rounded-full bg-white px-8 py-4 text-[#104109] hover:bg-white/90"
                >
                  <a href={applyHref} target="_blank" rel="noreferrer">
                    Apply for this role
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-auto rounded-full border-white px-8 py-4 text-white hover:bg-white/10"
                >
                  <a href="mailto:careers@chainfundit.com">Email careers</a>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
