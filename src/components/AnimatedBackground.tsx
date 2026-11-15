export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-40 dark:opacity-20 transition-opacity duration-1000">
      {/* Dynamic drifting ambient spots */}
      <div className="absolute top-[10%] left-[20%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-blue-300 dark:bg-blue-900/30 blur-[80px] sm:blur-[120px] animate-pulse duration-[8000ms] ease-in-out infinite"></div>
      <div className="absolute bottom-[15%] right-[10%] w-[300px] sm:w-[450px] h-[300px] sm:h-[440px] rounded-full bg-indigo-300 dark:bg-indigo-900/20 blur-[90px] sm:blur-[130px] animate-pulse duration-[10000ms] ease-in-out infinite delay-1000"></div>
      <div className="absolute top-[50%] left-[60%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-violet-300 dark:bg-violet-900/20 blur-[80px] sm:blur-[110px] animate-pulse duration-[12000ms] ease-in-out infinite delay-3000"></div>
      
      {/* Light grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
    </div>
  );
}
