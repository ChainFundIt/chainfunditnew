import Link from "next/link";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-50 px-6">
      <h1 className="text-6xl font-bold text-[#161616] mb-4">404</h1>
      <DotLottieReact
      src="https://lottie.host/150eb528-1aad-47fa-938c-2cb6f665c6e7/UIJAlrFpRX.lottie"
      loop
      autoplay
    />
      <Link
        href="/dashboard"
        className="bg-[#161616] text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
      >
       Go Back Home
      </Link>
    </div>
  );
}