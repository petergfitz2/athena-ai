import DashboardHeader from '../DashboardHeader';

export default function DashboardHeaderExample() {
  return (
    <div className="bg-black min-h-screen">
      <DashboardHeader onLogout={() => console.log('Logged out')} />
      <div className="p-8">
        <p className="text-foreground">Dashboard content goes here...</p>
      </div>
    </div>
  );
}
