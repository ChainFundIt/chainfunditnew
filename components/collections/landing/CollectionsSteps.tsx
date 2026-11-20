"use client";

const steps = [
  {
    number: "01",
    label: "Create your pot",
    description:
      "Collections are free to start. Pick the occasion, add a target and a closing date, and you are ready in a couple of minutes.",
    bgColor: "bg-[#FFCF55]",
    textColor: "text-black",
  },
  {
    number: "02",
    label: "Share the link",
    description:
      "Send it on WhatsApp, Messenger, email, SMS, or anywhere your group already talks. No one needs your bank details.",
    bgColor: "bg-[#59AD4A]",
    textColor: "text-white",
  },
  {
    number: "03",
    label: "They pay in seconds",
    description:
      "Friends pay by card or PayPal. No account, no app download, and the total updates as soon as they chip in.",
    bgColor: "bg-[#EDECE0]",
    textColor: "text-black",
  },
  {
    number: "04",
    label: "Spend the money",
    description:
      "Keep group money separate from your own account, then withdraw when you are ready to buy the gift or cover the plan.",
    bgColor: "bg-[#104109]",
    textColor: "text-white",
  },
];

const CollectionsSteps = () => {
  return (
    <div className="font-jakarta flex items-center justify-center bg-white py-20 px-8">
      <div className="flex flex-col gap-16 md:max-w-[80rem] w-full">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="px-3 py-1 bg-[#ECFDF5] rounded-full">
            <div className="font-bold text-xs leading-4 uppercase text-[#059669]">
              How collections work
            </div>
          </div>
          <div className="font-bold text-4xl leading-10 text-[#1C1917] max-w-3xl">
            Organise the things you love with the people you love
          </div>
          <div className="font-normal text-base leading-6 text-[#78716C] max-w-2xl">
            Chasing people for money is awkward. Share one link, let everyone
            chip in, and keep a clear record of who has paid.
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full justify-center items-stretch">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`${step.bgColor} ${step.textColor} rounded-3xl p-8 gap-2 flex flex-col md:w-[18rem] w-full`}
            >
              <div className="font-extrabold text-3xl leading-[48px]">
                {step.number}
              </div>
              <div className="font-bold text-lg leading-7">{step.label}</div>
              <div className="font-medium text-sm leading-5 bg-white/20 p-4 rounded-xl">
                {step.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionsSteps;
