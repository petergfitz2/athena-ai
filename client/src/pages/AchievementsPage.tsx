import Navigation from "@/components/Navigation";
import NavigationBreadcrumbs from "@/components/NavigationBreadcrumbs";
import BackButton from "@/components/BackButton";
import AchievementSystem from "@/components/AchievementSystem";

export default function AchievementsPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <NavigationBreadcrumbs />
      
      <div className="px-6 sm:px-10 lg:px-16 py-8 lg:py-12">
        <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <BackButton />
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-foreground tracking-tight mt-4 mb-3">
              Achievements & Rewards
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground font-light">
              Track your progress and unlock exclusive rewards
            </p>
          </div>

          {/* Achievement System Component */}
          <AchievementSystem />
        </div>
      </div>
    </div>
  );
}