import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import AmbassadorApplicationForm from "@/components/ambassadors/AmbassadorApplicationForm";
import {
  Megaphone,
  Users,
  Target,
  Camera,
  CheckCircle,
  Clock,
  MapPin,
  GraduationCap,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

export default function AmbassadorPage() {
  return (
    <>
      <Navbar />
      <div className="bg-[#FDFBF7]">
        <div className="flex flex-col gap-16 pt-16 pb-12 items-center justify-center">
          <div className="flex flex-col gap-6 md:px-8 items-center justify-center px-4">
            <div className="flex gap-2 px-4 py-2 bg-yellow-200 rounded-full items-center">
              <Megaphone className="h-4 w-4 text-[#A16207]" />
              <div className="font-jakarta font-bold text-[12px] leading-4 text-[#A16207]">
                DOING GOOD SERIES
              </div>
            </div>

            <div className="font-jakarta font-extrabold md:text-[54px] md:leading-[60px] text-center md:max-w-[62.5rem] text-[36px] leading-[40px]">
              Become a ChainFundIt Ambassador
            </div>

            <div className="font-jakarta font-normal md:text-[20px] md:leading-7 text-center text-[#78716c] pb-4 md:max-w-[60rem] text-[18px] leading-[30px]">
              Are you a storyteller with heart? Join the Doing Good Series to
              spotlight real people, tell real stories, and help communities
              across Nigeria access the support they need.
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="bg-[#104109] border-2 border-[#104109] text-white px-8 py-4 rounded-full h-auto">
                <Link href="#application-form">
                  Apply Now
                </Link>
              </Button>
              <Button
                variant="outline"
                className="px-8 py-4 rounded-full h-auto border-[#104109] text-[#104109]"
              >
                <Link href="mailto:campaigns@chainfundit.com">Ask a Question</Link>
              </Button>
            </div>
          </div>

          <Image
            src="/images/doing-good.jpeg"
            alt="ChainFundIt ambassadors"
            width={1000}
            height={400}
            className="rounded-[48px] object-cover object-center w-full max-w-[1000px] px-4"
          />
        </div>
      </div>

      <div className="py-20 md:px-20 flex items-center justify-center">
        <div className="md:px-8 px-4 md:max-w-[1280px] flex flex-col gap-12">
          <div className="flex flex-col gap-3 items-center">
            <div className="font-jakarta font-bold text-[14px] leading-5 text-[#A8A29E]">
              ABOUT THE ROLE
            </div>
            <div className="font-jakarta font-bold md:text-[36px] text-[30px] md:leading-10 leading-[36px] text-[#1C1917] text-center">
              Flexible, creative, and mission-driven
            </div>
          </div>

          <div className="flex gap-8 justify-center flex-col md:flex-row">
            <div className="md:w-[384px] h-[300px] w-full rounded-[40px] border border-[#f5f5f4] flex flex-col items-center justify-center gap-5 bg-white">
              <div className="w-[80px] h-[80px] rounded-[24px] bg-[#DCFCE7] flex items-center justify-center">
                <Clock className="h-8 w-8 text-[#166534]" />
              </div>
              <div className="font-jakarta font-bold text-[24px] leading-8 text-[#1C1917]">
                Project-based
              </div>
              <div className="font-jakarta font-normal text-[16px] leading-[26px] text-center text-[#78716C] w-[280px]">
                This is not a full-time job. Take on stories when you can.
              </div>
            </div>

            <div className="md:w-[384px] h-[300px] w-full rounded-[40px] border border-[#f5f5f4] flex flex-col items-center justify-center gap-5 bg-white">
              <div className="w-[80px] h-[80px] rounded-[24px] bg-[#FEF9C3] flex items-center justify-center">
                <MapPin className="h-8 w-8 text-[#A16207]" />
              </div>
              <div className="font-jakarta font-bold text-[24px] leading-8 text-[#1C1917]">
                Fully remote
              </div>
              <div className="font-jakarta font-normal text-[16px] leading-[26px] text-center text-[#78716C] w-[280px]">
                Based anywhere in Nigeria with remote collaboration.
              </div>
            </div>

            <div className="md:w-[384px] h-[300px] w-full rounded-[40px] border border-[#f5f5f4] flex flex-col items-center justify-center gap-5 bg-white">
              <div className="w-[80px] h-[80px] rounded-[24px] bg-[#FFEDD5] flex items-center justify-center">
                <Target className="h-8 w-8 text-[#EA580C]" />
              </div>
              <div className="font-jakarta font-bold text-[24px] leading-8 text-[#1C1917]">
                Rolling start
              </div>
              <div className="font-jakarta font-normal text-[16px] leading-[26px] text-center text-[#78716C] w-[280px]">
                Applications are reviewed on a rolling basis.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 md:px-24 px-4 bg-white flex justify-center items-center">
        <div className="flex flex-col md:flex-row gap-12 md:max-w-[1200px]">
          <div className="flex-1 flex flex-col gap-6">
            <div className="font-jakarta px-3 py-1 bg-[#E7E5E4] rounded-lg font-bold text-[12px] leading-4 w-fit">
              What You'll Do
            </div>
            <div className="font-jakarta font-extrabold md:text-[40px] md:leading-[44px] text-[28px] leading-[34px]">
              Capture stories that inspire giving
            </div>
            <ul className="flex flex-col gap-3 text-[#78716c]">
              {[
                "Identify individuals or charities who need crowdfunding support.",
                "Conduct short interviews (in-person or online) to capture their story.",
                "Create brief, authentic content (video, photos, captions) for social media.",
                "Promote the story and its ChainFundIt campaign online.",
                "Work with the ChainFundIt team to maintain quality and storytelling standards.",
              ].map((item) => (
                <li key={item} className="flex gap-3 items-start">
                  <CheckCircle className="h-5 w-5 text-[#104109] mt-0.5" />
                  <span className="font-jakarta text-[16px] leading-[26px]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div className="font-jakarta px-3 py-1 bg-[#E7E5E4] rounded-lg font-bold text-[12px] leading-4 w-fit">
              Who We're Looking For
            </div>
            <div className="font-jakarta font-extrabold md:text-[40px] md:leading-[44px] text-[28px] leading-[34px]">
              Storytellers who care about people
            </div>
            <ul className="flex flex-col gap-3 text-[#78716c]">
              {[
                "Mass Communication or media students and graduates.",
                "TikTokers, Instagram storytellers, vloggers, or campus journalists.",
                "Passionate about social issues and digital storytelling.",
                "Comfortable interviewing people from all walks of life.",
                "Proactive and able to meet deadlines.",
                "Based anywhere in Nigeria (fully remote role).",
              ].map((item) => (
                <li key={item} className="flex gap-3 items-start">
                  <GraduationCap className="h-5 w-5 text-[#104109] mt-0.5" />
                  <span className="font-jakarta text-[16px] leading-[26px]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="py-20 md:px-24 px-4 bg-[#FDFBF7] flex justify-center items-center">
        <div className="flex flex-col md:flex-row gap-12 md:max-w-[1200px]">
          <div className="flex-1 flex flex-col gap-6">
            <div className="font-jakarta px-3 py-1 bg-[#E7E5E4] rounded-lg font-bold text-[12px] leading-4 w-fit">
              What You'll Gain
            </div>
            <div className="font-jakarta font-extrabold md:text-[40px] md:leading-[44px] text-[28px] leading-[34px]">
              Grow your skills while doing meaningful work
            </div>
            <ul className="flex flex-col gap-3 text-[#78716c]">
              {[
                "Hands-on storytelling and content creation experience.",
                "Real-world portfolio building opportunities.",
                "Flexibility to work at your own pace.",
                "Exposure to impact-driven digital media.",
                "Opportunity to build a name in social impact storytelling.",
              ].map((item) => (
                <li key={item} className="flex gap-3 items-start">
                  <Camera className="h-5 w-5 text-[#104109] mt-0.5" />
                  <span className="font-jakarta text-[16px] leading-[26px]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div className="font-jakarta px-3 py-1 bg-[#E7E5E4] rounded-lg font-bold text-[12px] leading-4 w-fit">
              Application Details
            </div>
            <div className="font-jakarta font-extrabold md:text-[40px] md:leading-[44px] text-[28px] leading-[34px]">
              Applications are open now
            </div>
            <div className="font-jakarta text-[16px] leading-[26px] text-[#78716c]">
              Submit the application form below. If you have questions, reach
              out to <Link href='mailto:campaigns@chainfundit.com'>campaigns@chainfundit.com</Link>.
            </div>
            <div className="flex items-center gap-2 text-[#78716c] text-sm">
              <MessageCircle className="h-4 w-4" />
              Questions? Reach out to us anytime.
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 md:px-24 px-4 bg-white flex justify-center items-center">
        <div className="md:max-w-[1200px] w-full rounded-[40px] border border-[#f5f5f4] bg-white p-8 md:p-12 space-y-8">
          <div className="space-y-3 text-center">
            <div className="font-jakarta font-bold text-[14px] leading-5 text-[#A8A29E]">
              APPLICATION FORM
            </div>
            <div className="font-jakarta font-bold md:text-[36px] text-[30px] md:leading-10 leading-[36px] text-[#1C1917]">
              Apply to become an ambassador
            </div>
            <div className="font-jakarta text-[16px] leading-[26px] text-[#78716c]">
              Share your details and we will follow up with next steps.
            </div>
          </div>

          <AmbassadorApplicationForm />
        </div>
      </div>

      <div className="py-16 px-4">
        <div className="max-w-[1100px] mx-auto bg-[#104109] rounded-[40px] p-10 md:p-14 text-white flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="space-y-3">
            <div className="font-jakarta font-bold text-[12px] leading-4 uppercase text-white/70">
              Join the movement
            </div>
            <div className="font-jakarta font-extrabold md:text-[36px] md:leading-[40px] text-[28px] leading-[34px]">
              Raise stories that move people. Raise funds. Support dreams.
            </div>
            <div className="font-jakarta text-[16px] leading-[26px] text-white/80">
              Help us spotlight stories that deserve to be heard across Nigeria.
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="bg-white border-2 border-[#104109] text-[#104109] hover:bg-[#104109] hover:text-white hover:border-2 hover:border-white px-8 py-4 rounded-full h-auto">
              <Link href="#application-form">
                Apply Now
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-white text-white rounded-full px-8 py-4 h-auto"
            >
              <Link href="mailto:campaigns@chainfundit.com">Ask a Question</Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
