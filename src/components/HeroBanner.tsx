import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-[620px] overflow-hidden md:min-h-[720px]"
    >
      <Image
        src="/images/bamboo-7.webp"
        alt="晨光中的竹林与中式養生空间"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center brightness-[1.05] contrast-[0.92] saturate-[0.78]"
      />

      {/* 左侧米白色柔和漸層 */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F6F1E8]/95 via-[#F6F1E8]/65 to-[#F6F1E8]/10" />

      {/* 輕微暖光 */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#F6F1E8]/20 via-transparent to-white/15" />

      <div className="relative z-10 mx-auto flex min-h-[620px] max-w-7xl items-center px-6 py-16 md:min-h-[720px] md:px-12 lg:px-20">
        <div className="max-w-2xl">
          <p className="mb-5 text-sm font-medium tracking-[0.2em] text-[#735A36]">
            中醫養生・预防保健・全人健康管理
          </p>

          <h1 className="text-4xl font-semibold leading-[1.2] text-[#46644D] sm:text-5xl lg:text-6xl">
            以中醫智慧
            <br />
            守護您與家人的健康
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-[#4B514B] md:text-lg">
            结合傳统中醫智慧与現代健康管理，
            陪伴您建立自然、安定且能够長期维持的養生生活。
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a
              href="#appointment"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#46644D] px-7 py-3.5 font-medium text-white transition hover:bg-[#395440]"
            >
              预约健康咨詢
            </a>

            <a
              href="#services"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/60 px-7 py-3.5 font-medium text-[#46644D] backdrop-blur-md transition hover:bg-white/80"
            >
              了解養生服務
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}


