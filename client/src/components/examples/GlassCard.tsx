import GlassCard from '../GlassCard';

export default function GlassCardExample() {
  return (
    <div className="bg-black p-8">
      <GlassCard>
        <h3 className="text-2xl font-light text-foreground mb-2">Portfolio Value</h3>
        <p className="text-5xl font-extralight text-foreground">$124,582.32</p>
        <p className="text-sm text-muted-foreground mt-2">+$2,341.18 (1.92%) today</p>
      </GlassCard>
    </div>
  );
}
