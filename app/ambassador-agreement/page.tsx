"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import {
  Handshake,
  FileText,
  Scale,
  DollarSign,
  Shield,
  AlertTriangle,
  Gavel,
} from "lucide-react";
import Link from "next/link";

const sections = [
  {
    title: "1. Interpretation",
    icon: FileText,
    content: [
      {
        subtitle: "1.1 Definitions",
        text: (
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>"Applicable Commission"</strong> means the applicable
              Commission payable on a Chained Fundraising Campaign.
            </p>
            <p>
              <strong>"Campaign Organizer"</strong> means anyone who creates a
              Fundraising Campaign on ChainFundIt for the purposes of raising
              funds either via crowdfunding or on a private basis.
            </p>
            <p>
              <strong>"Chain"</strong> or <strong>"Chaining"</strong> means the
              art of opting to share and promote a Fundraising Campaign by
              anyone other than the Campaign Organiser in exchange for a reward
              on successful donations.
            </p>
            <p>
              <strong>"Chainfund"</strong> means a fundraising campaign with
              chain functionality incorporated. Upon the acceptance of these
              terms and conditions, a replica page (i.e Chainfund) of the
              applicable Fundraising Campaign created to recognise the Chain
              Ambassador electronic identity will be created and sent across to
              the Chain Ambassador.
            </p>
            <p>
              <strong>"Chainfunding"</strong> means the practice of sharing or
              promoting a ChainfundIt Fundraising Campaign for the purpose of
              soliciting donations from an individual's social network in
              exchange for a reward. This reward for the purposes of this
              document shall be a commission unless otherwise stated in the
              specified campaign.
            </p>
            <p>
              <strong>"Chain Ambassador"</strong> means any individual or
              corporate entity who opts to chain a Fundraising Campaign by
              submitting an application to Chainfundit and agreeing to these
              terms and conditions.
            </p>
            <p>
              <strong>"Chained Fundraising Campaign"</strong> means the replica
              campaign page created and given to a Chain Ambassador to share and
              promote on behalf of the Fundraising Campaign they opted to chain.
            </p>
            <p>
              <strong>"Commission"</strong> means commission calculated on any
              successful donations (with the exclusion of any donations made by
              the chain Ambassador) at the applicable commission rate for the
              Fundraising Campaign specified by the Campaign Organiser. Please
              note that any such commission is earned outside of the ChainFundIt
              fees or any other payment processors adopted for the campaign.
            </p>
            <p>
              <strong>"Data Protection Legislation"</strong> all applicable data
              protection and privacy legislation in force from time to time in
              the UK including UK GDPR (which has the meaning given to it in
              section 3(10) (as supplemented by section 205(4)) of the Data
              Protection Act 2018) and the Data Protection Act 2018. This also
              includes applicable data protection and privacy legislation in any
              country in which ChainFundIt is operational.
            </p>
            <p>
              <strong>"Donor"</strong> means an individual (other than the
              Chain Ambassador) who makes a donation on the Platform.
            </p>
            <p>
              <strong>"Fundraising Campaign"</strong> means raising funds from a
              social network to finance a desired goal or objective.
            </p>
            <p>
              <strong>"Platform"</strong> means ChainFundIt's crowdfunding
              platform.
            </p>
            <p>
              Words following the terms "including" or "include" or any similar
              expression are illustrative and shall not limit the sense of the
              words, phrase or term preceding those terms.
            </p>
            <p>
              Unless the context otherwise requires, words in the singular
              shall include the plural and, in the plural, shall include the
              singular.
            </p>
            <p>
              <strong>"Referral"</strong> or <strong>"Sharing"</strong> means
              the activity of introducing Donors to the Platform for the
              purpose of soliciting donations from an individual's social
              network for the benefit of the Fundraising Campaign.
            </p>
            <p>
              <strong>"Relevant Donation"</strong> means each cash donation made
              by a Donor through the Platform with the unique Chain Ambassador
              link linked to it that donations on the Chainfund are not the
              subject of dispute, challenge, or refund.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    title: "2. Commencement and Duration",
    icon: FileText,
    content: [
      {
        subtitle: "",
        text: (
          <div className="space-y-4 text-gray-700">
            <p>
              This Agreement shall commence on the date this agreement is
              accepted.
            </p>
            <p>
              This Agreement shall continue in force unless and until terminated
              in accordance with Clause 7 (the "Term").
            </p>
          </div>
        ),
      },
    ],
  },
  {
    title: "3. Referrals and Assurance",
    icon: Handshake,
    content: [
      {
        subtitle: "",
        text: (
          <div className="space-y-4 text-gray-700">
            <p>
              ChainFundIt appoints the Chain Ambassador to make Referrals on and
              subject to the terms and conditions of this Agreement.
            </p>
            <p>
              When making Referrals or otherwise performing this Agreement, the
              Chain Ambassador shall at all times:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>act promptly upon the reasonable and lawful instructions of Chainfundit;</li>
              <li>act honestly, respectfully and in good faith;</li>
              <li>act in accordance with applicable law;</li>
              <li>
                not act in a way that would damage the goodwill or reputation of
                Chainfundit and/or the applicable Fundraising Campaign;
              </li>
              <li>
                not mislead or apply any undue pressure or duress to any Donor or
                potential Donor;
              </li>
              <li>
                comply with all applicable laws relating to anti-bribery and
                anti-corruption including the Bribery Act 2010 ("BA 2010");
              </li>
              <li>
                refrain from engaging in any activity, practice or conduct
                outside the UK which would constitute an offence under sections
                1, 2 or 6 of the BA 2010 if such activity, practice or conduct
                had been carried out/inside the UK; and
              </li>
              <li>
                promptly report to ChainFundIt any request or demand for any
                undue financial or other advantage of any kind received by
                Ambassador.
              </li>
            </ul>
            <p>
              Chain Ambassador represents and warrants to ChainFundIt that they
              have not been convicted of a criminal offence (excluding any
              conviction deemed to be spent under the Rehabilitation of
              Offenders Act 1974, or other similar or applicable legislation).
            </p>
            <p>
              Chain Ambassador represents and warrants that they do not indulge
              in any obscene activity on social media channels this includes
              pornography, unauthorised content, other offensive/illegal
              materials, or links.
            </p>
            <p>
              Chain Ambassador agrees to avail his or her social media handles
              (i.e. Twitter, Facebook, TikTok, Snapchat and Instagram) to
              ChainFundIt; and Chain Ambassador equally agrees to accept any
              follow requests from ChainFundIt.
            </p>
            <p>
              Chain Ambassador agrees to follow and interact with all
              ChainFundIt's social media channels, this includes likes, sharing,
              commenting on our posts.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    title: "4. Commission and Payment",
    icon: DollarSign,
    content: [
      {
        subtitle: "",
        text: (
          <div className="space-y-4 text-gray-700">
            <p>
              Chain Ambassador is entitled to receive the Applicable Commission
              in relation to each successful Donation made on their Chainfund
              during the campaign.
            </p>
            <p>
              Applicable Commission will be calculated and paid by ChainFundIt
              periodically or at the end of the campaign. Any dispute with the
              commission should be addressed to{" "}
              <Link
                href="mailto:ambassadors@chainfundit.com"
                className="text-[#104901] hover:underline"
              >
                ambassadors@chainfundit.com
              </Link>
            </p>
            <p>
              Applicable Commission shall be paid to the Chain Ambassador in the
              currency of the applicable Fundraising Campaign that is registered
              on the Platform.
            </p>
            <p>
              Where campaigns are unable to fulfil their intended objectives, all
              donations will be refunded i.e. no commission will be payable on
              such a campaign.
            </p>
            <p>
              Applicable Commission will be subject to any and all income taxes
              payable in the jurisdiction of the Chain Ambassador and / or
              Fundraising Campaign. In any instance where such taxes are not
              deducted or withheld upon payment, ChainFundIt retains the right
              to demand for an immediate refund of these taxes from the Chain
              Ambassador (in which case such refund shall be effected within
              10 business days), or deduct same from subsequent Applicable
              Commissions payable on any other Chainfunds of the Chain
              Ambassador.
            </p>
            <p>
              ChainFundIt may set-off from any Commission any and all amount due
              to it from Chain Ambassador.
            </p>
            <p>
              ChainFundIt reserves the right to charge an administration fee of
              up to 30% on the chain commission payable to a chain ambassador on
              any fundraising campaign chained.
            </p>
            <p>
              Chain Ambassadors should be aware that any funds raised on behalf
              of a charity will be transferred directly to the charity, Chain
              Ambassadors will only receive the Applicable Commission. Under no
              circumstances should donations be sent to the Chain Ambassador's
              personal account.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    title: "5. Data Protection",
    icon: Shield,
    content: [
      {
        subtitle: "",
        text: (
          <div className="space-y-4 text-gray-700">
            <p>
              Both parties will comply with all applicable requirements of the
              Data Protection Legislation. This clause 5 is in addition to, and
              does not relieve, remove or replace, a party's obligations or
              rights under the Data Protection Legislation.
            </p>
            <p>
              The personal data that you provide to us or that we obtain about
              you will be processed in accordance with our{" "}
              <Link
                href="/privacy-policy"
                className="text-[#104901] hover:underline"
              >
                privacy policy
              </Link>
              .
            </p>
          </div>
        ),
      },
    ],
  },
  {
    title: "6. Limitation of Liability",
    icon: AlertTriangle,
    content: [
      {
        subtitle: "",
        text: (
          <div className="space-y-4 text-gray-700">
            <p>
              Nothing in this Agreement limits any liability:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>
                that cannot legally be limited, including liability for death or
                personal injury caused by negligence; or
              </li>
              <li>for fraud or fraudulent misrepresentation.</li>
            </ul>
            <p>
              Subject to clause 4.1, neither party shall be liable to the other
              for any loss arising out of the lawful termination of this
              Agreement.
            </p>
            <p>
              Subject to 4.1, ChainFundIt shall not be liable to Chain
              Ambassador for any loss (whether foreseeable or not) arising from:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>the unavailability, or functional limitations, of the Platform;</li>
              <li>
                code that may be transmitted to or through, the Platform or in
                relation to our third-party service providers;
              </li>
              <li>
                any errors, inaccuracies, omissions, or losses in or to any data
                provided to us; or
              </li>
              <li>circumstances beyond our reasonable control.</li>
            </ul>
            <p>
              Subject to clause 4.1, each party shall be liable to the other
              for any foreseeable loss suffered as a result of the party's:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>breach of any provision of this Agreement; or</li>
              <li>negligence or willful default.</li>
            </ul>
            <p>
              Subject to clause 4.1, the maximum aggregate liability under or in
              connection with this Agreement, whether in contract, tort
              (including negligence) or otherwise of:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>
                ChainFundIt to Chain Ambassador, shall not exceed the Commission
                payable to the Chain Ambassador in the twelve months preceding
                the date the claim arose; and
              </li>
              <li>
                Chain Ambassador to ChainFundIt, shall not exceed the greater of
                two times the Commission paid to Chain Ambassador.
              </li>
            </ul>
          </div>
        ),
      },
    ],
  },
  {
    title: "7. Termination",
    icon: AlertTriangle,
    content: [
      {
        subtitle: "",
        text: (
          <div className="space-y-4 text-gray-700">
            <p>
              ChainFundIt may terminate this Agreement with immediate effect by
              giving notice to Chain Ambassador at any time if:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>The Fundraising Campaign goal has been reached;</li>
              <li>
                There has been no activity on the Chain Agent's payment link
                within 14 days of receiving Chainfund;
              </li>
              <li>We suspect an abuse of the Fundraising Campaign; or</li>
              <li>
                ChainFundIt ceases to operate the Fundraising Campaign to which
                this Agreement relates.
              </li>
            </ul>
            <p>
              Chain Ambassador may terminate this Agreement at any point. However,
              ChainFundIt is not obliged to deactivate Chain Ambassador's
              Chainfund link. For the avoidance of doubt, the Chain Ambassador
              will no longer earn any Commission from proceeds received from
              Beneficiary's Fundraising Campaign.
            </p>
            <p>
              Clauses 2, 4, 6.10 and 6.1 shall continue in force despite
              termination.
            </p>
            <p>
              Termination of this Agreement shall not affect any of the rights,
              remedies, obligations or liabilities of the parties that have
              accrued up to the date of termination.
            </p>
            <p>
              ChainFundIt reserves the right to monitor the activity of the Chain
              Ambassador in relation to the campaign the ambassador has opted
              to chain. Hence, ChainFundIt reserves the right to withdraw or
              deactivate the Chain Ambassador's chain page and/or deny subsequent
              applications by the Chain Ambassador to chain a campaign page(s)
              should we find that the Chain Ambassador is passive in promoting
              the ChainFundIt campaign(s).
            </p>
          </div>
        ),
      },
    ],
  },
  {
    title: "8. General",
    icon: Gavel,
    content: [
      {
        subtitle: "8.1 Entire Agreement",
        text: (
          <p className="text-gray-700">
            This Agreement constitutes the entire agreement between the parties
            relating to its subject matter.
          </p>
        ),
      },
      {
        subtitle: "8.2 Assignment",
        text: (
          <p className="text-gray-700">
            This Agreement is personal to the Chain Ambassador and the Chain
            Ambassador may not assign, transfer or sub-contract or deal in any
            other manner with its rights under this Agreement.
          </p>
        ),
      },
      {
        subtitle: "8.3 No partnership or agency",
        text: (
          <p className="text-gray-700">
            Nothing in this Agreement is intended to, or shall be deemed to,
            establish a partnership or joint venture between the parties,
            constitute any party the agent of another party, or authorise any
            party to make or enter into any commitments for or on behalf of
            any other party. The relationship of employer and employee shall not
            exist between the parties. Each party confirms it is acting on its
            own behalf and not for the benefit of any other person.
          </p>
        ),
      },
      {
        subtitle: "8.4 Variation",
        text: (
          <div className="space-y-3 text-gray-700">
            <p>
              ChainFundIt may vary the terms and conditions of this Agreement
              without requiring the consent of the Chain Agent for the following
              reasons:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>
                to reflect changes in the way ChainFundIt operates the business,
                the Chain funding scheme or the Platform or if changes are made
                to ChainFundIt's systems, policies, processes or standards; and
              </li>
              <li>
                to adapt to changes in law, regulation or industry guidance or
                implementing changes as a result of the decisions of a court,
                regulator or ombudsman.
              </li>
            </ul>
            <p>
              ChainFundIt will aim to give Chain Ambassador at least 7 days'
              notice of any change to these terms and conditions by notifying
              Chain ambassador through the Platform or by email but this may not
              always be possible.
            </p>
            <p>
              If Chain Ambassador does not agree with the changes ChainFundIt
              may make then Chain Agent may terminate this Agreement in
              accordance with clause 7.1(a). By continuing to participate in
              the chaining scheme after changes to the terms and conditions of
              this Agreement, Chain Agent agrees to be bound by the amended
              terms.
            </p>
          </div>
        ),
      },
      {
        subtitle: "8.5 No automatic waiver",
        text: (
          <p className="text-gray-700">
            No failure or delay by a party to exercise any right or remedy
            provided under this Agreement or by law shall constitute a waiver of
            that or any other right or remedy, nor shall it prevent or restrict
            the further exercise of that or any other right or remedy.
          </p>
        ),
      },
      {
        subtitle: "8.6 Severance",
        text: (
          <p className="text-gray-700">
            If any part of this Agreement is or becomes invalid, illegal or
            unenforceable, it shall be deemed modified to the minimum extent
            necessary to make it valid, legal and enforceable. If such
            modification is not possible, the relevant part shall be deemed
            deleted. Any modification to or deletion of a provision or
            part-provision under this clause shall not affect the validity and
            enforceability of the rest of this Agreement.
          </p>
        ),
      },
      {
        subtitle: "8.7 Notices",
        text: (
          <div className="space-y-3 text-gray-700">
            <p>
              Any notice or other communication given to a party under this
              Agreement shall be in writing and sent by email to the email
              address specified in the Contract Details.
            </p>
            <p>
              Any notice or communication shall be deemed to have been received
              if sent by email, at the time of transmission, or, if this time
              falls outside Business Hours, when Business Hours resume.
            </p>
          </div>
        ),
      },
      {
        subtitle: "8.8 Counterparty",
        text: (
          <p className="text-gray-700">
            This Agreement may be executed in counterpart.
          </p>
        ),
      },
      {
        subtitle: "8.9 Third Party Rights",
        text: (
          <p className="text-gray-700">
            Except for Chainfundit who may benefit from and enforce any right of
            Chainfundit Nigeria Limited under this Agreement, no provision of
            this Agreement shall be enforceable under the Contracts (Rights of
            Third Parties) Act 1999 by any person who is not a party to it.
          </p>
        ),
      },
      {
        subtitle: "8.10 Governing Law",
        text: (
          <div className="space-y-3 text-gray-700">
            <p>
              This Agreement shall be governed by and construed in accordance
              with the laws of England and Wales for Fundraising Campaigns
              originating in the UK and US, and laws of Nigeria for Fundraising
              Campaigns originated in Nigeria.
            </p>
            <p>
              This Agreement and any matter, dispute or claim (whether
              contractual or otherwise) arising out of or in connection with it,
              including any question regarding its existence, validity or
              termination, shall be referred to and finally resolved by
              arbitration by the International Court of Arbitration. Nothing in
              this Agreement shall affect the right to serve process in any
              manner permitted by law.
            </p>
            <p>
              Its subject matter or formation (including non-contractual
              disputes or claims) shall be governed by and construed in
              accordance with either English or Nigerian law.
            </p>
            <p>
              All activities of the chain ambassadors should be carried out in
              line with all extant regulations and laws.
            </p>
          </div>
        ),
      },
      {
        subtitle: "8.11 Jurisdiction",
        text: (
          <div className="space-y-3 text-gray-700">
            <p>
              The seat or legal place of arbitration shall be London, England, or
              Nigeria, dependent on the country where the Fundraising Campaign
              was originated and the language to be used in the arbitral
              proceedings shall be English.
            </p>
            <p>
              Each party irrevocably agrees that the courts of England and Wales
              shall have non-exclusive jurisdiction to settle any dispute or
              claim arising out of or in connection with this agreement or its
              subject matter or formation (including non-contractual disputes or
              claims). (Whether contractual or otherwise)
            </p>
          </div>
        ),
      },
    ],
  },
];

export default function AmbassadorAgreementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />

      <div className="relative bg-gradient-to-r from-green-600 to-[#104901] mt-16 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Handshake className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Ambassador Agreement
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
            Terms & Conditions for Chain Ambassadors
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Contract Details */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Contract Details
              </h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Parties:</strong> ChainFundIt Limited and Chain
                  Ambassador
                </p>
                <p>
                  <strong>Effective Date:</strong> Upon acceptance of this
                  Agreement
                </p>
                <p>
                  <strong>Contact:</strong>{" "}
                  <Link
                    href="mailto:ambassadors@chainfundit.com"
                    className="text-[#104901] hover:underline"
                  >
                    ambassadors@chainfundit.com
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Terms & Conditions */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Terms & Conditions
              </h2>
              <p className="text-gray-700 leading-relaxed">
                This Agreement sets out the terms and conditions under which you
                may participate as a Chain Ambassador in ChainFundIt's
                ambassador program. By accepting this Agreement, you agree to be
                bound by all terms and conditions set forth herein.
              </p>
            </CardContent>
          </Card>
        </div>

        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div key={index} className="mb-8">
          <Card>
            <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Icon className="h-6 w-6 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {section.title}
              </h2>
                  </div>
                  <div className="space-y-6">
                    {section.content.map((item, idx) => (
                      <div key={idx}>
                        {item.subtitle && (
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            {item.subtitle}
                          </h3>
                        )}
                        <div className="text-gray-700 leading-relaxed">
                          {item.text}
                        </div>
                      </div>
                    ))}
              </div>
            </CardContent>
          </Card>
        </div>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}
